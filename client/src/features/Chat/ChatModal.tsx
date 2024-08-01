// ChatModal.tsx
import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import useWebSocket from "utils/WebSocketClient";

interface ChatData {
  id: number;
  userId: string;
  lastMessage: string;
  profileImg: string;
  messages: Message[];
}

interface Message {
  id: number;
  senderId: string;
  content: string;
  timestamp: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: ChatData | null;
  currentUserId: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  chat,
  currentUserId,
}) => {
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState<string>("");

  // 메시지 수신 시 실행될 콜백 함수
  const onMessageReceived = (message: Message) => {
    if (chat) {
      chat.messages.push(message);
    }
  };

  // 채널 이름 생성
  const channel = chat ? [currentUserId, chat.userId].sort().join("_") : "";

  // useWebSocket 훅을 사용하여 WebSocket 연결 설정
  const { sendMessage } = useWebSocket(channel, onMessageReceived);

  useEffect(() => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTop = modalBodyRef.current.scrollHeight;
    }
  }, [chat]);

  // 메시지 전송 함수
  const handleSendMessage = () => {
    if (chat && newMessage.trim() !== "") {
      const message: Message = {
        id: Date.now(),
        senderId: currentUserId,
        content: newMessage,
        timestamp: new Date().toLocaleTimeString(),
      };
      // 메시지 전송
      sendMessage(message);
      chat.messages.push(message);
      setNewMessage("");
    }
  };

  if (!isOpen || !chat) return null; // isOpen과 chat이 모두 참일 때만 렌더링

  return (
    <ModalOverlay>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Opponent>
            <div></div>
            <div>{chat.userId}</div>
          </Opponent>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody ref={modalBodyRef}>
          {chat.messages.map((message) => {
            const isMine = message.senderId === currentUserId;
            return (
              <MessageContainer key={message.id} $isMine={isMine}>
                <MessageContent $isMine={isMine}>
                  <MessageBubble $isMine={isMine}>
                    {message.content}
                  </MessageBubble>
                  <MessageTime>{message.timestamp}</MessageTime>
                </MessageContent>
              </MessageContainer>
            );
          })}
        </ModalBody>
        <MessageInputContainer>
          <MessageInput
            placeholder="메시지를 입력하세요 (Enter로 전송)"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
        </MessageInputContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 380px;
  z-index: 9999;
  box-shadow: -2px 2px 2px 1px rgb(0 0 0 / 5%);
`;

const ModalContent = styled.div`
  width: 700px;
  height: 564px;
  display: flex;
  flex-direction: column;
  color: black;
  border-radius: 0 20px 20px 0;
  background: #fff;
`;

const Opponent = styled.div`
  display: flex;
  font-size: 18px;
  display: flex;
  justify-content: center;
  align-items: center;

  div:first-child {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background-color: #f0f0f0;
    margin-right: 16px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px 16px;
  position: relative;
  color: black;
  & h2 {
    font-size: 20px;
    font-weight: 500;
    padding: 5px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 12px;
  color: #ee5050;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
`;

const ModalBody = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px 32px;

  &::-webkit-scrollbar {
    width: 15px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #dfdfdf;
    border-radius: 10px;
    border: 4px solid rgba(0, 0, 0, 0);
    background-clip: padding-box;
    cursor: pointer;
  }
`;

const MessageContainer = styled.div<{ $isMine: boolean }>`
  display: flex;
  flex-direction: ${(props) => (props.$isMine ? "row-reverse" : "row")};
  align-items: flex-start;
  margin-bottom: 10px;
  max-width: 80%;
  ${(props) => (props.$isMine ? "margin-left: auto;" : "margin-right: auto;")}
`;

const MessageContent = styled.div<{ $isMine: boolean }>`
  display: flex;
  flex-direction: ${(props) => (props.$isMine ? "row-reverse" : "row")};
  align-items: end;
  max-width: calc(100% - 40px);
  font-size: 14px;
`;

const MessageBubble = styled.div<{ $isMine: boolean }>`
  background-color: ${(props) => (props.$isMine ? "white" : "#f8f8f8")};
  border-radius: 10px;
  padding: 11px 16px;
  border: ${(props) => (props.$isMine ? "1px solid #F7A8A8" : "none")};
  word-wrap: break-word;
  max-width: 100%;
`;

const MessageTime = styled.span`
  font-size: 11px;
  color: #c7c7c7;
  padding: 0 6px;
  margin-bottom: 4px;
`;

const MessageInputContainer = styled.div`
  display: flex;
  padding: 20px 32px;
`;

const MessageInput = styled.input`
  flex-grow: 1;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 10px 20px;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: #c4c4c4;
    font-size: 12px;
  }
`;

export default ChatModal;
