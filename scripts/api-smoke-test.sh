#!/usr/bin/env bash
set -euo pipefail

BAP_API_BASE="${BAP_API_BASE:-http://127.0.0.1:8080/v1}"
BAP_SUFFIX="$(date +%s)"
BAP_USERNAME="smoke${BAP_SUFFIX}"
BAP_EMAIL="smoke${BAP_SUFFIX}@example.com"
BAP_NICKNAME="스모크${BAP_SUFFIX: -8}"
BAP_PASSWORD='Smoke!234'
BAP_TODAY="$(date +%F)"
BAP_EATEN_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
BAP_ACCESS_TOKEN=''
BAP_ACCOUNT_CREATED=false

json_value() {
  python3 -c 'import json,sys; data=json.load(sys.stdin); value=data; [value := value[key] for key in sys.argv[1].split(".")]; print(value)' "$1"
}

cleanup() {
  if [[ "$BAP_ACCOUNT_CREATED" == true && -n "$BAP_ACCESS_TOKEN" ]]; then
    curl --silent --show-error --fail-with-body \
      --request DELETE "$BAP_API_BASE/users/account" \
      --header "Authorization: Bearer $BAP_ACCESS_TOKEN" \
      --header 'Content-Type: application/json' \
      --data "{\"currentPassword\":\"$BAP_PASSWORD\"}" >/dev/null || true
  fi
}
trap cleanup EXIT

echo "[1/10] health"
curl --silent --show-error --fail-with-body "${BAP_API_BASE%/v1}/actuator/health" | grep -q '"status":"UP"'

echo "[2/10] duplicate checks"
curl --silent --show-error --fail-with-body --get "$BAP_API_BASE/auth/check/username" \
  --data-urlencode "value=$BAP_USERNAME" | grep -q '"isDuplicated":false'

echo "[3/10] register"
BAP_REGISTER_RESPONSE="$(curl --silent --show-error --fail-with-body \
  --request POST "$BAP_API_BASE/auth/register" \
  --header 'Content-Type: application/json' \
  --data "{\"nickname\":\"$BAP_NICKNAME\",\"name\":\"스모크 테스트\",\"email\":\"$BAP_EMAIL\",\"username\":\"$BAP_USERNAME\",\"password\":\"$BAP_PASSWORD\",\"passwordConfirm\":\"$BAP_PASSWORD\",\"agreeTerms\":true,\"agreePrivacy\":true}")"
echo "$BAP_REGISTER_RESPONSE" | grep -q '"success":true'
BAP_ACCOUNT_CREATED=true

echo "[4/10] login"
BAP_LOGIN_RESPONSE="$(curl --silent --show-error --fail-with-body \
  --request POST "$BAP_API_BASE/auth/login" \
  --header 'Content-Type: application/json' \
  --data "{\"username\":\"$BAP_USERNAME\",\"password\":\"$BAP_PASSWORD\"}")"
BAP_ACCESS_TOKEN="$(printf '%s' "$BAP_LOGIN_RESPONSE" | json_value data.accessToken)"
test -n "$BAP_ACCESS_TOKEN"

echo "[5/10] initialize profile and settings"
curl --silent --show-error --fail-with-body \
  --request POST "$BAP_API_BASE/users/profile/initial" \
  --header "Authorization: Bearer $BAP_ACCESS_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{"gender":"F","age":24,"height":163,"weight":55,"activityLevel":"MODERATE","goal":"MAINTAIN"}' \
  | grep -q '"dailyCalorieGoal"'
curl --silent --show-error --fail-with-body \
  --request PUT "$BAP_API_BASE/users/settings/budget" \
  --header "Authorization: Bearer $BAP_ACCESS_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{"diningOut":12500,"homeCooking":7500}' | grep -q '"success":true'
curl --silent --show-error --fail-with-body \
  --request PUT "$BAP_API_BASE/users/settings/notification" \
  --header "Authorization: Bearer $BAP_ACCESS_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{"pushEnabled":true,"waterReminderEnabled":true,"breakfastTime":"08:00","lunchTime":"12:30","dinnerTime":"19:00","expiryAlertEnabled":true}' \
  | grep -q '"success":true'
curl --silent --show-error --fail-with-body "$BAP_API_BASE/users/profile" \
  --header "Authorization: Bearer $BAP_ACCESS_TOKEN" | grep -q '"diningOut":12500'

echo "[6/10] diet record and statistics"
curl --silent --show-error --fail-with-body \
  --request POST "$BAP_API_BASE/diet/records/manual" \
  --header "Authorization: Bearer $BAP_ACCESS_TOKEN" \
  --header 'Content-Type: application/json' \
  --data "{\"mealType\":\"LUNCH\",\"eatenAt\":\"$BAP_EATEN_AT\",\"items\":[{\"name\":\"스모크 샐러드\",\"weightGram\":180,\"calorie\":320,\"carb\":32,\"protein\":24,\"fat\":10}]}" \
  | grep -q '"recordId"'
curl --silent --show-error --fail-with-body --get "$BAP_API_BASE/diet/records" \
  --header "Authorization: Bearer $BAP_ACCESS_TOKEN" \
  --data-urlencode "date=$BAP_TODAY" | grep -q '"totalCalorie":320'
curl --silent --show-error --fail-with-body --get "$BAP_API_BASE/statistics/daily" \
  --header "Authorization: Bearer $BAP_ACCESS_TOKEN" \
  --data-urlencode "date=$BAP_TODAY" | grep -q '"success":true'

echo "[7/10] fridge"
curl --silent --show-error --fail-with-body \
  --request POST "$BAP_API_BASE/fridge/ingredients" \
  --header "Authorization: Bearer $BAP_ACCESS_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{"ingredients":[{"name":"스모크 양파","quantity":2,"unit":"개"}]}' \
  | grep -q '"registeredCount":1'
curl --silent --show-error --fail-with-body "$BAP_API_BASE/fridge/ingredients" \
  --header "Authorization: Bearer $BAP_ACCESS_TOKEN" | grep -q '스모크 양파'

echo "[8/10] community"
BAP_POST_RESPONSE="$(curl --silent --show-error --fail-with-body \
  --request POST "$BAP_API_BASE/community/posts" \
  --header "Authorization: Bearer $BAP_ACCESS_TOKEN" \
  --form 'content=스모크 테스트 게시물' \
  --form "eatenAt=$BAP_EATEN_AT" \
  --form 'calorie=320' \
  --form 'carb=32' \
  --form 'protein=24' \
  --form 'fat=10')"
BAP_POST_ID="$(printf '%s' "$BAP_POST_RESPONSE" | json_value data.postId)"
test -n "$BAP_POST_ID"
curl --silent --show-error --fail-with-body \
  --request POST "$BAP_API_BASE/community/posts/$BAP_POST_ID/comments" \
  --header "Authorization: Bearer $BAP_ACCESS_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{"content":"스모크 댓글"}' | grep -q '"commentId"'
curl --silent --show-error --fail-with-body \
  --request POST "$BAP_API_BASE/community/posts/$BAP_POST_ID/likes" \
  --header "Authorization: Bearer $BAP_ACCESS_TOKEN" | grep -q '"isLiked":true'

echo "[9/10] authenticated dashboard and catalog"
curl --silent --show-error --fail-with-body "$BAP_API_BASE/home/dashboard" \
  --header "Authorization: Bearer $BAP_ACCESS_TOKEN" | grep -q '"tomatoStatus"'
curl --silent --show-error --fail-with-body "$BAP_API_BASE/menu/recommend/summary" \
  --header "Authorization: Bearer $BAP_ACCESS_TOKEN" | grep -q '"success":true'

echo "[10/10] account cleanup"
cleanup
BAP_ACCOUNT_CREATED=false
echo "Bapmeokja API smoke test passed."
