import React, { useState } from "react";
import styled from "styled-components";
import { FaHeart, FaVolumeUp, FaVolumeMute, FaTrash } from "react-icons/fa";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal"; // 새로 만든 모달 파일을 import

interface InteractionButtonsProps {
  likes: number;
  isMuted: boolean;
  isLiked: boolean;
  isOwner: boolean;
  onToggleSound: () => void;
  onToggleLike: () => void;
  onDelete: () => void;
}

export const InteractionButtons: React.FC<InteractionButtonsProps> = ({
  likes,
  isMuted,
  isLiked,
  isOwner,
  onToggleSound,
  onToggleLike,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    onDelete();
    closeModal();
  };

  return (
    <>
      <ButtonsWrapper>
        {isOwner && (
          <Delete onClick={openModal}>
            <FaTrash size={19} />
          </Delete>
        )}
        <Button onClick={onToggleLike}>
          <Heart size={17} isLiked={isLiked} />
          <span>{likes}</span>
        </Button>
        <Button onClick={onToggleSound}>
          {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
        </Button>
      </ButtonsWrapper>

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onDelete={handleDelete}
      />
    </>
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

const Delete = styled.button`
  background: #fff;
  opacity: 0.8;
  border: none;
  color: #cdcdcd;
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
  margin-bottom: 304px;
`;

const Heart = styled(FaHeart).attrs<{ isLiked: boolean }>((props) => ({
  color: props.isLiked ? "#ee5050" : "#d2d2d2",
}))<{ isLiked: boolean }>`
  margin-bottom: 8px;
`;
