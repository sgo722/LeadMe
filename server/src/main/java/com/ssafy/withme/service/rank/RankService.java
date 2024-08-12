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
        long start = (pageNo - 1) * itemsPerPage;
        long end = start + itemsPerPage - 1;

        // RDBMS에서 유저를 좋아요 순으로 가져오기
        Pageable pageable = PageRequest.of(pageNo.intValue() - 1, (int) itemsPerPage);

        // RDBMS에서 유저 정보 가져오기
        log.info("RDBMS에서 유저 정보 조회");
        return userRepository.findTopUsersByLikes(pageable).stream()
                .map(user -> new RankResponseDto(
                        user.getId(),
                        user.getNickname(),
                        user.getUserLikeCnt(),
                        (long) user.getToFollowList().size(),
                        user.getProfileImg()
                ))
                .collect(Collectors.toList());

//        // 해당 페이지에 해당하는 상위 10명의 유저 정보 가져오기
//        Set<ZSetOperations.TypedTuple<String>> typedTuples = zSetOperations.reverseRangeWithScores(key, start, end);
//
//        // Redis에 유저 정보 X
//        if (typedTuples == null || typedTuples.isEmpty()) {
//            log.warn("Redis에 데이터가 없어 RDBMS에서 정보를 가져옵니다.");
//
//            // RDBMS에서 유저를 좋아요 순으로 가져오기
//            Pageable pageable = PageRequest.of(pageNo.intValue() - 1, (int) itemsPerPage);
//
//            List<RankResponseDto> rankResponseDtoList = userRepository.findTopUsersByLikes(pageable).stream()
//                    .map(user -> new RankResponseDto(
//                            user.getId(),
//                            user.getNickname(),
//                            user.getUserLikeCnt(),
//                            (long) user.getToFollowList().size(),
//                            user.getProfileImg()
//                    ))
//                    .collect(Collectors.toList());
//
//            // RDBMS -> Redis로 저장
//            // Redis의 정보가 휘발될 경우를 대비
//            rankResponseDtoList.forEach(rankResponseDto -> {
//
//                Long liked = rankResponseDto.getLiked();
//
//                if (liked == null)
//                    liked = 0L;
//
//                zSetOperations.add(key, rankResponseDto.getUserNickname(), liked);
//            });
//
//            return rankResponseDtoList;
//        }
//
//        log.info("Redis에서 유저 정보 반환합니다!!");
//        // Redis에 유저 정보 O
//        // 유저 정보를 리스트로 변환
//        return typedTuples.stream()
//                .map(tuple -> {
//                    String nickname = tuple.getValue();
//                    Long score = tuple.getScore().longValue();
//
//                    return userRepository.findByNickname(nickname)
//                            .map(user -> new RankResponseDto(
//                                    user.getId(),
//                                    nickname,
//                                    score, // 좋아요 수
//                                    (long) user.getToFollowList().size(), // 팔로워 수
//                                    user.getProfileImg() // 프로필 이미지
//                            ))
//                            .orElse(null);
//                })
//                .filter(rankResponseDto -> rankResponseDto != null)
//                .collect(Collectors.toList());
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
