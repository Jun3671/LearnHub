package org.example.learnhubproject.service;

import lombok.RequiredArgsConstructor;
import org.example.learnhubproject.entity.Tag;
import org.example.learnhubproject.repository.TagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TagService {

    private final TagRepository tagRepository;

    @Transactional
    public Tag create(String name) {
        if (tagRepository.existsByName(name)) {
            throw new IllegalArgumentException("이미 존재하는 태그입니다: " + name);
        }

        Tag tag = Tag.builder()
                .name(name)
                .build();

        return tagRepository.save(tag);
    }

    @Transactional
    public Tag findOrCreate(String name) {
        return tagRepository.findByName(name)
                .orElseGet(() -> {
                    Tag tag = Tag.builder()
                            .name(name)
                            .build();
                    return tagRepository.save(tag);
                });
    }

    public Tag findById(Long id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("태그를 찾을 수 없습니다: " + id));
    }

    public Tag findByName(String name) {
        return tagRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("태그를 찾을 수 없습니다: " + name));
    }

    public List<Tag> findAll() {
        return tagRepository.findAll();
    }

    /**
     * 인기 태그 조회 (사용 빈도수 기준 내림차순)
     */
    public List<Tag> findPopularTags() {
        return tagRepository.findPopularTags();
    }

    /**
     * 인기 태그 상위 N개 조회
     */
    public List<Tag> findTopPopularTags(int limit) {
        return tagRepository.findTopPopularTags(limit);
    }

    @Transactional
    public void delete(Long id) {
        Tag tag = findById(id);
        tagRepository.delete(tag);
    }
}