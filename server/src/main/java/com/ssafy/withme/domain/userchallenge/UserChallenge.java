package com.ssafy.withme.domain.userchallenge;

import com.ssafy.withme.domain.challenge.Challenge;
import com.ssafy.withme.domain.comment.Comment;
import com.ssafy.withme.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class UserChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    private String access;

    private String uuid;

    @Builder
    public UserChallenge(String access, List<Comment> comments, User user, Challenge challenge, Integer likes, String videoPath, String fileName, String uuid) {
        this.access = access;
        this.comments = comments;
        this.user = user;
        this.challenge = challenge;
        this.likes = likes;
        this.videoPath = videoPath;
        this.fileName = fileName;
        this.uuid = uuid;
    }

}
