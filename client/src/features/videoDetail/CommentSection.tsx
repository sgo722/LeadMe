import React from "react";
import styled from "styled-components";
import { Comment } from "types/index";

interface CommentSectionProps {
  show: boolean;
  comments: Comment[];
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  show,
  comments,
}) => {
  return (
    <CommentSectionWrapper $show={show}>
      <CommentHeader>댓글 {comments.length}</CommentHeader>
      <CommentList>
        {comments.map((comment) => (
          <CommentItem key={comment.id}>
            <CommentUser>{comment.user}</CommentUser>
            <CommentText>{comment.text}</CommentText>
          </CommentItem>
        ))}
      </CommentList>
    </CommentSectionWrapper>
  );
};

const CommentSectionWrapper = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 0;
  right: ${(props) => (props.$show ? "0" : "-40%")};
  width: 30%;
  height: 100%;
  padding: 20px;
  overflow-y: auto;
  transition: right 0.3s ease-in-out;
  z-index: 1000;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
`;

const CommentHeader = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 15px;
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
`;

const CommentItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const CommentUser = styled.div`
  color: gray;
  font-weight: 600;
  margin-bottom: 2px;
`;

const CommentText = styled.div`
  color: gray;
`;
