package com.ssafy.withme.domain.comment;

import com.ssafy.withme.domain.BaseEntity;
import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.userchallenge.UserChallenge;
import com.ssafy.withme.domain.commentLike.CommentLike;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Comment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "users_id")
    private User user;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "user_challenge_id")
    private UserChallenge userChallenge;

    private Integer likes;

    @Builder
    public Comment(String content, User user, UserChallenge userChallenge){
        this.content = content;
        this.user = user;
        this.userChallenge = userChallenge;
        this.likes = 0;
    }

    public void changeContent(String content) {
        this.content = content;
    }

    public void clickLike(){
        this.likes++;
    }
}
