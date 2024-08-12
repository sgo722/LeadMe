package com.ssafy.withme.service.userChallenge.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
public class UserChallengeFeedResponses {


    private int totalPage;

    private long totalElement;

    private int pageSize;

    private int size;

    private List<UserChallengeFeedResponse> content;

    @Builder
    public UserChallengeFeedResponses(int size, long totalElement, int totalPage,int pageSize, List<UserChallengeFeedResponse> content) {
        this.size = size;
        this.pageSize = pageSize;
        this.totalPage = totalPage;
        this.totalElement = totalElement;
        this.content = content;
    }


}
