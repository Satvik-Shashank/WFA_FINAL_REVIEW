package com.marketplace.onboarding.repository;

import com.marketplace.onboarding.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {
    boolean existsByEmail(String email);
    Optional<Seller> findByEmail(String email);
    List<Seller> findByStatus(String status);
}

