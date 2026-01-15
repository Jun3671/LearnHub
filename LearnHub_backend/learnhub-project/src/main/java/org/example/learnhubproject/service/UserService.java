package org.example.learnhubproject.service;

import lombok.RequiredArgsConstructor;
import org.example.learnhubproject.entity.Category;
import org.example.learnhubproject.entity.User;
import org.example.learnhubproject.repository.CategoryRepository;
import org.example.learnhubproject.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;

    @Transactional
    public User register(String email, String password, String role) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다: " + email);
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password)) // BCrypt 암호화
                .role(role != null ? role : "USER")
                .build();

        User savedUser = userRepository.save(user);

        // 사용자 생성 시 기본 카테고리 자동 생성
        Category defaultCategory = Category.builder()
                .name("미분류")
                .isDefault(true)
                .user(savedUser)
                .build();
        categoryRepository.save(defaultCategory);

        return savedUser;
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + email));
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public void delete(Long id) {
        User user = findById(id);
        userRepository.delete(user);
    }
}
