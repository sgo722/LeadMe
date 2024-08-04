package com.ssafy.withme.service.comment.response;

import com.ssafy.withme.domain.comment.Comment;
import lombok.Builder;
import lombok.Getter;

@Getter
public class CommentUpdateResponse {

    private Long commentId;

    private String content;

    @Builder
    private CommentUpdateResponse(Long commentId, String content) {
        this.commentId = commentId;
        this.content = content;
    }

    public static CommentUpdateResponse of(Comment comment) {
        return CommentUpdateResponse.builder()
                .commentId(comment.getId())
                .content(comment.getContent())
                .build();

    }
}
