package com.foodbridge.repository;

import com.foodbridge.entity.User;
import com.foodbridge.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(Role role);
    long countByActiveTrue();
    List<User> findAllByOrderByCreatedAtDesc();
}
