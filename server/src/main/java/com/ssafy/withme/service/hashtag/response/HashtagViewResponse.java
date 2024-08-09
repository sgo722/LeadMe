package com.ssafy.withme.service.hashtag.response;

import com.ssafy.withme.domain.hashtag.Hashtag;
import lombok.Builder;
import lombok.Getter;

@Getter
public class HashtagViewResponse {

    private Long hashtagId;

    private String hashtagName;

    @Builder
    private HashtagViewResponse(Long hashtagId, String hashtagName) {
        this.hashtagId = hashtagId;
        this.hashtagName = hashtagName;
    }

    public static HashtagViewResponse toResponse(Hashtag hashtag){
        return HashtagViewResponse.builder()
                .hashtagId(hashtag.getId())
                .hashtagName(hashtag.getName())
                .build();
    }


}
