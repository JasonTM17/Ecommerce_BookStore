package com.bookstore.repository;

import com.bookstore.entity.ReadingChallenge;
import com.bookstore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReadingChallengeRepository extends JpaRepository<ReadingChallenge, Long> {

    Optional<ReadingChallenge> findByUserAndYear(User user, int year);

    List<ReadingChallenge> findByUserOrderByYearDesc(User user);

    @Query("SELECT rc FROM ReadingChallenge rc WHERE rc.user = :user AND rc.isCompleted = false ORDER BY rc.year DESC")
    List<ReadingChallenge> findActiveByUser(User user);
}
