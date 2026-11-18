package com.bapmeokja.api.store;

import com.bapmeokja.api.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 기기 위치를 쓸 수 없을 때 접속한 네트워크(IP) 기준의 대략적인 위치를 알려 준다.
 * Vercel이 요청에 붙여 주는 x-vercel-ip-* 헤더를 읽으며, 헤더가 없으면 data가 null이다.
 */
@RestController
@RequestMapping("/v1/location")
public class ApproximateLocationController {

    public record ApproximateLocation(double lat, double lng, String city) {
    }

    @GetMapping("/approximate")
    public ApiResponse<ApproximateLocation> approximate(HttpServletRequest request) {
        Double lat = parse(request.getHeader("x-vercel-ip-latitude"));
        Double lng = parse(request.getHeader("x-vercel-ip-longitude"));
        if (lat == null || lng == null || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
            return ApiResponse.success(null, "대략적인 위치를 알 수 없습니다.");
        }
        String city = request.getHeader("x-vercel-ip-city");
        city = city == null ? "" : URLDecoder.decode(city, StandardCharsets.UTF_8);
        return ApiResponse.success(new ApproximateLocation(lat, lng, city), "조회 성공");
    }

    private static Double parse(String value) {
        try {
            return value == null || value.isBlank() ? null : Double.valueOf(value.trim());
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}
