package com.ssafy.withme.domain.challenge;

import com.ssafy.withme.domain.BaseEntity;
import com.ssafy.withme.domain.userchallenge.UserChallenge;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Challenge extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "challenge_id")
    private Long id;

    private String youtubeId;

    private String url;

    private String title;

    private String thumbnailPath;


    @OneToMany(mappedBy = "challenge", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<UserChallenge> userChallenges;

    @Builder
    private Challenge(String youtubeId, String url, String title) {
        this.youtubeId = youtubeId;
        this.url = url;
        this.userChallenges = new ArrayList<>();
    }

    public void setThumbnail(String thumbnailPath){
        this.thumbnailPath = thumbnailPath;
    }


}
