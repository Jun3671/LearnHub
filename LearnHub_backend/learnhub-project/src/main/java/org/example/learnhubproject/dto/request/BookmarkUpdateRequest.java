package org.example.learnhubproject.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkUpdateRequest {
    private String url;
    private String title;
    private String description;
    private String thumbnailUrl;
}
