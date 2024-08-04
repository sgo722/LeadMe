package com.ssafy.withme.controller.comment.request;


import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class CommentUpdateRequest {

    private Long userId;

    private Long commentId;

    private String content;
}
