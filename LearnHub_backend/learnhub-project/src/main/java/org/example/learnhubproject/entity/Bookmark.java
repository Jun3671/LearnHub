package org.example.learnhubproject.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "bookmarks")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private String url;

    private String title;

    @Column(length = 1000)
    private String description;

    @Column(name = "s3_thumbnail_url")
    private String s3ThumbnailUrl;

    @Column(name = "image_url", length = 2048)
    private String imageUrl;

    @Column(name = "meta_title", length = 500)
    private String metaTitle;

    @Column(name = "meta_description", length = 1000)
    private String metaDescription;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "bookmark", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookmarkTag> bookmarkTags = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /**
     * 프론트엔드에서 쉽게 접근할 수 있도록 태그 정보를 제공
     */
    @JsonProperty("tags")
    public List<TagInfo> getTags() {
        if (bookmarkTags == null) {
            return new ArrayList<>();
        }
        return bookmarkTags.stream()
                .map(bt -> new TagInfo(bt.getTag().getId(), bt.getTag().getName()))
                .collect(Collectors.toList());
    }

    @Getter
    @AllArgsConstructor
    public static class TagInfo {
        private Long id;
        private String name;
    }
}
