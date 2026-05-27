package com.dsheils.api_gateway;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Collections;
import java.util.Set;

@RestController
public class ProxyController {

    private static final Set<String> SKIP_HEADERS = Set.of(
        "connection", "keep-alive", "transfer-encoding", "te",
        "trailers", "proxy-authorization", "proxy-authenticate",
        "upgrade", "host", "content-length"
    );

    @Autowired
    private GatewayProperties gatewayProperties;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @RequestMapping("/**")
    public ResponseEntity<byte[]> proxy(HttpServletRequest request) throws Exception {
        String path = request.getRequestURI();
        String prefix = extractPrefix(path);
        String targetBase = gatewayProperties.getRoutes().get(prefix);

        if (targetBase == null) {
            return ResponseEntity.notFound().build();
        }

        String query = request.getQueryString();
        String targetUrl = targetBase + path + (query != null ? "?" + query : "");

        byte[] body = request.getInputStream().readAllBytes();
        HttpRequest.BodyPublisher publisher = body.length > 0
            ? HttpRequest.BodyPublishers.ofByteArray(body)
            : HttpRequest.BodyPublishers.noBody();

        HttpRequest.Builder builder = HttpRequest.newBuilder()
            .uri(URI.create(targetUrl))
            .method(request.getMethod(), publisher);

        Collections.list(request.getHeaderNames()).stream()
            .filter(name -> !SKIP_HEADERS.contains(name.toLowerCase()))
            .forEach(name -> Collections.list(request.getHeaders(name))
                .forEach(value -> builder.header(name, value)));

        HttpResponse<byte[]> response = httpClient.send(builder.build(),
            HttpResponse.BodyHandlers.ofByteArray());

        HttpHeaders responseHeaders = new HttpHeaders();
        response.headers().map().forEach((name, values) -> {
            if (!SKIP_HEADERS.contains(name.toLowerCase())) {
                responseHeaders.addAll(name, values);
            }
        });

        return ResponseEntity.status(response.statusCode())
            .headers(responseHeaders)
            .body(response.body());
    }

    private String extractPrefix(String path) {
        String trimmed = path.startsWith("/") ? path.substring(1) : path;
        int slash = trimmed.indexOf('/');
        return slash >= 0 ? trimmed.substring(0, slash) : trimmed;
    }
}
