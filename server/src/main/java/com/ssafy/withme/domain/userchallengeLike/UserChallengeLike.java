package com.ssafy.withme.domain.userchallengeLike;

import com.ssafy.withme.domain.user.User;
import com.ssafy.withme.domain.userchallenge.UserChallenge;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class UserChallengeLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_challenge_like_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_user_challenge_like_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_challenge_id", foreignKey = @ForeignKey(name = "fk_user_challenge_like_user_challenge"))
    private UserChallenge userChallenge;

    private Boolean isLike;

    @Builder
    public UserChallengeLike(User user, UserChallenge userChallenge, Boolean isLike) {
        this.user = user;
        this.userChallenge = userChallenge;
        this.isLike = isLike;
    }

    // 좋아요 상태 변경 메서드
    public void updateLike() {
        this.isLike = !this.isLike;
    }
}
