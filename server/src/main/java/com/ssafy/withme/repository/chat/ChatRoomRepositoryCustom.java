package com.ssafy.withme.repository.chat;

import com.ssafy.withme.domain.chat.ChatRoom;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepositoryCustom {

    List<ChatRoom> findByUserId(Long userId);

    Optional<ChatRoom> findByUserIdAndPartnerId(Long userId, Long partnerId);

    ChatRoom findByUserIdAndRoomId(Long userId, Long roomId);
}
