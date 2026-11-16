package com.marketplace.onboarding.service;

import com.marketplace.onboarding.model.Product;
import com.marketplace.onboarding.model.Seller;
import com.marketplace.onboarding.repository.ProductRepository;
import com.marketplace.onboarding.repository.SellerRepository;
import io.camunda.zeebe.client.ZeebeClient;
import io.camunda.zeebe.client.api.response.ProcessInstanceEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;
    private final ZeebeClient zeebeClient;

    public ProductService(ProductRepository productRepository, SellerRepository sellerRepository, @Autowired(required = false) ZeebeClient zeebeClient) {
        this.productRepository = productRepository;
        this.sellerRepository = sellerRepository;
        this.zeebeClient = zeebeClient;
    }

    public Product submitProduct(Long sellerId, Product product) {
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));
        if (!"APPROVED".equals(seller.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seller is not approved");
        }
        product.setSeller(seller);
        product.setStatus("PENDING_REVIEW");
        Product saved = productRepository.save(product);

        if (zeebeClient != null) {
            try {
                ProcessInstanceEvent instance = zeebeClient.newCreateInstanceCommand()
                        .bpmnProcessId("Process_CatalogReview")
                        .latestVersion()
                        .variables(Map.of(
                                "productId", saved.getId(),
                                "sellerId", sellerId,
                                "productName", saved.getName(),
                                "productPrice", saved.getPrice()
                        ))
                        .send()
                        .join();
                saved.setProcessInstanceKey(String.valueOf(instance.getProcessInstanceKey()));
                saved = productRepository.save(saved);
            } catch (Exception e) {
                // Zeebe engine not reachable; continue with DB-only flow
            }
        }

        return saved;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsBySeller(Long sellerId) {
        return productRepository.findBySellerId(sellerId);
    }

    public List<Product> getApprovedProducts() {
        return productRepository.findByStatus("APPROVED");
    }

    public Product applyDecision(Long id, String decision, String rejectionReason) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        String v = decision == null ? "" : decision.toUpperCase();
        if (!v.equals("APPROVE") && !v.equals("REJECT")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Decision must be APPROVE or REJECT");
        }
        product.setStatus(v.equals("APPROVE") ? "APPROVED" : "REJECTED");
        if (v.equals("REJECT") && rejectionReason != null) {
            product.setRejectionReason(rejectionReason);
        }
        return productRepository.save(product);
    }
}

