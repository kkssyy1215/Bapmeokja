"""밥먹자 QA 공용 모듈: HTTP 클라이언트, 요청·응답 로그, DB 검증, 결과 기록."""

from __future__ import annotations

import json
import os
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

BASE = os.environ.get("BAP_API_BASE", "http://127.0.0.1:8080/v1").rstrip("/")
ORIGIN = BASE.rsplit("/v1", 1)[0]
MYSQL_CONTAINER = os.environ.get("BAP_MYSQL_CONTAINER", "bapmeokja-mysql-1")
ROOT = Path(__file__).resolve().parents[2]
RESULT_DIR = ROOT / "docs" / "test" / "results"
PASSWORD = "Qa!test1234"

# 1x1 PNG, 실제 이미지 바이트
PNG_BYTES = bytes.fromhex(
    "89504e470d0a1a0a0000000d4948445200000001000000010806000000"
    "1f15c4890000000d49444154789c6360f8cfc0f01f0005000201a5f6"
    "45400000000049454e44ae426082"
)


@dataclass
class Response:
    status: int
    body: dict | None
    raw: bytes
    elapsed_ms: int

    @property
    def data(self):
        return (self.body or {}).get("data")

    @property
    def error_code(self):
        return (self.body or {}).get("errorCode")


@dataclass
class LogEntry:
    method: str
    path: str
    request: object
    status: int
    response: object
    elapsed_ms: int


class Client:
    def __init__(self, log: list[LogEntry]):
        self.log = log
        self.access: str | None = None
        self.refresh: str | None = None

    def call(self, method, path, *, json_body=None, params=None, files=None, form=None,
             auth=True, token=None, raw_url=None) -> Response:
        url = raw_url or (BASE + path)
        if params:
            url += "?" + urllib.parse.urlencode({k: v for k, v in params.items() if v is not None})
        headers = {"Accept": "application/json"}
        data = None
        logged_req: object = None
        if json_body is not None:
            data = json.dumps(json_body).encode()
            headers["Content-Type"] = "application/json"
            logged_req = redact(json_body)
        elif files is not None or form is not None:
            boundary = uuid.uuid4().hex
            data = multipart(boundary, form or {}, files or {})
            headers["Content-Type"] = f"multipart/form-data; boundary={boundary}"
            logged_req = {"form": form or {}, "files": {k: f"{v[0]} ({v[1]}, {len(v[2])}B)" for k, v in (files or {}).items()}}
        bearer = token if token is not None else (self.access if auth else None)
        if bearer:
            headers["Authorization"] = f"Bearer {bearer}"
        req = urllib.request.Request(url, data=data, method=method, headers=headers)
        started = time.perf_counter()
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                status, raw = res.status, res.read()
        except urllib.error.HTTPError as err:
            status, raw = err.code, err.read()
        elapsed = int((time.perf_counter() - started) * 1000)
        try:
            body = json.loads(raw) if raw and raw[:1] in (b"{", b"[") else None
        except json.JSONDecodeError:
            body = None
        shown_path = url.replace(ORIGIN, "")
        self.log.append(LogEntry(method, shown_path, logged_req, status,
                                 redact(body) if body is not None else f"<{len(raw)} bytes>", elapsed))
        return Response(status, body, raw, elapsed)

    def login(self, username, password=PASSWORD) -> Response:
        res = self.call("POST", "/auth/login", json_body={"username": username, "password": password}, auth=False)
        if res.status == 200:
            self.access = res.data["accessToken"]
            self.refresh = res.data["refreshToken"]
        return res


def multipart(boundary: str, form: dict, files: dict) -> bytes:
    out = bytearray()
    for name, value in form.items():
        out += f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n".encode()
    for name, (filename, ctype, content) in files.items():
        out += (f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"; filename=\"{filename}\"\r\n"
                f"Content-Type: {ctype}\r\n\r\n").encode()
        out += content + b"\r\n"
    out += f"--{boundary}--\r\n".encode()
    return bytes(out)


SECRET_KEYS = {"password", "passwordConfirm", "currentPassword", "newPassword", "newPasswordConfirm",
               "accessToken", "refreshToken", "deviceToken"}


def redact(value):
    if isinstance(value, dict):
        return {k: ("***" if k in SECRET_KEYS and v else redact(v)) for k, v in value.items()}
    if isinstance(value, list):
        return [redact(v) for v in value]
    return value


def db_scalar(sql: str) -> str:
    cmd = ["docker", "exec", MYSQL_CONTAINER, "sh", "-c",
           f'mysql -ubapmeokja -p"$MYSQL_PASSWORD" bapmeokja -N -B -e "{sql}" 2>/dev/null']
    out = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    return out.stdout.strip()


def sql_str(value: str) -> str:
    return "'" + value.replace("\\", "").replace("'", "") + "'"


def new_user(client: Client, tag: str) -> dict:
    suffix = uuid.uuid4().hex[:8]
    user = {
        "username": f"qa{tag}{suffix}",
        "email": f"qa{tag}{suffix}@example.com",
        "nickname": f"큐에이{suffix[:6]}",
        "name": "테스트",
        "password": PASSWORD,
        "passwordConfirm": PASSWORD,
        "agreeTerms": True,
        "agreePrivacy": True,
    }
    return user


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def write_log_markdown(path: Path, title: str, log: list[LogEntry], limit: int = 1500):
    lines = [f"# {title}", "", f"- 생성 시각: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
             f"- 대상 서버: `{BASE}`", f"- 총 요청 수: {len(log)}", "",
             "민감 값(비밀번호, 토큰, 기기 토큰)은 `***`로 가렸습니다. 긴 응답은 잘라서 표시했습니다.", ""]
    for i, e in enumerate(log, 1):
        req = json.dumps(e.request, ensure_ascii=False, indent=2) if e.request is not None else "(없음)"
        res = json.dumps(e.response, ensure_ascii=False, indent=2) if not isinstance(e.response, str) else e.response
        if len(res) > limit:
            res = res[:limit] + "\n... (생략)"
        lines += [f"## {i}. `{e.method} {e.path}` → {e.status} ({e.elapsed_ms}ms)", "",
                  "Request", "```json", req, "```", "Response", "```json", res, "```", ""]
    path.write_text("\n".join(lines), encoding="utf-8")
