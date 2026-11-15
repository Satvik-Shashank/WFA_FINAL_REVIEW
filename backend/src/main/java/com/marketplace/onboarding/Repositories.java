package com.marketplace.onboarding;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
interface SellerRepository extends JpaRepository<Seller,Long> { boolean existsByEmail(String email); }
interface ProductRepository extends JpaRepository<Product,Long> {
 List<Product> findBySellerId(Long sellerId);
 List<Product> findByStatus(String status);
}
