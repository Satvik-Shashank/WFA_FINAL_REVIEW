package com.marketplace.onboarding.controller;

import com.marketplace.onboarding.model.Task;
import com.marketplace.onboarding.service.TaskService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/pending")
    public List<Task> getPendingTasks() {
        return taskService.getPendingTasks();
    }

    @PostMapping
    public Task createTask(@RequestBody CreateTaskRequest req) {
        return taskService.createTask(req.taskType(), req.assignee(), req.entityId(), req.entityType());
    }

    public record CreateTaskRequest(String taskType, String assignee, Long entityId, String entityType) {}

    @PostMapping("/{id}/complete")
    public Task completeTask(@PathVariable Long id) {
        return taskService.completeTask(id);
    }
}

