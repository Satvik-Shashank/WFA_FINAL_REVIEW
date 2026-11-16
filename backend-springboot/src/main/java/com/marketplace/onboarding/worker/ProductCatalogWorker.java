package com.marketplace.onboarding.worker;

import com.marketplace.onboarding.model.Product;
import com.marketplace.onboarding.repository.ProductRepository;
import io.camunda.zeebe.client.api.response.ActivatedJob;
import io.camunda.zeebe.client.api.worker.JobClient;
import io.camunda.zeebe.spring.client.annotation.JobWorker;
import io.camunda.zeebe.spring.client.exception.ZeebeBpmnError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class ProductCatalogWorker {

    private static final Logger log = LoggerFactory.getLogger(ProductCatalogWorker.class);

    private final ProductRepository productRepository;

    public ProductCatalogWorker(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @JobWorker(type = "validate-product-catalog")
    public Map<String, Object> validateProductCatalog(final JobClient client, final ActivatedJob job) {
        log.info("Validating product catalog, job: {}", job.getKey());

        Map<String, Object> variables = job.getVariablesAsMap();

        Long productId = null;
        if (variables.containsKey("productId") && variables.get("productId") != null) {
            productId = ((Number) variables.get("productId")).longValue();
        }

        List<Map<String, Object>> validationErrors = new ArrayList<>();

        if (productId != null) {
            Optional<Product> optProduct = productRepository.findById(productId);
            if (optProduct.isEmpty()) {
                throw new ZeebeBpmnError("PRODUCT_NOT_FOUND", "Product " + productId + " not found");
            }
            Product product = optProduct.get();

            if (product.getName() == null || product.getName().isBlank()) {
                validationErrors.add(Map.of("field", "name", "error", "Product name is required"));
            }
            if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                validationErrors.add(Map.of("field", "price", "error", "Price must be greater than zero"));
            }
            if (product.getCategory() == null || product.getCategory().isBlank()) {
                validationErrors.add(Map.of("field", "category", "error", "Category is required"));
            }
        }

        boolean catalogValid = validationErrors.isEmpty();
        log.info("Catalog validation result: valid={}, errors={}", catalogValid, validationErrors.size());

        return Map.of(
                "catalogValid", catalogValid,
                "validationErrors", validationErrors,
                "productId", productId != null ? productId : -1
        );
    }

    @JobWorker(type = "publish-products")
    public Map<String, Object> publishProducts(final JobClient client, final ActivatedJob job) {
        log.info("Publishing products, job: {}", job.getKey());

        Map<String, Object> variables = job.getVariablesAsMap();
        Long sellerId = ((Number) variables.get("sellerId")).longValue();

        List<Product> pendingProducts = productRepository.findBySellerIdAndStatus(sellerId, "PENDING_REVIEW");
        int publishedCount = 0;

        for (Product product : pendingProducts) {
            product.setStatus("APPROVED");
            productRepository.save(product);
            publishedCount++;
        }

        log.info("Published {} products for seller {}", publishedCount, sellerId);
        return Map.of(
                "publishedCount", publishedCount,
                "sellerId", sellerId,
                "publishStatus", "SUCCESS"
        );
    }

    @JobWorker(type = "send-approval-notification")
    public Map<String, Object> sendApprovalNotification(final JobClient client, final ActivatedJob job) {
        log.info("Sending approval notification, job: {}", job.getKey());

        Map<String, Object> variables = job.getVariablesAsMap();
        String sellerEmail = (String) variables.getOrDefault("sellerEmail", "unknown@example.com");
        String businessName = (String) variables.getOrDefault("businessName", "Seller");

        log.info("NOTIFICATION -> {} ({}): Your seller account has been approved!", businessName, sellerEmail);

        return Map.of(
                "notificationSent", true,
                "recipientEmail", sellerEmail
        );
    }

    @JobWorker(type = "activate-seller-store")
    public Map<String, Object> activateSellerStore(final JobClient client, final ActivatedJob job) {
        log.info("Activating seller store, job: {}", job.getKey());

        Map<String, Object> variables = job.getVariablesAsMap();
        Long sellerId = ((Number) variables.get("sellerId")).longValue();

        Optional<Product> anyProduct = productRepository.findBySellerId(sellerId).stream().findFirst();
        if (anyProduct.isPresent()) {
            Product p = anyProduct.get();
            p.getSeller().setStatus("ACTIVE");
            productRepository.save(p);
        }

        log.info("Seller store {} activated", sellerId);
        return Map.of(
                "storeActivated", true,
                "sellerId", sellerId
        );
    }
}

