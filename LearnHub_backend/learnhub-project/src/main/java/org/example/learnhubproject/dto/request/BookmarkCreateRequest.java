package org.example.learnhubproject.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkCreateRequest {
    private Long categoryId;
    private String url;
    private String title;
    private String description;
    private String thumbnailUrl;
    private List<String> tags;
}