package com.ssafy.withme.service.userChallenge.response;

import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.userchallenge.UserChallenge;
import com.ssafy.withme.domain.userchallengeLike.UserChallengeLike;
import com.ssafy.withme.repository.userChallenge.UserChallengeRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;

@Getter
@Slf4j
public class UserChallengeFeedResponse {

    private final Long userId;

    private final String nickname;

    private final String profileImg;

    private final String title;

    private final Long userChallengeId;

    private final int likes;

    private final byte[] video;

    private final Boolean isLiked;


    @Builder
    private UserChallengeFeedResponse(String nickname, String profileImg,Long userId, String title, Long userChallengeId, int likes, byte[] video, Boolean isLiked) {
        this.nickname = nickname;
        this.profileImg = profileImg;
        this.userId = userId;
        this.title = title;
        this.userChallengeId = userChallengeId;
        this.likes = likes;
        this.video = video;
        this.isLiked = isLiked;
    }

    public static UserChallengeFeedResponse ofResponse(
            UserChallenge userChallenge,
            User user,
            User loginUser,
            byte[] video,
            RedisTemplate<String, String> redisTemplate,
            UserChallengeRepository userChallengeRepository
    ){
        log.info("loginUser Id : {}", loginUser.getId());
        log.info("UserChallengeLikeList size : {}", userChallenge.getUserChallengeLikeList().size());

        // Redis에서 좋아요 수를 조회하는 로직
        ZSetOperations<String, String> zSetOperations = redisTemplate.opsForZSet();
        String challengeLikesKey = "challenge_likes_" + userChallenge.getId();
        Double challengeLikes = zSetOperations.score(challengeLikesKey, userChallenge.getFileName());

        // Rdis에 데이터가 없다면 RDBMS에서 가져온 후 Rdis에 저장
        if (challengeLikes == null) {
            log.info("Redis에 게시글 좋아요 수 정보가 없음. RDBMS에서 조회합니다.");

            // RDBMS에서 좋아요 수를 조회
            int rdbmsLikes = userChallenge.getLikes();

            // Redis에 업데이트
            zSetOperations.add(challengeLikesKey, userChallenge.getFileName(), rdbmsLikes);

            challengeLikes = (double) rdbmsLikes;
        }

        int likeCount = challengeLikes.intValue();


        return UserChallengeFeedResponse.builder()
                .nickname(user.getNickname())
                .profileImg(user.getProfileImg())
                .userId(userChallenge.getUser().getId())
                .title(userChallenge.getFileName())
                .userChallengeId(userChallenge.getId())
                .likes(likeCount)
//                .likes(userChallenge.getLikes())
                .video(video)
                .isLiked(
                        userChallenge.getUserChallengeLikeList().stream()
                                .filter(c -> {
                                    log.info("Checking like for user ID : {}", c.getUser().getId());
                                    return c.getUser().getId() == loginUser.getId();
                                })
                                .map(c -> {
                                    log.info("isLike : {}", c.getIsLike());
                                    return c.getIsLike();
                                })
                                .findFirst()
                                .orElse(false)
                )
                .build();
    }

    public static UserChallengeFeedResponse of(UserChallenge userChallenge, Long userId, byte[] video){

        return UserChallengeFeedResponse.builder()
                .nickname(userChallenge.getUser().getNickname())
                .profileImg(userChallenge.getUser().getProfileImg())
                .userId(userChallenge.getUser().getId())
                .title(userChallenge.getFileName())
                .userChallengeId(userChallenge.getId())
                .likes(userChallenge.getLikes())
                .video(video)
                .isLiked(
                        userChallenge.getUserChallengeLikeList().stream()
                                .filter(c -> c.getUser().getId() == userId)
                                .toList().size() == 1
                )
                .build();
    }
}
