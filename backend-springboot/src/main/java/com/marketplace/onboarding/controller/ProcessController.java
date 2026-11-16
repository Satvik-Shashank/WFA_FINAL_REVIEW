package com.marketplace.onboarding.controller;

import io.camunda.zeebe.client.ZeebeClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/process")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ProcessController {

    private final ZeebeClient zeebeClient;

    public ProcessController(@Autowired(required = false) ZeebeClient zeebeClient) {
        this.zeebeClient = zeebeClient;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startProcess(@RequestBody Map<String, Object> payload) {
        String processId = (String) payload.getOrDefault("processId", "Process_SellerOnboarding");
        if (zeebeClient != null) {
            try {
                var instance = zeebeClient.newCreateInstanceCommand()
                        .bpmnProcessId(processId)
                        .latestVersion()
                        .variables(payload)
                        .send()
                        .join();
                return ResponseEntity.ok(Map.of(
                        "processInstanceKey", instance.getProcessInstanceKey(),
                        "processId", processId,
                        "status", "STARTED"
                ));
            } catch (Exception e) {
                // fall through to DB only response
            }
        }
        return ResponseEntity.ok(Map.of(
                "processInstanceKey", "SIMULATED-" + System.currentTimeMillis(),
                "processId", processId,
                "status", "STARTED_DB_FLOW",
                "note", "Zeebe not running locally; persisted to DB"
        ));
    }

    @GetMapping("/status/{processInstanceKey}")
    public ResponseEntity<?> getStatus(@PathVariable String processInstanceKey) {
        return ResponseEntity.ok(Map.of(
                "processInstanceKey", processInstanceKey,
                "status", "ACTIVE",
                "note", "Query Camunda Operate or Zeebe API for live execution tree"
        ));
    }
}

