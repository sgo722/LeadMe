import { useEffect, useState } from "react";
import styled from "styled-components";

interface InputPasswordModalProps {
  onClose: () => void;
  onEnter: (password: string) => void;
  roomTitle: string;
  isError: boolean;
}

export const InputPasswordModal: React.FC<InputPasswordModalProps> = ({
  onClose,
  onEnter,
  roomTitle,
  isError,
}) => {
  const [password, setPassword] = useState<string>(""); // 비밀번호 상태
  const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(false); // 버튼 활성화 상태

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEnter = () => {
    onEnter(password);
  };

  // 비밀번호 입력 상태 감시 & 버튼 활성화 여부 결정
  useEffect(() => {
    setIsButtonEnabled(password.trim() !== "");
  }, [password]);

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent $isError={isError}>
        <ModalHeader>
          <h2>Password</h2>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>
        <RoomTitle>{roomTitle}</RoomTitle>
        <InputField
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {isError && <ErrorMessage>비밀번호가 틀렸습니다.</ErrorMessage>}
        <EnterButton onClick={handleEnter} disabled={!isButtonEnabled}>
          enter
        </EnterButton>
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
  background: rgba(255, 255, 255, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div<{ $isError: boolean }>`
  padding: 20px;
  width: 350px;
  position: relative;
  border-radius: 10px;
  border: 3px rgba(223, 223, 223, 0.4);
  background: rgba(252, 252, 252, 0.85);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);

  animation: ${(props) =>
    props.$isError ? "shake 0.82s cubic-bezier(.36,.07,.19,.97) both" : "none"};
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;

  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
      transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
      transform: translate3d(4px, 0, 0);
    }
  }
`;

const ErrorMessage = styled.p`
  color: #ee5050;
  font-size: 14px;
  text-align: center;
  margin-top: -10px;
  margin-bottom: 10px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  color: #ee5050;
  font-family: Rajdhani;
  font-size: 48px;
  font-style: normal;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;
  color: #ee5050;
`;

const RoomTitle = styled.p`
  text-align: center;
  margin-bottom: 20px;
  font-size: 16px;
  color: #ee5050;
`;

const InputField = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 4px;
  background: #fff;
  border: none;
  box-shadow: 4px 4px 4px 0px rgba(0, 0, 0, 0.1);
  outline: none;
`;

const EnterButton = styled.button`
  width: 100%;
  border: none;
  border-radius: 4px;
  background: #f3f3f3;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  font-size: 24px;
  font-weight: 500;
  color: #ee5050;
  padding: 3px 0px;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
`;
