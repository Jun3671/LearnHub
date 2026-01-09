package org.example.learnhubproject.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkCreateRequest {

    @NotNull(message = "카테고리는 필수입니다")
    private Long categoryId;

    @NotBlank(message = "URL은 필수입니다")
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

    @Size(max = 10, message = "태그는 최대 10개까지 추가할 수 있습니다")
    private List<@NotBlank @Size(max = 30, message = "태그는 30자 이하여야 합니다") String> tags;
}
