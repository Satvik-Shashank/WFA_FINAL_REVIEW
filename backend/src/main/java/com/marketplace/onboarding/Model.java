package com.marketplace.onboarding;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name="sellers")
class Seller {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false) public String businessName;
 @Column(nullable=false,unique=true) public String email;
 @Column(nullable=false) public String contactName;
 public String phone;
 public String businessAddress;
 @Column(nullable=false) public String status="PENDING";
 public LocalDateTime createdAt=LocalDateTime.now();
}
@Entity @Table(name="products")
class Product {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false) public String name;
 @Column(length=1200) public String description;
 @Column(nullable=false,precision=12,scale=2) public BigDecimal price;
 public String category;
 @ManyToOne(fetch=FetchType.EAGER,optional=false) public Seller seller;
 @Column(nullable=false) public String status="PENDING_REVIEW";
 public LocalDateTime createdAt=LocalDateTime.now();
}
