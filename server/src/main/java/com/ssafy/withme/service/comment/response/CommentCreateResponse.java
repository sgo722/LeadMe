package com.ssafy.withme.service.comment.response;

import com.ssafy.withme.domain.comment.Comment;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
public class CommentCreateResponse {


    private Long id;

    private String content;

    @Builder
    private CommentCreateResponse(Long id, String content) {
        this.id = id;
        this.content = content;
    }

    public static CommentCreateResponse of(Comment comment) {
        return CommentCreateResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .build();

    }
}
