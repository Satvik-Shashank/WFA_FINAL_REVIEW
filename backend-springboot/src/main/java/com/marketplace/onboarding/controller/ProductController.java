package com.marketplace.onboarding.controller;

import com.marketplace.onboarding.model.Product;
import com.marketplace.onboarding.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/seller/{sellerId}")
    public ResponseEntity<Product> addProduct(@PathVariable Long sellerId, @Valid @RequestBody Product product) {
        return ResponseEntity.status(201).body(productService.submitProduct(sellerId, product));
    }

    @GetMapping
    public List<Product> getAll(@RequestParam(required = false) Long sellerId) {
        return sellerId == null ? productService.getAllProducts() : productService.getProductsBySeller(sellerId);
    }

    @GetMapping("/approved")
    public List<Product> getApproved() {
        return productService.getApprovedProducts();
    }

    @PatchMapping("/{id}/decision")
    public Product applyDecision(@PathVariable Long id, @RequestBody DecisionRequest req) {
        return productService.applyDecision(id, req.decision(), req.rejectionReason());
    }

    public record DecisionRequest(String decision, String rejectionReason) {}
}

