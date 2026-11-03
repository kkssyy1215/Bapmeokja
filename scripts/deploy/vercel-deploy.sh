#!/usr/bin/env bash
# 백엔드와 웹 화면을 Vercel에 배포한다. 비밀값은 출력하지 않는다.
# 준비: .env.vercel(AIVEN_SERVICE_URI), .env(GEMINI_API_KEY, 선택), `npx vercel login`
set -euo pipefail
cd "$(dirname "$0")/../.."

VERCEL="${VERCEL_BIN:-npx --yes vercel}"
[ -f .env.vercel ] || { echo "ERROR: .env.vercel이 없습니다. cp deploy.vercel.example .env.vercel" >&2; exit 1; }

value_of() { grep -E "^$1=" "$2" 2>/dev/null | tail -1 | cut -d= -f2- || true; }

AIVEN_SERVICE_URI="$(value_of AIVEN_SERVICE_URI .env.vercel)"
API_PROJECT="$(value_of VERCEL_API_PROJECT .env.vercel)"; API_PROJECT="${API_PROJECT:-bapmeokja-api}"
WEB_PROJECT="$(value_of VERCEL_WEB_PROJECT .env.vercel)"; WEB_PROJECT="${WEB_PROJECT:-bapmeokja-web}"
GEMINI_API_KEY="$(value_of GEMINI_API_KEY .env)"
JWT_SECRET="$(value_of JWT_SECRET .env.vercel)"
[ -n "$AIVEN_SERVICE_URI" ] || { echo "ERROR: .env.vercel에 AIVEN_SERVICE_URI를 넣어 주세요." >&2; exit 1; }

# mysql://user:password@host:port/db?ssl-mode=REQUIRED 를 JDBC 값으로 나눈다.
eval "$(AIVEN_SERVICE_URI="$AIVEN_SERVICE_URI" python3 - <<'PY'
import os, shlex
from urllib.parse import urlsplit, unquote
uri = urlsplit(os.environ["AIVEN_SERVICE_URI"])
if uri.scheme != "mysql" or not (uri.hostname and uri.port and uri.username and uri.password):
    raise SystemExit("ERROR: AIVEN_SERVICE_URI 형식이 mysql://user:password@host:port/db 가 아닙니다.")
# Aiven 기본 defaultdb 대신 앱 전용 데이터베이스를 쓴다. 없으면 첫 접속 때 만든다.
jdbc = (f"jdbc:mysql://{uri.hostname}:{uri.port}/bapmeokja"
        "?createDatabaseIfNotExist=true&sslMode=REQUIRED&useUnicode=true&characterEncoding=utf8&serverTimezone=UTC")
print(f"DB_URL={shlex.quote(jdbc)}")
print(f"DB_USERNAME={shlex.quote(unquote(uri.username))}")
print(f"DB_PASSWORD={shlex.quote(unquote(uri.password))}")
PY
)"

if [ -z "$JWT_SECRET" ]; then
  JWT_SECRET="$(openssl rand -base64 48 | tr -d '\n')"
  printf '\nJWT_SECRET=%s\n' "$JWT_SECRET" >> .env.vercel
  echo "JWT_SECRET을 새로 만들어 .env.vercel에 저장했습니다."
fi

set_env() { # 프로젝트 폴더, 이름, 값
  printf '%s' "$3" | $VERCEL env add "$2" --environment production --force --yes --cwd "$1" >/dev/null
}

deployment_url() { grep -oE 'https://[a-zA-Z0-9.-]+\.vercel\.app' | tail -1; }

# --cwd를 줘도 CLI는 실행한 폴더의 vercel.json을 함께 보내므로, 서버 배포는 backend 안에서 실행한다.
deploy_backend() { (cd backend && $VERCEL deploy --prod --yes); }

production_url() { # 프로젝트 폴더, 배포 주소
  $VERCEL inspect "$2" --cwd "$1" 2>&1 | grep -oE 'https://[a-zA-Z0-9.-]+\.vercel\.app' \
    | awk 'length($0) < best || best == 0 { best = length($0); url = $0 } END { print url }'
}

# Vercel은 약 27초 안에 포트가 열리지 않으면 인스턴스를 끝낸다. 테이블 생성 도중 끝나면 스키마가 반만
# 남으므로 마이그레이션은 여기서 끝내고, 배포된 서버에서는 Flyway를 끈다.
migrate_database() {
  docker build -q -t bapmeokja-backend backend >/dev/null
  docker rm -f bapmeokja-migrate >/dev/null 2>&1 || true
  DB_URL="$DB_URL" DB_USERNAME="$DB_USERNAME" DB_PASSWORD="$DB_PASSWORD" JWT_SECRET="$JWT_SECRET" \
    docker run -d --name bapmeokja-migrate -e DB_URL -e DB_USERNAME -e DB_PASSWORD -e JWT_SECRET \
    -e SPRING_PROFILES_ACTIVE=prod -e CORS_ALLOWED_ORIGINS=http://localhost bapmeokja-backend >/dev/null
  local status=1 i
  for i in $(seq 1 90); do
    if docker logs bapmeokja-migrate 2>&1 | grep -q 'Started .*Application'; then status=0; break; fi
    [ "$(docker inspect -f '{{.State.Running}}' bapmeokja-migrate)" = "true" ] || break
    sleep 2
  done
  [ "$status" -eq 0 ] || docker logs bapmeokja-migrate 2>&1 | grep -E 'ERROR|Caused by' | head -5 >&2
  docker rm -f bapmeokja-migrate >/dev/null
  return "$status"
}

echo "[0/5] DB 테이블 생성 (이미 있으면 건너뜀)"
migrate_database || { echo "ERROR: DB 마이그레이션에 실패했습니다." >&2; exit 1; }

echo "[1/5] Vercel 프로젝트 연결"
$VERCEL project create "$API_PROJECT" >/dev/null 2>&1 || true
$VERCEL project create "$WEB_PROJECT" >/dev/null 2>&1 || true
# link는 .gitignore와 .env.local을 고치므로 처음 한 번만 실행한다.
[ -f backend/.vercel/project.json ] || $VERCEL link --yes --cwd backend --project "$API_PROJECT" >/dev/null
[ -f .vercel/project.json ] || $VERCEL link --yes --cwd . --project "$WEB_PROJECT" >/dev/null

# DB가 있는 싱가포르에서 서버를 실행한다. vercel.json의 regions는 컨테이너에 적용되지 않는다.
TEAM_ID="$(python3 -c 'import json; print(json.load(open("backend/.vercel/project.json"))["orgId"])')"
echo '{"serverlessFunctionRegion":"sin1"}' | $VERCEL api "/v9/projects/$API_PROJECT?teamId=$TEAM_ID" -X PATCH --input - >/dev/null

echo "[2/5] 서버 환경변수 설정 (값은 출력하지 않음)"
set_env backend DB_URL "$DB_URL"
set_env backend DB_USERNAME "$DB_USERNAME"
set_env backend DB_PASSWORD "$DB_PASSWORD"
set_env backend JWT_SECRET "$JWT_SECRET"
set_env backend SPRING_FLYWAY_ENABLED false
[ -z "$GEMINI_API_KEY" ] || set_env backend GEMINI_API_KEY "$GEMINI_API_KEY"
# 웹 주소를 알기 전 첫 배포에 필요한 임시 값. 4단계 뒤 실제 주소로 바꾼다.
set_env backend CORS_ALLOWED_ORIGINS "https://$WEB_PROJECT.vercel.app"

echo "[3/5] 서버 배포 (첫 빌드는 몇 분 걸립니다)"
API_DEPLOYMENT="$(deploy_backend | deployment_url)"
API_URL="$(production_url backend "$API_DEPLOYMENT")"
[ -n "$API_URL" ] || { echo "ERROR: 서버 주소를 찾지 못했습니다: $API_DEPLOYMENT" >&2; exit 1; }
echo "      서버: $API_URL"

echo "[4/5] 웹 화면 배포"
set_env . EXPO_PUBLIC_USE_MOCKS false
set_env . EXPO_PUBLIC_API_URL "$API_URL/v1"
WEB_DEPLOYMENT="$($VERCEL deploy --prod --yes --cwd . | deployment_url)"
WEB_URL="$(production_url . "$WEB_DEPLOYMENT")"
[ -n "$WEB_URL" ] || { echo "ERROR: 웹 주소를 찾지 못했습니다: $WEB_DEPLOYMENT" >&2; exit 1; }
echo "      웹: $WEB_URL"

echo "[5/5] 서버에 실제 웹 주소 허용"
if [ "$WEB_URL" != "https://$WEB_PROJECT.vercel.app" ]; then
  set_env backend CORS_ALLOWED_ORIGINS "$WEB_URL"
  deploy_backend >/dev/null
fi

printf 'API_URL=%s\nWEB_URL=%s\n' "$API_URL" "$WEB_URL" > .vercel-urls
echo
echo "완료"
echo "  웹:   $WEB_URL"
echo "  서버: $API_URL/actuator/health"
