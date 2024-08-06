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

        QUser user1 = QUser.user;
        QUser user2 = new QUser("partnerUser");

        return qf.selectFrom(chatRoom)
                .join(chatRoom.user, user1).fetchJoin()
                .join(chatRoom.partner, user2).fetchJoin()
                .where(chatRoom.user.id.eq(userId).or(chatRoom.partner.id.eq(userId)))
                .fetch();
    }

    @Override
    public List<ChatRoom> findByPartnerId(Long partnerId) {

        QUser user1 = QUser.user;

        return qf.selectFrom(chatRoom)
                .join(chatRoom.user, user1).fetchJoin()
                .where(chatRoom.partner.id.eq(partnerId))
                .fetch();
    }

    @Override
    public Optional<ChatRoom> findByUserIdAndPartnerId(Long userId, Long partnerId) {

        QUser user1 = QUser.user;
        QUser user2 = new QUser("partnerUser");

        return Optional.ofNullable(qf.selectFrom(chatRoom)
                .join(chatRoom.user, user1).fetchJoin()
                .join(chatRoom.partner, user2).fetchJoin()
                .where(
                        (chatRoom.user.id.eq(userId).and(chatRoom.partner.id.eq(partnerId)))
                                .or(chatRoom.user.id.eq(partnerId).and(chatRoom.partner.id.eq(userId)))
                )
                .fetchOne());
    }

    @Override
    public ChatRoom findByUserIdAndRoomId(Long userId, Long roomId) {

        QChatRoom chatRoom = QChatRoom.chatRoom;

        QUser user1 = QUser.user;
        QUser user2 = new QUser("partnerUser");

        return qf.selectFrom(chatRoom)
                .join(chatRoom.user, user1).fetchJoin()
                .join(chatRoom.partner, user2).fetchJoin()
                .where(chatRoom.id.eq(roomId)
                        .and(chatRoom.user.id.eq(userId).or(chatRoom.partner.id.eq(userId))))
                .fetchOne();
    }
}
