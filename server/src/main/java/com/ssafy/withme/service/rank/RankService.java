package com.ssafy.withme.service.rank;

import com.ssafy.withme.dto.rank.RankResponseDto;
import com.ssafy.withme.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        long start = (pageNo - 1) * itemsPerPage;
        long end = start + itemsPerPage - 1;

        // 해당 페이지에 해당하는 상위 10명의 유저 정보 가져오기
        Set<ZSetOperations.TypedTuple<String>> typedTuples = zSetOperations.reverseRangeWithScores(key, start, end);

        if (typedTuples == null || typedTuples.isEmpty()) {
            return List.of(); // 결과가 없을 경우 빈 리스트 반환
        }
        
        // 유저 정보를 리스트로 변환
        return typedTuples.stream()
                .map(tuple -> {
                    String nickname = tuple.getValue();
                    Long score = tuple.getScore().longValue();
                    
                    return userRepository.findByNickname(nickname)
                            .map(user -> new RankResponseDto(
                                    user.getId(),
                                    nickname,
                                    score, // 좋아요 수
                                    (long) user.getFromFollowList().size(), // 팔로워 수
                                    user.getProfileImg() // 프로필 이미지
                            ))
                            .orElse(null);
                })
                .filter(rankResponseDto -> rankResponseDto != null)
                .collect(Collectors.toList());
    }

    // redis Ranking -> DB에 업데이트
//    @Transactional
//    public void updateLike() {
//        String key = "user_likes";
//        ZSetOperations<String, String> zSetOperations = redisTemplate.opsForZSet();
//
//        // 페이지 번호에 따라 랭킹 출력
//        Set<ZSetOperations.TypedTuple<String>> typedTuples = zSetOperations.reverseRangeWithScores(key, 0, -1);
//
//        if (typedTuples != null) {
//            for (ZSetOperations.TypedTuple<String> tuple : typedTuples) {
//                String nickname = tuple.getValue();
//                Long score = tuple.getScore().longValue();
//
//                // Redis에서 가져온 닉네임에 해당하는 유저를 DB에서 찾아서 업데이트
//                userRepository.findByNickname(nickname).ifPresent(user -> {
//                    if (score != null) {
//                        user.setUserLikeCnt(score);
//                        userRepository.save(user); // RDBS에 업데이트
//                    }
//                });
//            }
//        }
//    }
}
