package org.example.learnhubproject.repository;

import org.example.learnhubproject.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByUserId(Long userId);

    boolean existsByUserIdAndName(Long userId, String name);
}