package com.marketplace.onboarding.service;

import com.marketplace.onboarding.model.Task;
import com.marketplace.onboarding.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getPendingTasks() {
        return taskRepository.findByStatus("PENDING");
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task createTask(String taskType, String assignee, Long entityId, String entityType) {
        Task task = new Task();
        task.setTaskType(taskType);
        task.setAssignee(assignee);
        task.setEntityId(entityId);
        task.setEntityType(entityType);
        task.setStatus("PENDING");
        return taskRepository.save(task);
    }

    public Task completeTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        task.setStatus("COMPLETED");
        task.setCompletedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }
}

