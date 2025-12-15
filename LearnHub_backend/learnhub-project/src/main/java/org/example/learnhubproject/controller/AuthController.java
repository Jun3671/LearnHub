package org.example.learnhubproject.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.learnhubproject.dto.request.LoginRequest;
import org.example.learnhubproject.dto.request.RegisterRequest;
import org.example.learnhubproject.dto.response.AuthResponse;
import org.example.learnhubproject.dto.response.UserResponse;
import org.example.learnhubproject.entity.User;
import org.example.learnhubproject.service.UserService;
import org.example.learnhubproject.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "인증/인가 API")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    @Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        User user = userService.register(request.getEmail(), request.getPassword(), request.getRole());

        AuthResponse response = AuthResponse.builder()
                .message("회원가입 성공")
                .user(UserResponse.from(user))
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인하고 JWT 토큰을 발급받습니다")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = jwtUtil.generateToken(request.getEmail());

        AuthResponse response = AuthResponse.builder()
                .token(token)
                .message("로그인 성공")
                .build();

        return ResponseEntity.ok(response);
    }
}