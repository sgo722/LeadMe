import React from "react";
import styled from "styled-components";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({ isOpen, onClose, onDelete }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalText>해당 영상을 삭제하시겠습니까?</ModalText>
        <ButtonsWrapper>
          <ModalButton onClick={onDelete}>삭제</ModalButton>
          <ModalButton onClick={onClose} cancel>
            취소
          </ModalButton>
        </ButtonsWrapper>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  text-align: center;
  line-height: 18px;
`;

const ModalText = styled.div`
  margin-bottom: 28px;
  font-size: 16px;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: space-around;
`;

const ModalButton = styled.button<{ cancel?: boolean }>`
  padding: 10px 20px;
  background-color: ${({ cancel }) => (cancel ? "#ccc" : "#ee5050")};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin: 0 10px;

  &:hover {
    background-color: ${({ cancel }) => (cancel ? "#bbb" : "#ff6b6b")};
  }
`;
