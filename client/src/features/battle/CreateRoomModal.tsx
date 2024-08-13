import { useEffect, useState } from "react";
import styled from "styled-components";

interface CreateRoomModalProps {
  onClose: () => void;
  onCreateRoom: (roomData: {
    roomName: string;
    isPublic: boolean;
    password?: string;
  }) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  onClose,
  onCreateRoom,
}) => {
  const [isPublic, setIsPublic] = useState<boolean>(true); // private, public 상태
  const [password, setPassword] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(false); // 버튼 활성화 상태

  useEffect(() => {
    if (!isPublic) {
      // 비공개 방일 경우
      setIsButtonEnabled(title.trim() !== "" && password.trim() !== "");
    } else {
      // 공개 방일 경우
      setIsButtonEnabled(title.trim() !== "");
    }
  }, [isPublic, title, password]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = () => {
    const roomData = {
      roomName: title,
      isPublic: isPublic,
      ...(!isPublic ? { password } : {}),
    };
    onCreateRoom(roomData);
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <ModalHeader>
          <h2>Battle</h2>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>
        <InputField
          type="text"
          placeholder="방 제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <PrivateToggle>
          <input
            type="checkbox"
            checked={!isPublic}
            onChange={() => setIsPublic(!isPublic)}
          />
          <span>private</span>
        </PrivateToggle>
        {!isPublic && (
          <InputField
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        <StartButton onClick={handleSubmit} disabled={!isButtonEnabled}>
          start
        </StartButton>
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

const InputField = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  background: #fff;
  border: none;
  box-shadow: 4px 4px 4px 0px rgba(0, 0, 0, 0.1);
`;

const PrivateToggle = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  input[type="checkbox"] {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    background: #fff;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    margin-right: 8px;
    cursor: pointer;
    position: relative;

    &:checked {
      background: #ee5050;
    }

    &:checked::after {
      content: "✓";
      color: white;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 13px;
    }
  }
`;

const StartButton = styled.button`
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
