package org.example.learnhubproject.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.learnhubproject.entity.Bookmark;
import org.example.learnhubproject.entity.BookmarkTag;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkResponse {
    private Long id;
    private String url;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String imageUrl;
    private String metaTitle;
    private String metaDescription;
    private CategoryResponse category;
    private List<TagResponse> tags;
    private LocalDateTime createdAt;

    public static BookmarkResponse from(Bookmark bookmark) {
        return BookmarkResponse.builder()
                .id(bookmark.getId())
                .url(bookmark.getUrl())
                .title(bookmark.getTitle())
                .description(bookmark.getDescription())
                .thumbnailUrl(bookmark.getS3ThumbnailUrl())
                .imageUrl(bookmark.getImageUrl())
                .metaTitle(bookmark.getMetaTitle())
                .metaDescription(bookmark.getMetaDescription())
                .category(CategoryResponse.from(bookmark.getCategory()))
                .tags(bookmark.getBookmarkTags().stream()
                        .map(BookmarkTag::getTag)
                        .map(TagResponse::from)
                        .collect(Collectors.toList()))
                .createdAt(bookmark.getCreatedAt())
                .build();
    }
}
