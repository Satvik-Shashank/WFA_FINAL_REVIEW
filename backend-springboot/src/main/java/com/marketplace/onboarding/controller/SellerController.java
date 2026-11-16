package com.marketplace.onboarding.controller;

import com.marketplace.onboarding.model.Seller;
import com.marketplace.onboarding.service.SellerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sellers")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SellerController {

    private final SellerService sellerService;

    public SellerController(SellerService sellerService) {
        this.sellerService = sellerService;
    }

    @PostMapping
    public ResponseEntity<Seller> register(@Valid @RequestBody Seller seller) {
        return ResponseEntity.status(201).body(sellerService.registerSeller(seller));
    }

    @GetMapping
    public List<Seller> getAllSellers() {
        return sellerService.getAllSellers();
    }

    @GetMapping("/{id}")
    public Seller getById(@PathVariable Long id) {
        return sellerService.getSellerById(id);
    }

    @PatchMapping("/{id}/decision")
    public Seller applyDecision(@PathVariable Long id, @RequestBody DecisionRequest req) {
        return sellerService.applyDecision(id, req.decision());
    }

    public record DecisionRequest(String decision) {}
}

