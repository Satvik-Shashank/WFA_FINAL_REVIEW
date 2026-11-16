package com.marketplace.onboarding.worker;

import com.marketplace.onboarding.model.Seller;
import com.marketplace.onboarding.repository.SellerRepository;
import io.camunda.zeebe.client.api.response.ActivatedJob;
import io.camunda.zeebe.client.api.worker.JobClient;
import io.camunda.zeebe.spring.client.annotation.JobWorker;
import io.camunda.zeebe.spring.client.exception.ZeebeBpmnError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

@Component
public class SellerValidationWorker {

    private static final Logger log = LoggerFactory.getLogger(SellerValidationWorker.class);

    private final SellerRepository sellerRepository;

    public SellerValidationWorker(SellerRepository sellerRepository) {
        this.sellerRepository = sellerRepository;
    }

    @JobWorker(type = "validate-seller-details")
    public Map<String, Object> validateSellerDetails(final JobClient client, final ActivatedJob job) {
        log.info("Validating seller details for job: {}", job.getKey());

        Map<String, Object> variables = job.getVariablesAsMap();
        Long sellerId = ((Number) variables.get("sellerId")).longValue();

        Optional<Seller> optSeller = sellerRepository.findById(sellerId);
        if (optSeller.isEmpty()) {
            throw new ZeebeBpmnError("SELLER_NOT_FOUND", "Seller with ID " + sellerId + " not found in database");
        }

        Seller seller = optSeller.get();

        // Validate required fields
        boolean isValid = seller.getBusinessName() != null && !seller.getBusinessName().isBlank()
                && seller.getEmail() != null && !seller.getEmail().isBlank()
                && seller.getContactName() != null && !seller.getContactName().isBlank();

        if (!isValid) {
            throw new ZeebeBpmnError("VALIDATION_FAILED", "Seller details are incomplete or invalid");
        }

        log.info("Seller {} validated successfully", sellerId);
        return Map.of(
                "sellerValid", true,
                "sellerId", sellerId,
                "businessName", seller.getBusinessName()
        );
    }

    @JobWorker(type = "create-seller-account")
    public Map<String, Object> createSellerAccount(final JobClient client, final ActivatedJob job) {
        log.info("Creating seller account, job: {}", job.getKey());

        Map<String, Object> variables = job.getVariablesAsMap();
        Long sellerId = ((Number) variables.get("sellerId")).longValue();

        Optional<Seller> optSeller = sellerRepository.findById(sellerId);
        if (optSeller.isEmpty()) {
            throw new ZeebeBpmnError("SELLER_NOT_FOUND", "Seller " + sellerId + " not found");
        }

        Seller seller = optSeller.get();
        seller.setStatus("APPROVED");
        sellerRepository.save(seller);

        log.info("Seller account activated for seller {}", sellerId);
        return Map.of(
                "accountCreated", true,
                "sellerId", sellerId,
                "sellerStatus", "APPROVED"
        );
    }

    @JobWorker(type = "reject-seller")
    public Map<String, Object> rejectSeller(final JobClient client, final ActivatedJob job) {
        log.info("Rejecting seller, job: {}", job.getKey());

        Map<String, Object> variables = job.getVariablesAsMap();
        Long sellerId = ((Number) variables.get("sellerId")).longValue();

        Optional<Seller> optSeller = sellerRepository.findById(sellerId);
        if (optSeller.isEmpty()) {
            throw new ZeebeBpmnError("SELLER_NOT_FOUND", "Seller " + sellerId + " not found");
        }

        Seller seller = optSeller.get();
        seller.setStatus("REJECTED");
        sellerRepository.save(seller);

        log.info("Seller {} rejected", sellerId);
        return Map.of(
                "sellerRejected", true,
                "sellerId", sellerId
        );
    }
}

