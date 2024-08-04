package com.ssafy.withme.service.chat.message;

import com.ssafy.withme.domain.chat.ChatMessage;
import com.ssafy.withme.domain.chat.constant.MessageType;
import com.ssafy.withme.dto.chat.ChatMessageDto;
import com.ssafy.withme.repository.chat.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Slf4j
public class ChatMongoService {

    private final ChatMessageRepository chatMessageRepository;
    private final MongoTemplate mongoTemplate;

    // 채팅 저장
    @Transactional
    public ChatMessageDto save(ChatMessageDto chatMessageDto) {
        if (chatMessageDto.getType() == MessageType.ENTER ||
                chatMessageDto.getType() == MessageType.TALK ||
                chatMessageDto.getType() == MessageType.QUIT) {
        }

        log.info("chatMessageDto: {}", chatMessageDto);
        ChatMessage chatMessage = chatMessageRepository.save(ChatMessage.of(chatMessageDto));
        log.info("save success : {}", chatMessage.getMessage());
        return ChatMessageDto.fromEntity(chatMessage);
    }

    // 채팅 불러오기
    @Transactional(readOnly = true)
    public List<ChatMessageDto> findAll(String roomId, Integer pageNumber) {
        return findByRoomIdWithPaging(roomId, pageNumber, 20)
                .stream().map(ChatMessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    private Page<ChatMessage> findByRoomIdWithPaging(String roomId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "time"));

        Query query = new Query()
                .with(pageable)
                .skip((long) pageable.getPageSize() * pageable.getPageNumber())
                .limit(pageable.getPageSize());

        query.addCriteria(Criteria.where("roomId").is(roomId));

        List<ChatMessage> filteredChatMessage = mongoTemplate.find(query, ChatMessage.class, "chat");
        Collections.sort(filteredChatMessage, Comparator.comparing(ChatMessage::getTime));
        return PageableExecutionUtils.getPage(
                filteredChatMessage,
                pageable,
                () -> mongoTemplate.count(query.skip(-1).limit(-1), ChatMessage.class)
        );
    }

    // 특정 채팅방에서 가장 최근에 저장된 메시지를 조회
    public ChatMessage findLatestMessageByRoomId(String roomId) {
        try {
            Query query = new Query(Criteria.where("roomId").is(roomId))
                    .with(Sort.by(Sort.Order.desc("_id")))
                    .limit(1);

            return mongoTemplate.findOne(query, ChatMessage.class);
        }  catch (Exception e) {
            return null;
        }
    }



}
