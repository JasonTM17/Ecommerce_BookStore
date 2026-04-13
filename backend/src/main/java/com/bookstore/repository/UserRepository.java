package com.bookstore.repository;

import com.bookstore.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.isActive = true")
    Page<User> findAllActiveUsers(Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.email LIKE %:keyword% OR u.firstName LIKE %:keyword%")
    Page<User> searchUsers(String keyword, Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true")
    long countActiveUsers();

    @Query("SELECT u FROM User u WHERE MONTH(u.dateOfBirth) = :month AND DAY(u.dateOfBirth) = :day AND u.isActive = true")
    List<User> findByBirthday(@org.springframework.data.repository.query.Param("month") int month, @org.springframework.data.repository.query.Param("day") int day);

    List<User> findByRolesContaining(com.bookstore.entity.Role role);
}
