package com.bapmeokja.api.security;

import com.bapmeokja.api.common.exception.ErrorCode;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * 로그인 시도 대입과 AI 분석 호출량 소진을 막는 IP별 분당 요청 제한.
 * 서버 한 대 기준의 메모리 카운터라 재시작하면 초기화되고, 서버를 늘리면 공용 저장소로 옮겨야 한다.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final long WINDOW_MILLIS = 60_000;
    private static final int MAX_TRACKED_KEYS = 10_000;

    private final RateLimitProperties properties;
    private final JsonSecurityErrorWriter errorWriter;
    private final Clock clock;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    @Autowired
    public RateLimitFilter(RateLimitProperties properties, JsonSecurityErrorWriter errorWriter) {
        this(properties, errorWriter, Clock.systemUTC());
    }

    RateLimitFilter(RateLimitProperties properties, JsonSecurityErrorWriter errorWriter, Clock clock) {
        this.properties = properties;
        this.errorWriter = errorWriter;
        this.clock = clock;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        Group group = properties.isEnabled() ? groupOf(request) : Group.NONE;
        if (group == Group.NONE || tryAcquire(group, request.getRemoteAddr())) {
            filterChain.doFilter(request, response);
            return;
        }
        response.setHeader(HttpHeaders.RETRY_AFTER, "60");
        errorWriter.write(response, ErrorCode.TOO_MANY_REQUESTS);
    }

    private Group groupOf(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path.startsWith("/v1/auth/login") || path.startsWith("/v1/auth/register")
                || path.startsWith("/v1/auth/check/") || path.startsWith("/v1/auth/token/refresh")) {
            return Group.AUTH;
        }
        if ("POST".equals(request.getMethod())
                && (path.equals("/v1/diet/analyze") || path.equals("/v1/community/analyze-image"))) {
            return Group.ANALYZE;
        }
        return Group.NONE;
    }

    private boolean tryAcquire(Group group, String clientAddress) {
        long now = clock.millis();
        if (windows.size() > MAX_TRACKED_KEYS) {
            windows.values().removeIf(window -> now - window.startedAt >= WINDOW_MILLIS);
        }
        int limit = group == Group.AUTH ? properties.getAuthPerMinute() : properties.getAnalyzePerMinute();
        Window window = windows.compute(group + ":" + clientAddress, (key, current) ->
                current == null || now - current.startedAt >= WINDOW_MILLIS
                        ? new Window(now, 1)
                        : new Window(current.startedAt, current.count + 1));
        return window.count <= limit;
    }

    private enum Group { AUTH, ANALYZE, NONE }

    private record Window(long startedAt, int count) {
    }
}
