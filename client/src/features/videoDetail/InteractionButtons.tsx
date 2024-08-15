import React from "react";
import styled from "styled-components";
import { FaHeart, FaVolumeUp, FaVolumeMute } from "react-icons/fa";

interface InteractionButtonsProps {
  likes: number;
  isMuted: boolean;
  isLiked: boolean;
  onToggleSound: () => void;
  onToggleLike: () => void;
}

export const InteractionButtons: React.FC<InteractionButtonsProps> = ({
  likes,
  isMuted,
  isLiked,
  onToggleSound,
  onToggleLike,
}) => {
  return (
    <ButtonsWrapper>
      <Button onClick={onToggleLike}>
        <Heart size={17} isLiked={isLiked} />
        <span>{likes}</span>
      </Button>
      <Button onClick={onToggleSound}>
        {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
      </Button>
    </ButtonsWrapper>
  );
};

const ButtonsWrapper = styled.div`
  position: absolute;
  right: -60px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const Button = styled.button`
  background: #fff;
  opacity: 0.8;
  border: none;
  color: #ee5050;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  justify-content: center;
  position: relative;

  span {
    font-size: 12px;
    margin-top: 5px;
    position: absolute;
    bottom: 5px;
  }
`;

const Heart = styled(FaHeart)<{ isLiked: boolean }>`
  margin-bottom: 8px;
  color: ${({ isLiked }) => (isLiked ? "#ee5050" : "#d2d2d2")};
`;
