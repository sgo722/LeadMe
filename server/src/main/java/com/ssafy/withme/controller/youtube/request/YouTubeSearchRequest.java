package com.ssafy.withme.controller.youtube.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class YouTubeSearchRequest {
    private String part;
    private String q;
    private String type;
    private String videoDuration;
    private Long maxResults;
    private String pageToken;
    private final String videoEmbeddable = "true";
    private final String videoSyndicated = "true";

    public String isVideoEmbeddable() {
        return this.videoEmbeddable;
    }

    public String isVideoSyndicated() {
        return this.videoSyndicated;
    }


}
