package com.ssafy.withme.repository.chat;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.ssafy.withme.domain.chat.ChatRoom;
import com.ssafy.withme.domain.chat.QChatRoom;
import com.ssafy.withme.domain.user.QUser;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;

import static com.ssafy.withme.domain.chat.QChatRoom.chatRoom;
import static com.ssafy.withme.domain.user.QUser.user;

@RequiredArgsConstructor
public class ChatRoomRepositoryImpl implements ChatRoomRepositoryCustom{

    private final JPAQueryFactory qf;

    @Override
    public List<ChatRoom> findByUserId(Long userId) {

        return qf.selectFrom(chatRoom)
                .where(user.id.eq(userId))
                .fetch();
    }

    @Override
    public ChatRoom findByUserIdAndRoomId(Long userId, Long roomId) {

        return qf.selectFrom(chatRoom)
                .where(chatRoom.user.id.eq(userId), chatRoom.id.eq(roomId))
                .fetch().get(0);
    }
}
