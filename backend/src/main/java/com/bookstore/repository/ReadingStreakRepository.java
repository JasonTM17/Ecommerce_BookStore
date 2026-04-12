package com.bookstore.repository;

import com.bookstore.entity.ReadingStreak;
import com.bookstore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReadingStreakRepository extends JpaRepository<ReadingStreak, Long> {

    Optional<ReadingStreak> findByUser(User user);
}
