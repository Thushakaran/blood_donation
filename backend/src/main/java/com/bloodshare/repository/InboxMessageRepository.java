package com.bloodshare.repository;

import com.bloodshare.entity.InboxMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InboxMessageRepository extends JpaRepository<InboxMessage, Long> {
}
