package com.ssafy.withme.service.chat.chatroom;

import com.ssafy.withme.domain.chat.ChatRoom;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.user.constant.UserStatus;
import com.ssafy.withme.dto.chat.request.ChatRoomCreateRequest;
import com.ssafy.withme.repository.chat.ChatRoomRedisRepository;
import com.ssafy.withme.repository.chat.ChatRoomRepository;
import com.ssafy.withme.service.chat.message.ChatMongoService;
import com.ssafy.withme.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatRoomServiceTest {

    @InjectMocks
    private ChatRoomService chatRoomService;

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private ChatRoomRedisRepository chatRoomRedisRepository;

    @Mock
    private UserService userService;

    private User user1;
    private User user2;

    @BeforeEach
    void setUp() {
        user1 = User.builder()
                .id(1L)
                .email("user1@ssafy.com")
                .nickname("user1")
                .name("user1")
                .userStatus(UserStatus.ACTIVE)
                .build();

        user2 = User.builder()
                .id(2L)
                .email("user2@ssafy.com")
                .nickname("user2")
                .name("user2")
                .userStatus(UserStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("채팅방 생성 테스트")
    void 채팅방_생성() {
        // User 서비스 스텁 설정
        when(userService.findById(1L)).thenReturn(user1);
        when(userService.findById(2L)).thenReturn(user2);

        // When
        when(chatRoomRepository.findByUserIdAndPartnerId(1L, 2L)).thenReturn(Optional.empty());

        ChatRoomCreateRequest request = new ChatRoomCreateRequest(1L, 2L);
        ChatRoom chatRoom = chatRoomService.createChatRoom(request);

        // Then
        assertNotNull(chatRoom);
        assertEquals(user1.getId(), chatRoom.getUser().getId());
        assertEquals(user2.getId(), chatRoom.getPartner().getId());
        verify(chatRoomRepository).save(chatRoom); // 채팅방 저장이 호출되었는지 검증
    }

    @Test
    @DisplayName("채팅방 삭제")
    void 채팅방_삭제() {

        // When
        chatRoomService.deleteChatRoom(1L, user1.getId());

        // Then
        verify(chatRoomRedisRepository).deleteChatRoom(user1.getId(), 1L);
    }
}
