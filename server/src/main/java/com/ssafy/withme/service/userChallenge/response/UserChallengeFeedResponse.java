package com.ssafy.withme.service.userChallenge.response;

import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.userchallenge.UserChallenge;
import lombok.Builder;
import lombok.Getter;

@Getter
public class UserChallengeFeedResponse {

    private Long userId;

    private String nickname;

    private String profileImg;

    private String title;

    private Long userChallengeId;

    private int likes;

    private byte[] video;

    private Boolean isLiked;


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

    public static UserChallengeFeedResponse ofResponse(UserChallenge userChallenge, User user, byte[] video){
        return UserChallengeFeedResponse.builder()
                .nickname(user.getNickname())
                .profileImg(user.getProfileImg())
                .userId(userChallenge.getUser().getId())
                .title(userChallenge.getFileName())
                .userChallengeId(userChallenge.getId())
                .likes(userChallenge.getLikes())
                .video(video)
                .isLiked(
                        userChallenge.getUserChallengeLikeList().stream()
                                .filter(c -> c.getUser().getId() == user.getId())
                                .toList().size() == 1
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
