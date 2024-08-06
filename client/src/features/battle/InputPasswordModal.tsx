import { useState } from "react";
import styled from "styled-components";

interface InputPasswordModalProps {
  onClose: () => void;
  onEnter: (password: string) => void;
  roomTitle: string;
}

export const InputPasswordModal: React.FC<InputPasswordModalProps> = ({
  onClose,
  onEnter,
  roomTitle,
}) => {
  const [password, setPassword] = useState<string>("");

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEnter = () => {
    onEnter(password);
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
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
        <EnterButton onClick={handleEnter}>enter</EnterButton>
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

const ModalContent = styled.div`
  padding: 20px;
  width: 350px;
  position: relative;
  border-radius: 10px;
  border: 3px rgba(223, 223, 223, 0.4);
  background: rgba(252, 252, 252, 0.85);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
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
`;
