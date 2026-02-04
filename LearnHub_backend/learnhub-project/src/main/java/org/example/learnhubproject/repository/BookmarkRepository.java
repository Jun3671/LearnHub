package org.example.learnhubproject.repository;

import org.example.learnhubproject.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    @Query("SELECT DISTINCT b FROM Bookmark b " +
           "LEFT JOIN FETCH b.bookmarkTags bt " +
           "LEFT JOIN FETCH bt.tag " +
           "LEFT JOIN FETCH b.category " +
           "WHERE b.user.id = :userId " +
           "ORDER BY b.createdAt DESC")
    List<Bookmark> findByUserIdWithTags(@Param("userId") Long userId);

    /**
     * 사용자의 북마크 조회 (정렬 옵션 포함)
     * sort: latest(최신순), oldest(오래된순), title(제목순)
     */
    @Query("SELECT DISTINCT b FROM Bookmark b " +
           "LEFT JOIN FETCH b.bookmarkTags bt " +
           "LEFT JOIN FETCH bt.tag " +
           "LEFT JOIN FETCH b.category " +
           "WHERE b.user.id = :userId " +
           "ORDER BY " +
           "CASE WHEN :sort = 'latest' THEN b.createdAt END DESC, " +
           "CASE WHEN :sort = 'oldest' THEN b.createdAt END ASC, " +
           "CASE WHEN :sort = 'title' THEN b.title END ASC")
    List<Bookmark> findByUserIdWithTagsSorted(@Param("userId") Long userId, @Param("sort") String sort);

    @Query("SELECT DISTINCT b FROM Bookmark b " +
           "LEFT JOIN FETCH b.bookmarkTags bt " +
           "LEFT JOIN FETCH bt.tag " +
           "LEFT JOIN FETCH b.category " +
           "WHERE b.id = :id")
    Optional<Bookmark> findByIdWithTags(@Param("id") Long id);

    @Query("SELECT DISTINCT b FROM Bookmark b " +
           "LEFT JOIN FETCH b.bookmarkTags bt " +
           "LEFT JOIN FETCH bt.tag " +
           "LEFT JOIN FETCH b.category " +
           "WHERE b.user.id = :userId AND b.category.id = :categoryId")
    List<Bookmark> findByUserIdAndCategoryIdWithTags(@Param("userId") Long userId, @Param("categoryId") Long categoryId);

    /**
     * 통합 검색: 제목, 설명, URL, 태그명을 모두 검색
     */
    @Query("SELECT DISTINCT b FROM Bookmark b " +
           "LEFT JOIN FETCH b.bookmarkTags bt " +
           "LEFT JOIN FETCH bt.tag t " +
           "LEFT JOIN FETCH b.category " +
           "WHERE b.user.id = :userId AND (" +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.url) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Bookmark> searchByKeywordWithTags(@Param("userId") Long userId, @Param("keyword") String keyword);

    List<Bookmark> findByUserId(Long userId);

    List<Bookmark> findByCategoryId(Long categoryId);

    List<Bookmark> findByUserIdAndCategoryId(Long userId, Long categoryId);

    @Query("SELECT b FROM Bookmark b WHERE b.user.id = :userId AND (b.title LIKE %:keyword% ESCAPE '\\' OR b.description LIKE %:keyword% ESCAPE '\\')")
    List<Bookmark> searchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);
}