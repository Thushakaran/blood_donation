package com.bloodshare.controller;

import com.bloodshare.dto.ApiMessage;
import com.bloodshare.dto.InboxRequest;
import com.bloodshare.entity.InboxMessage;
import com.bloodshare.repository.InboxMessageRepository;
import com.bloodshare.security.CurrentAdmin;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/inbox")
public class InboxController {
    private final InboxMessageRepository inboxMessageRepository;
    private final CurrentAdmin currentAdmin;

    public InboxController(InboxMessageRepository inboxMessageRepository, CurrentAdmin currentAdmin) {
        this.inboxMessageRepository = inboxMessageRepository;
        this.currentAdmin = currentAdmin;
    }

    @PostMapping
    public ApiMessage create(@Valid @RequestBody InboxRequest request) {
        InboxMessage message = new InboxMessage();
        message.setFullName(request.fullName());
        message.setPhoneNumber(request.phoneNumber());
        message.setEmail(request.email());
        message.setHospital(request.hospital());
        message.setMessage(request.message());
        inboxMessageRepository.save(message);
        return new ApiMessage("Message sent successfully");
    }

    @GetMapping
    public List<InboxMessage> list() {
        currentAdmin.requireSuperAdmin();
        return inboxMessageRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public ApiMessage delete(@PathVariable Long id) {
        currentAdmin.requireSuperAdmin();
        if (!inboxMessageRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found");
        }
        inboxMessageRepository.deleteById(id);
        return new ApiMessage("Message deleted");
    }
}
