package com.ssafy.withme.repository.chat;

import com.ssafy.withme.domain.chat.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long>, ChatRoomRepositoryCustom {

    Optional<ChatRoom> findByUserIdAndPartnerId(Long userId, Long partnerId);

    @Override
    List<ChatRoom> findByUserId(Long userId);

    @Override
    ChatRoom findByUserIdAndRoomId(Long userId, Long roomId);
}
