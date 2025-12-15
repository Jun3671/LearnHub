package org.example.learnhubproject.repository;

import org.example.learnhubproject.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    List<Bookmark> findByUserId(Long userId);

    List<Bookmark> findByCategoryId(Long categoryId);

    List<Bookmark> findByUserIdAndCategoryId(Long userId, Long categoryId);

    @Query("SELECT b FROM Bookmark b WHERE b.user.id = :userId AND (b.title LIKE %:keyword% OR b.description LIKE %:keyword%)")
    List<Bookmark> searchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);
}