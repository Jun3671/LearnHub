package org.example.learnhubproject.service;

import org.example.learnhubproject.entity.Bookmark;
import org.example.learnhubproject.entity.Category;
import org.example.learnhubproject.entity.Tag;
import org.example.learnhubproject.entity.User;
import org.example.learnhubproject.repository.BookmarkRepository;
import org.example.learnhubproject.repository.CategoryRepository;
import org.example.learnhubproject.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
@DisplayName("북마크 서비스 테스트")
class

BookmarkServiceTest {

    @Autowired
    private BookmarkService bookmarkService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    private User testUser;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        // 테스트용 사용자 생성
        testUser = User.builder()
                .email("test@example.com")
                .password(passwordEncoder.encode("password123"))
                .role("USER")
                .build();
        testUser = userRepository.save(testUser);

        // 테스트용 카테고리 생성
        testCategory = Category.builder()
                .user(testUser)
                .name("테스트 카테고리")
                .isDefault(false)
                .build();
        testCategory = categoryRepository.save(testCategory);
    }

    @Test
    @DisplayName("북마크 생성 성공")
    void createBookmark_Success() {

        // given
        String url = "https://spring.io/guides";
        String title = "Spring Guides";
        String description = "Official Spring Framework Guides";
        List<String> tags = List.of("Spring", "Java", "Backend");

        // when
        Bookmark bookmark = bookmarkService.create(
                testUser.getId(),
                testCategory.getId(),
                url,
                title,
                description,
                null,
                tags
        );

        // 영속성 컨텍스트 flush 및 clear
        entityManager.flush();
        entityManager.clear();

        // 태그가 포함된 북마크 다시 조회
        Bookmark savedBookmark = bookmarkService.findById(bookmark.getId());

        // then
        assertThat(savedBookmark).isNotNull();
        assertThat(savedBookmark.getId()).isNotNull();
        assertThat(savedBookmark.getUrl()).isEqualTo(url);
        assertThat(savedBookmark.getTitle()).isEqualTo(title);
        assertThat(savedBookmark.getDescription()).isEqualTo(description);
        assertThat(savedBookmark.getUser().getId()).isEqualTo(testUser.getId());
        assertThat(savedBookmark.getCategory().getId()).isEqualTo(testCategory.getId());
        assertThat(savedBookmark.getTags()).hasSize(3);

        // 태그 이름 검증

        List<String> tagNames = savedBookmark.getTags().stream()
                .map(tagInfo -> tagInfo.getName())
                .toList();
        assertThat(tagNames).containsExactlyInAnyOrder("Spring", "Java", "Backend");
    }

    @Test
    @DisplayName("다른 사용자의 북마크 수정 시도 시 AccessDeniedException 발생")
    void updateBookmark_DifferentUser_ThrowsException() {
        // given
        Bookmark bookmark = bookmarkService.create(
                testUser.getId(),
                testCategory.getId(),
                "https://example.com",
                "Original Title",
                "Original Description",
                null,
                List.of("Tag1")
        );

        // 다른 사용자 생성
        User anotherUser = User.builder()
                .email("another@example.com")
                .password(passwordEncoder.encode("password456"))
                .role("USER")
                .build();
        anotherUser = userRepository.save(anotherUser);

        Long anotherUserId = anotherUser.getId();
        Long bookmarkId = bookmark.getId();

        // when & then
        assertThatThrownBy(() ->
                bookmarkService.update(
                        bookmarkId,
                        anotherUserId,
                        "https://hacked.com",
                        "Hacked Title",
                        "Hacked Description",
                        null,
                        testCategory.getId()
                )
        )
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("접근 권한이 없습니다");
    }

    @Test
    @DisplayName("태그 중복 추가 시 IllegalArgumentException 발생")
    void addTag_Duplicate_ThrowsException() {
        // given
        Bookmark bookmark = bookmarkService.create(
                testUser.getId(),
                testCategory.getId(),
                "https://example.com",
                "Test Bookmark",
                "Test Description",
                null,
                List.of("Java")
        );

        Long bookmarkId = bookmark.getId();
        Long userId = testUser.getId();

        // when & then
        assertThatThrownBy(() ->
                bookmarkService.addTag(bookmarkId, userId, "Java")
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("이미 추가된 태그입니다");
    }

    @Test
    @DisplayName("북마크 삭제 성공")
    void deleteBookmark_Success() {
        // given
        Bookmark bookmark = bookmarkService.create(
                testUser.getId(),
                testCategory.getId(),
                "https://example.com",
                "Test Bookmark",
                "Test Description",
                null,
                List.of("Tag1")
        );
        Long bookmarkId = bookmark.getId();

        // when
        bookmarkService.delete(bookmarkId, testUser.getId());

        // then
        assertThat(bookmarkRepository.findById(bookmarkId)).isEmpty();
    }

    @Test
    @DisplayName("키워드 검색 - 제목 매칭")
    void searchByKeyword_TitleMatch() {
        // given
        bookmarkService.create(
                testUser.getId(),
                testCategory.getId(),
                "https://spring.io",
                "Spring Boot Tutorial",
                "Learn Spring Boot",
                null,
                List.of("Spring")
        );
        bookmarkService.create(
                testUser.getId(),
                testCategory.getId(),
                "https://react.dev",
                "React Documentation",
                "Learn React",
                null,
                List.of("React")
        );

        // when
        List<Bookmark> results = bookmarkService.searchByKeyword(testUser.getId(), "Spring");

        // then
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTitle()).contains("Spring");
    }

    @Test
    @DisplayName("키워드 검색 - SQL Injection 방지")
    void searchByKeyword_SQLInjectionPrevention() {
        // given
        String maliciousKeyword = "'; DROP TABLE bookmark; --";

        // when & then - 예외가 발생하지 않고 정상적으로 빈 결과 반환
        assertThatCode(() -> {
            List<Bookmark> results = bookmarkService.searchByKeyword(testUser.getId(), maliciousKeyword);
            assertThat(results).isEmpty();
        }).doesNotThrowAnyException();

        // 테이블이 여전히 존재하는지 확인
        assertThat(bookmarkRepository.findAll()).isNotNull();
    }

    @Test
    @DisplayName("카테고리별 북마크 조회")
    void findByUserIdAndCategoryId_Success() {
        // given
        Category anotherCategory = Category.builder()
                .user(testUser)
                .name("Another Category")
                .isDefault(false)
                .build();
        anotherCategory = categoryRepository.save(anotherCategory);

        bookmarkService.create(testUser.getId(), testCategory.getId(),
                "https://example1.com", "Bookmark 1", "Description 1", null, List.of());
        bookmarkService.create(testUser.getId(), testCategory.getId(),
                "https://example2.com", "Bookmark 2", "Description 2", null, List.of());
        bookmarkService.create(testUser.getId(), anotherCategory.getId(),
                "https://example3.com", "Bookmark 3", "Description 3", null, List.of());

        // when
        List<Bookmark> results = bookmarkService.findByUserIdAndCategoryId(
                testUser.getId(), testCategory.getId()
        );

        // then
        assertThat(results).hasSize(2);
        assertThat(results).allMatch(b -> b.getCategory().getId().equals(testCategory.getId()));
    }

    @Test
    @DisplayName("태그 제거 성공")
    void removeTag_Success() {
        // given
        Bookmark bookmark = bookmarkService.create(
                testUser.getId(),
                testCategory.getId(),
                "https://example.com",
                "Test Bookmark",
                "Test Description",
                null,
                List.of("Java", "Spring")
        );

        // 영속성 컨텍스트 flush 및 clear
        entityManager.flush();
        entityManager.clear();

        // 태그가 포함된 북마크 다시 조회
        Bookmark savedBookmark = bookmarkService.findById(bookmark.getId());

        Long tagIdToRemove = savedBookmark.getTags().stream()
                .filter(tag -> tag.getName().equals("Java"))
                .findFirst()
                .orElseThrow()
                .getId();

        // when
        bookmarkService.removeTag(bookmark.getId(), testUser.getId(), tagIdToRemove);

        // 영속성 컨텍스트 flush 및 clear
        entityManager.flush();
        entityManager.clear();

        // then
        Bookmark updated = bookmarkService.findById(bookmark.getId());
        assertThat(updated.getTags()).hasSize(1);
        assertThat(updated.getTags().get(0).getName()).isEqualTo("Spring");
    }

    @Test
    @DisplayName("북마크 업데이트 - 카테고리 변경")
    void updateBookmark_ChangeCategory() {
        // given
        Bookmark bookmark = bookmarkService.create(
                testUser.getId(),
                testCategory.getId(),
                "https://example.com",
                "Original Title",
                "Original Description",
                null,
                List.of()
        );

        Category newCategory = Category.builder()
                .user(testUser)
                .name("New Category")
                .isDefault(false)
                .build();
        newCategory = categoryRepository.save(newCategory);

        // when
        Bookmark updated = bookmarkService.update(
                bookmark.getId(),
                testUser.getId(),
                null,
                "Updated Title",
                null,
                null,
                newCategory.getId()
        );

        // then
        assertThat(updated.getTitle()).isEqualTo("Updated Title");
        assertThat(updated.getCategory().getId()).isEqualTo(newCategory.getId());
        assertThat(updated.getUrl()).isEqualTo("https://example.com"); // 변경 안 한 값은 유지
    }

    // TODO: 추가 테스트 케이스
    // - 존재하지 않는 북마크 조회 시 예외 발생
    // - 태그별 북마크 조회
    // - 북마크 생성 시 태그 없이 생성
    // - 썸네일 URL 업데이트
}
