package com.marketplace.onboarding.service;

import com.marketplace.onboarding.model.Seller;
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
public class SellerService {

    private final SellerRepository sellerRepository;
    private final ZeebeClient zeebeClient;

    public SellerService(SellerRepository sellerRepository, @Autowired(required = false) ZeebeClient zeebeClient) {
        this.sellerRepository = sellerRepository;
        this.zeebeClient = zeebeClient;
    }

    public Seller registerSeller(Seller seller) {
        if (sellerRepository.existsByEmail(seller.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        seller.setStatus("PENDING");
        Seller saved = sellerRepository.save(seller);

        if (zeebeClient != null) {
            try {
                ProcessInstanceEvent instance = zeebeClient.newCreateInstanceCommand()
                        .bpmnProcessId("Process_SellerOnboarding")
                        .latestVersion()
                        .variables(Map.of(
                                "sellerId", saved.getId(),
                                "sellerEmail", saved.getEmail(),
                                "businessName", saved.getBusinessName(),
                                "contactName", saved.getContactName()
                        ))
                        .send()
                        .join();
                saved.setProcessInstanceKey(String.valueOf(instance.getProcessInstanceKey()));
                saved = sellerRepository.save(saved);
            } catch (Exception e) {
                // Zeebe engine not reachable; continue with DB-only flow
            }
        }

        return saved;
    }

    public List<Seller> getAllSellers() {
        return sellerRepository.findAll();
    }

    public Seller getSellerById(Long id) {
        return sellerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));
    }

    public Seller applyDecision(Long id, String decision) {
        Seller seller = getSellerById(id);
        String normalized = normalize(decision);
        seller.setStatus(normalized.equals("APPROVE") ? "APPROVED" : "REJECTED");
        return sellerRepository.save(seller);
    }

    private String normalize(String value) {
        String v = value == null ? "" : value.toUpperCase();
        if (!v.equals("APPROVE") && !v.equals("REJECT")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Decision must be APPROVE or REJECT");
        }
        return v;
    }
}

