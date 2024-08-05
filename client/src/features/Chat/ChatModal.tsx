import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import useWebSocket from "utils/useWebSocket";
import { baseUrl } from "axiosInstance/constants";

interface ChatMessageDto {
  type: string;
  roomId: number;
  userId: number;
  nickname: string;
  message: string;
  time: string;
  status: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: number;
  currentNickname: string;
  partnerNickname: string | null;
  partnerId: number | null;
  partnerProfile: string | null;
}

const formatTime = (timeString: string) => {
  const date = new Date(timeString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "오후" : "오전";
  const formattedHours = hours % 12 || 12;
  return `${ampm} ${formattedHours}:${minutes < 10 ? `0${minutes}` : minutes}`;
};

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  currentNickname,
  partnerNickname,
  partnerId,
  partnerProfile,
}) => {
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [roomId, setRoomId] = useState<number | null>(null);

  const { sendMessage, subscribeToChannel } = useWebSocket();

  useEffect(() => {
    if (isOpen && partnerId) {
      // 채팅방을 생성한다. - room1
      axios
        .post(
          `${baseUrl}/api/v1/chat/room/create`,
          {
            userId: currentUserId,
            partnerId: partnerId,
          },
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
            },
          }
        )
        .then((response) => {
          const createdRoomId = response.data.data;
          console.log("roomId:", createdRoomId);
          setRoomId(createdRoomId);

          // WebSocket 구독 설정 - room3
          subscribeToChannel(
            `/sub/chat/message/${createdRoomId}`,
            (message: ChatMessageDto) => {
              setMessages((prevMessages) => [...prevMessages, message]);
            }
          );

          // 해당 채팅방을 조회한다. - room2
          return axios.get(`${baseUrl}/api/v1/chat/room/message/list`, {
            params: {
              roomId: createdRoomId,
              page: 0,
            },
          });
        })
        .then((response) => {
          console.log(response.data);
          const formattedMessages = response.data.data.map(
            (message: ChatMessageDto) => ({
              ...message,
              time: formatTime(message.time),
            })
          );
          setMessages(formattedMessages);
          if (modalBodyRef.current) {
            modalBodyRef.current.scrollTop = modalBodyRef.current.scrollHeight;
          }
        })
        .catch((error) => {
          console.error("Failed to create chat room or fetch messages", error);
        });
    }
  }, [isOpen, currentUserId, partnerId, subscribeToChannel]);

  const handleSendMessage = () => {
    if (roomId && newMessage.trim() !== "") {
      const message: ChatMessageDto = {
        type: "TALK",
        roomId: roomId,
        userId: currentUserId,
        nickname: currentNickname,
        message: newMessage,
        time: formatTime(new Date().toISOString()),
        status: "UNREAD",
      };
      // 메시지 전송 - room3
      sendMessage(`/pub/chat/message/${roomId}`, message);
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  if (!isOpen || !partnerNickname) return null;

  return (
    <ModalOverlay>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Opponent>
            <img
              src={partnerProfile || "https://via.placeholder.com/42"}
              alt="profile"
            />
            <div>{partnerNickname}</div>
          </Opponent>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody ref={modalBodyRef}>
          {messages.map((message, index) => {
            const isMine = message.userId === currentUserId;
            return (
              <MessageContainer key={index} $isMine={isMine}>
                <MessageContent $isMine={isMine}>
                  <MessageBubble $isMine={isMine}>
                    {message.message}
                  </MessageBubble>
                  <MessageTime>{message.time}</MessageTime>
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
  justify-content: center;
  align-items: center;

  img {
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
