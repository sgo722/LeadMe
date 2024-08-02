import styled from "styled-components";

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}
export const SubmitModal: React.FC<SubmitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalTitle>
          녹화가 완료되었습니다.
          <br /> 영상을 제출하시겠습니까?
        </ModalTitle>
        <ButtonGroup>
          <ModalButton onClick={onClose} disabled={isLoading}>
            취소
          </ModalButton>
          <ModalButton onClick={onSubmit} $primary disabled={isLoading}>
            {isLoading ? "제출 중..." : "제출"}
          </ModalButton>
        </ButtonGroup>
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
  padding: 20px;
  border-radius: 8px;
  width: 300px;
`;

const ModalTitle = styled.h2`
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const ModalButton = styled.button<{ $primary?: boolean }>`
  padding: 8px 16px;
  margin-left: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${(props) => (props.$primary ? "#ee5050" : "#f0f0f0")};
  color: ${(props) => (props.$primary ? "white" : "#333")};

  &:hover {
    background-color: ${(props) => (props.$primary ? "#ff6b6b" : "#e0e0e0")};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
