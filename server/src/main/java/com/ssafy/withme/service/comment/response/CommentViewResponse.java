package com.ssafy.withme.service.comment.response;

import com.ssafy.withme.domain.comment.Comment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class CommentViewResponse {

    private String username;
    private String profileImg;
    private String content;
    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;

    @Builder
    public CommentViewResponse(String username, String profileImg, String content, LocalDateTime createdDate, LocalDateTime lastModifiedDate) {
        this.username = username;
        this.profileImg = profileImg;
        this.content = content;
        this.createdDate = createdDate;
        this.lastModifiedDate = lastModifiedDate;
    }

    public static CommentViewResponse of(Comment comment){
        return CommentViewResponse.builder()
//                .username(comment.getUser().getName())
//                .profileImg(comment.getUser().getProfileImg())
                .content(comment.getContent())
                .createdDate(comment.getCreatedDate())
                .lastModifiedDate(comment.getLastModifiedDate())
                .build();
    }
}
