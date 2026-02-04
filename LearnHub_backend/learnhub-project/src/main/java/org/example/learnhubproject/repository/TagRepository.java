package org.example.learnhubproject.repository;

import org.example.learnhubproject.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findByName(String name);

    boolean existsByName(String name);

    /**
     * 인기 태그 조회 (사용 빈도수 기준 내림차순)
     * BookmarkTag 테이블에서 각 태그의 사용 횟수를 집계하여 정렬
     */
    @Query("SELECT t FROM Tag t " +
           "LEFT JOIN BookmarkTag bt ON bt.tag.id = t.id " +
           "GROUP BY t.id " +
           "ORDER BY COUNT(bt.id) DESC")
    List<Tag> findPopularTags();

    /**
     * 인기 태그 조회 (상위 N개만)
     */
    @Query(value = "SELECT t.* FROM tags t " +
           "LEFT JOIN bookmark_tags bt ON bt.tag_id = t.id " +
           "GROUP BY t.id " +
           "ORDER BY COUNT(bt.id) DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Tag> findTopPopularTags(@Param("limit") int limit);
}