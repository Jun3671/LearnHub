package org.example.learnhubproject.repository;

import org.example.learnhubproject.entity.TechTerm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TechTermRepository extends JpaRepository<TechTerm, Long> {
    Optional<TechTerm> findByName(String name);
    Optional<TechTerm> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}