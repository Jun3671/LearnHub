package org.example.learnhubproject.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkUpdateRequest {

    @Pattern(
        regexp = "^(https?://)[a-zA-Z0-9\\-._~:/?#\\[\\]@!$&'()*+,;=%]+$",
        message = "유효한 URL 형식이어야 합니다"
    )
    @Size(max = 2048, message = "URL은 2048자 이하여야 합니다")
    private String url;

    @Size(max = 200, message = "제목은 200자 이하여야 합니다")
    private String title;

    @Size(max = 1000, message = "설명은 1000자 이하여야 합니다")
    private String description;

    @Pattern(
        regexp = "^(https?://)[a-zA-Z0-9\\-._~:/?#\\[\\]@!$&'()*+,;=%]+$",
        message = "유효한 URL 형식이어야 합니다"
    )
    @Size(max = 2048, message = "썸네일 URL은 2048자 이하여야 합니다")
    private String thumbnailUrl;

    private Long categoryId;

    private List<String> tags;

    @Builder.Default
    private Boolean reanalyze = false;
}
