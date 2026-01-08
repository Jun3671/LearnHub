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
           "WHERE b.user.id = :userId")
    List<Bookmark> findByUserIdWithTags(@Param("userId") Long userId);

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

    @Query("SELECT DISTINCT b FROM Bookmark b " +
           "LEFT JOIN FETCH b.bookmarkTags bt " +
           "LEFT JOIN FETCH bt.tag " +
           "LEFT JOIN FETCH b.category " +
           "WHERE b.user.id = :userId AND (b.title LIKE %:keyword% ESCAPE '\\' OR b.description LIKE %:keyword% ESCAPE '\\')")
    List<Bookmark> searchByKeywordWithTags(@Param("userId") Long userId, @Param("keyword") String keyword);

    List<Bookmark> findByUserId(Long userId);

    List<Bookmark> findByCategoryId(Long categoryId);

    List<Bookmark> findByUserIdAndCategoryId(Long userId, Long categoryId);

    @Query("SELECT b FROM Bookmark b WHERE b.user.id = :userId AND (b.title LIKE %:keyword% ESCAPE '\\' OR b.description LIKE %:keyword% ESCAPE '\\')")
    List<Bookmark> searchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);
}