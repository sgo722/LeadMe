package com.ssafy.withme.domain.userchallenge;

import com.ssafy.withme.domain.BaseEntity;
import com.ssafy.withme.domain.challenge.Challenge;
import com.ssafy.withme.domain.comment.Comment;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.userchallengeLike.UserChallengeLike;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class UserChallenge extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_challenge_id")
    private Long id;

    private String fileName;

    private String videoPath;

    private Integer likes;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name="challenge_id")
    private Challenge challenge;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "users_id")
    private User user;

    @OneToMany(mappedBy = "userChallenge", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Comment> comments;

    @OneToMany(mappedBy = "userChallenge", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<UserChallengeLike> userChallengeLikeList = new ArrayList<>();

    private String access;

    private String uuid;

    private String thumbnailPath;

    @Builder
    public UserChallenge(String access, List<Comment> comments, User user, Challenge challenge, Integer likes, String videoPath, String fileName, String uuid, String thumbnailPath) {
        this.access = access;
        this.comments = comments;
        this.user = user;
        this.challenge = challenge;
        this.likes = likes;
        this.videoPath = videoPath;
        this.fileName = fileName;
        this.uuid = uuid;
        this.thumbnailPath = thumbnailPath;
    }

    public String changeTitle(String updateTitle) {
        this.fileName = updateTitle;
    }
}
