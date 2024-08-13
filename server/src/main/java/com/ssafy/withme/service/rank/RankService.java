package com.ssafy.withme.service.rank;

import com.ssafy.withme.dto.rank.RankResponseDto;
import com.ssafy.withme.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RankService {

    private static final Logger log = LoggerFactory.getLogger(RankService.class);
    private final RedisTemplate<String, String> redisTemplate;
    private final UserRepository userRepository;

    // pageNo에 따른 상위 10명 출력
    public List<RankResponseDto> rankList(Long pageNo) {
        String key = "user_likes";
        ZSetOperations<String, String> zSetOperations = redisTemplate.opsForZSet();

        long itemsPerPage = 10;

        // RDBMS에서 유저를 좋아요 순으로 가져오기
        Pageable pageable = PageRequest.of(pageNo.intValue() - 1, (int) itemsPerPage);

        // RDBMS에서 유저 정보 가져오기
        log.info("RDBMS에서 유저 정보 조회 pageNo : {}", pageNo);
        return userRepository.findTopUsersByLikes(pageable).stream()
                .map(user -> new RankResponseDto(
                        user.getId(),
                        user.getNickname(),
                        user.getUserLikeCnt(),
                        (long) user.getToFollowList().size(),
                        user.getProfileImg()
                ))
                .collect(Collectors.toList());

    }
}
