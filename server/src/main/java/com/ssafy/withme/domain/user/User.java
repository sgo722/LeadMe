package com.ssafy.withme.domain.user;

import com.ssafy.withme.domain.BaseEntity;
import com.ssafy.withme.domain.chat.ChatRoom;
import com.ssafy.withme.domain.user.constant.RoleType;
import com.ssafy.withme.domain.user.constant.UserStatus;
import com.ssafy.withme.domain.userchallengeLike.UserChallengeLike;
import jakarta.persistence.*;
import lombok.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Getter
@Entity(name = "users")
@NoArgsConstructor
public class User extends BaseEntity implements UserDetails {

    private static final Logger log = LoggerFactory.getLogger(User.class);
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    private String name;

    private String password;

    @Column(name = "nickname", unique = true)
    private String nickname;

    private String email;

    private String gender;

    private String age;

    @Enumerated(EnumType.STRING)
    private RoleType roleType;

    private String profileImg;

    private String profileComment;

    private LocalDateTime loginDateTime;

    @Enumerated(EnumType.STRING)
    private UserStatus userStatus;

    @OneToMany(mappedBy = "toUser", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Follow> toFollowList = new ArrayList<>();

    @OneToMany(mappedBy = "fromUser", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Follow> fromFollowList = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<UserChallengeLike> userChallengeLikeList = new ArrayList<>();

    @Column(name = "user_like_cnt")
    private Long userLikeCnt;

    @PrePersist
    protected void onCreate() {
        if (this.userLikeCnt == null) {
            this.userLikeCnt = 0L;
        }
    }

    public User update(String name) {
        this.name = name;
        return this;
    }

//    @Builder
//    public User(String name, String email, UserStatus userStatus) {
//        this.name = name;
//        this.email = email;
//        this.userStatus = userStatus;
//    }

    @Builder
    public User(Long id, String name, String password, String nickname, String email, String gender, String age, RoleType roleType, String profileImg, String profileComment, UserStatus userStatus, Long userLikeCnt) {
        this.id = id;
        this.name = name;
        this.password = password;
        this.nickname = nickname;
        this.email = email;
        this.gender = gender;
        this.age = age;
        this.roleType = roleType;
        this.profileImg = profileImg;
        this.profileComment = profileComment;
        this.userStatus = userStatus;
        this.userLikeCnt = userLikeCnt;
    }

    public void setUserLikeCnt(Long userLikeCnt) {
        this.userLikeCnt = userLikeCnt;
    }

    public void updateLoginTime() {

        this.loginDateTime = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
    }

    public void updateStatus(UserStatus userStatus) {

        this.userStatus = userStatus;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        return List.of(new SimpleGrantedAuthority(roleType.name()));
    }

    @Override
    public String getUsername() {
        return this.name;
    }

    public void updateProfile(String nickname, String profileComment) {
        log.info(nickname + " " + profileComment);
        this.nickname = nickname;
        this.profileComment = profileComment;
    }
}
