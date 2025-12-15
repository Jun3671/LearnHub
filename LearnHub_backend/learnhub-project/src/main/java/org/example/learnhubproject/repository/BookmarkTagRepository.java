package org.example.learnhubproject.repository;

import org.example.learnhubproject.entity.BookmarkTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookmarkTagRepository extends JpaRepository<BookmarkTag, Long> {

    List<BookmarkTag> findByBookmarkId(Long bookmarkId);

    List<BookmarkTag> findByTagId(Long tagId);

    @Query("SELECT bt FROM BookmarkTag bt WHERE bt.bookmark.user.id = :userId AND bt.tag.id = :tagId")
    List<BookmarkTag> findByUserIdAndTagId(@Param("userId") Long userId, @Param("tagId") Long tagId);

    void deleteByBookmarkIdAndTagId(Long bookmarkId, Long tagId);
}
