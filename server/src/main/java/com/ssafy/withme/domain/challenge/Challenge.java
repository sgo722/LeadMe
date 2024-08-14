package com.ssafy.withme.domain.challenge;

import com.ssafy.withme.domain.BaseEntity;
import com.ssafy.withme.domain.challengeHashtag.ChallengeHashTag;
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

    private String thumbnailUrl;

    private int originalFps;

    @OneToMany(mappedBy = "challenge", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<UserChallenge> userChallenges;

    @OneToMany(mappedBy = "challenge", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<ChallengeHashTag> challengeHashTags;

    @Builder
    private Challenge(String youtubeId, String url, String title) {
        this.youtubeId = youtubeId;
        this.url = url;
        this.userChallenges = new ArrayList<>();
        this.challengeHashTags = new ArrayList<>();
        this.title = title;
    }

    public void setThumbnail(String thumbnailPath){
        this.thumbnailPath = thumbnailPath;
    }

    public ChallengeEditor.ChallengeEditorBuilder toEditor() {
        return ChallengeEditor.builder()
                .thumbnailUrl(thumbnailUrl);
    }

    public void edit(ChallengeEditor challengeEditor) {
        thumbnailUrl = challengeEditor.getThumbnailUrl();
    }

    public void setOriginalFps(int originalFps) {
        this.originalFps = originalFps;
    }
}
