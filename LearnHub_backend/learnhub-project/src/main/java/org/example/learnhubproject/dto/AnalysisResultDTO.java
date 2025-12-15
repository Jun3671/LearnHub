package org.example.learnhubproject.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisResultDTO {
    private String title;
    private String description;
    private List<String> tags;
    private Long suggestedCategory;
}