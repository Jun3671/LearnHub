package org.example.learnhubproject.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagRequest {

    @NotBlank(message = "태그명은 필수입니다")
    @Size(min = 1, max = 30, message = "태그명은 1자 이상 30자 이하여야 합니다")
    private String tagName;
}
