package com.ssafy.withme.service.userChallengeLike;

import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.userchallenge.UserChallenge;
import com.ssafy.withme.domain.userchallengeLike.UserChallengeLike;
import com.ssafy.withme.repository.user.UserRepository;
import com.ssafy.withme.repository.userChallenge.UserChallengeRepository;
import com.ssafy.withme.repository.userChallengeLike.UserChallengeLikeRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserChallengeLikeService {

    private static final Logger log = LoggerFactory.getLogger(UserChallengeLikeService.class);
    private final UserRepository userRepository;
    private final UserChallengeRepository userChallengeRepository;
    private final UserChallengeLikeRepository userChallengeLikeRepository;
    private final RedisTemplate<String, String> redisTemplate;

    // redis에 저장되어 있는 것은 스케쥴링을 통해서 일정시간에 한번만 업데이트
    @Transactional
    public void likeUserChallenge(Long userId, Long userChallengeId) {

        // userId 기반 유저 검색
        User user = userRepository.findById(userId).orElse(null);
        // userChallengeId 기반 챌린지 검색
        UserChallenge userChallenge = userChallengeRepository.findById(userChallengeId).orElse(null);

        Optional<UserChallengeLike> userChallengeLikeOptional = userChallengeLikeRepository.findByUserIdAndUserChallengeId(user.getId(), userChallenge.getId());

        log.info("여기까지옴?");
        // 좋아요 상태 변경
        // 좋아요 처음 누르는 것이므로 false -> true
        userChallengeLikeOptional.ifPresentOrElse(
                UserChallengeLike::updateLike,
                () -> {
                    UserChallengeLike newUserChallengeLike = UserChallengeLike.builder()
                            .user(user)
                            .userChallenge(userChallenge)
                            .isLike(true)
                            .build();
                    userChallengeLikeRepository.save(newUserChallengeLike);
                }
        );

        ZSetOperations<String, String> zSetOperations = redisTemplate.opsForZSet();
        String key = "user_likes";

        // 해당 유저 챌린지 좋아요가 테이블내에 존재하고 현재 좋아요 상태이면
        boolean isLikeBefore = userChallengeLikeOptional.isPresent() && userChallengeLikeOptional.get().getIsLike();

        log.info("여기는?");
        if(isLikeBefore) {
            // 좋아요 취소 -> redis에 저장된 유저 좋아요 수 감소
            zSetOperations.incrementScore(key, user.getNickname(), -1);
            userChallenge.clickLike(-1);
        }
        else {
            // 좋아요 -> redis에 저장된 유저 좋아요 수 증가
            zSetOperations.incrementScore(key, user.getNickname(), 1);
            userChallenge.clickLike(1);
        }

    }

    // 좋아요 수가 변경될때마다 RDBMS 업데이트 되면 서버에 부하가 크다
    // -> redis에 저장했다가 일정 시간마다 RDBMS에 반영
    // 일정시간마다 redis에 저장된 유저 좋아요 수 정보 -> RDBMS에 저장
    @Transactional
    public void updateLikesFromRedisToRDBMS() {
        ZSetOperations<String, String> zSetOperations = redisTemplate.opsForZSet();
        String key = "user_likes";
        Set<ZSetOperations.TypedTuple<String>> userLikes = zSetOperations.rangeWithScores(key, 0, -1);

        if (userLikes != null) {
            for (ZSetOperations.TypedTuple<String> userLike : userLikes) {
                String nickname = userLike.getValue();
                Double likes = userLike.getScore();

                if (nickname != null && likes != null) {
                    User user = userRepository.findByNickname(nickname)
                            .orElseThrow(() -> new RuntimeException("User not found"));

                    user.setUserLikeCnt(likes.longValue());
                    userRepository.save(user); // @Transactional 이긴 하지만 그래도 명시적으로 걸어둠
                }
            }
        }
    }

}
