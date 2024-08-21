package com.ssafy.withme.service.userChallenge.response;

import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.userchallenge.UserChallenge;
import com.ssafy.withme.domain.userchallengeLike.UserChallengeLike;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

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

    public static UserChallengeFeedResponse ofResponse(UserChallenge userChallenge, User user, User loginUser, byte[] video){

        log.info("loginUser Id : {}", loginUser.getId());
        log.info("UserChallengeLikeList size : {}", userChallenge.getUserChallengeLikeList().size());

        return UserChallengeFeedResponse.builder()
                .nickname(user.getNickname())
                .profileImg(user.getProfileImg())
                .userId(userChallenge.getUser().getId())
                .title(userChallenge.getFileName())
                .userChallengeId(userChallenge.getId())
                .likes(userChallenge.getLikes())
                .video(video)
                .isLiked(
                        !userChallenge.getUserChallengeLikeList().stream()
                                .filter(c -> {
                                    log.info("Checking like for user ID : {}", c.getUser().getId());
                                    return c.getUser().getId() == loginUser.getId();
                                })
                                .filter(c -> {
                                    log.info("isLike : {}", c.getIsLike());
                                    return c.getIsLike();
                                })
                                .toList().isEmpty()
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
