package com.ssafy.withme.domain.challengeHashtag;


import com.ssafy.withme.domain.challenge.Challenge;
import com.ssafy.withme.domain.hashtag.Hashtag;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class ChallengeHashTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "challenge_hashtag_id")
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id")
    private Challenge challenge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hashtag_id")
    private Hashtag hashtag;

    @Builder
    private ChallengeHashTag(Challenge challenge, Hashtag hashtag) {
        this.challenge = challenge;
        this.hashtag = hashtag;
    }

}
