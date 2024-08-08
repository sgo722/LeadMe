import React, { useState, useEffect } from "react";
import Header from "components/Header";
import styled from "styled-components";
import { ChatModal } from "features/Chat/ChatModal";
import { IoIosSend } from "react-icons/io";
import FindModal from "features/Chat/FindeModal";
import { userProfileState } from "stores/authAtom";
import { useRecoilState } from "recoil";
import axios from "axios";
import useWebSocket from "utils/useWebSocket";
import { baseUrl } from "axiosInstance/constants";
import { useLocation } from "react-router-dom";

interface ChatRoomGetResponse {
  roomId: number;
  userId: number;
  userNickname: string;
  userImageUrl: string;
  partnerId: number;
  partnerNickname: string;
  partnerImageUrl: string;
  lastChatMessageDto: ChatMessageDto;
}

interface ChatMessageDto {
  type: string;
  roomId: number;
  userId: number;
  nickname: string;
  message: string | undefined;
  time: string;
  status: string;
}

interface ResponseData<T> {
  code: number;
  message: string | undefined;
  data: T;
  errors: object;
  isSuccess: boolean;
}

export const Chat: React.FC = () => {
  const location = useLocation();
  const [selectedNickname, setSelectedNickname] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(
    null
  );
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [chatList, setChatList] = useState<ChatRoomGetResponse[]>([]);
  const [userProfile, setUserProfile] = useRecoilState(userProfileState);
  const currentUserId = userProfile?.id || 0; // 로그인한 유저의 userId
  const currentNickname = userProfile?.nickname || "defaultUser"; // 로그인한 유저의 닉네임
  const { connectWebSocket, subscribeToChannel } = useWebSocket();

  // 세션 스토리지에서 유저 프로필 데이터를 불러와 Recoil 상태 초기화
  useEffect(() => {
    const savedUserProfile = sessionStorage.getItem("user_profile");

    if (savedUserProfile) {
      setUserProfile(JSON.parse(savedUserProfile));
    }
  }, [setUserProfile]);

  useEffect(() => {
    if (location.state) {
      const { id, nickname, profileImg } = location.state as {
        id: number;
        nickname: string;
        profileImg: string;
      };
      setSelectedNickname(nickname);
      setSelectedPartnerId(id);
      setSelectedProfile(profileImg);
    }
  }, [location.state]);

  useEffect(() => {
    if (currentUserId) {
      // 웹소켓 연결 요청 - 1
      connectWebSocket();

      // 채팅 목록 조회 - 2
      axios
        .get<ResponseData<ChatRoomGetResponse[]>>(
          `${baseUrl}/api/v1/chat/room/list`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
            },
          }
        )
        .then((response) => {
          console.log("채팅 목록", response.data);
          const chatRooms = response.data.data;
          if (Array.isArray(chatRooms)) {
            setChatList(chatRooms);

            // 각 채팅에 대해 소켓 구독 요청 - 3
            chatRooms.forEach((chatRoom) => {
              subscribeToChannel(
                `/sub/chat/message/${chatRoom.roomId}`,
                (message) => {
                  console.log("New message received: ", message);
                }
              );
            });
          } else {
            console.error("Unexpected response data format:", response.data);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch chat list", error);
        });
    }
  }, [currentUserId, connectWebSocket, subscribeToChannel]);

  const openChatModal = (
    nickname: string,
    partnerId: number,
    profile: string
  ) => {
    setSelectedNickname(nickname);
    setSelectedPartnerId(partnerId);
    setSelectedProfile(profile);
  };

  const closeModal = () => {
    setSelectedNickname(null);
    setSelectedPartnerId(null);
    setSelectedProfile(null);
  };

  const openSendModal = () => {
    setIsSendModalOpen(true);
  };

  const closeSendModal = () => {
    setIsSendModalOpen(false);
  };

  return (
    <>
      <Header stickyOnly />
      <Container>
        <ChatListContainer>
          <ChatListTitle>Message</ChatListTitle>
          <OverFrow>
            {chatList.length === 0 ? (
              <NoChatsMessage>아직 대화한 상대가 없습니다.</NoChatsMessage>
            ) : (
              chatList.map((chat) => (
                <ChatListItem
                  key={chat.roomId}
                  onClick={() =>
                    openChatModal(
                      chat.partnerId !== currentUserId
                        ? chat.partnerNickname
                        : chat.userNickname,
                      chat.partnerId !== currentUserId
                        ? chat.partnerId
                        : chat.userId,
                      chat.partnerId !== currentUserId
                        ? chat.partnerImageUrl
                        : chat.userImageUrl
                    )
                  }
                >
                  <UserProfileImage
                    src={
                      chat.partnerId !== currentUserId
                        ? chat.partnerImageUrl
                        : chat.userImageUrl
                    }
                    alt={`${
                      chat.partnerId !== currentUserId
                        ? chat.partnerNickname
                        : chat.userNickname
                    }'s profile`}
                  />
                  <ChatPreviewInfo>
                    <ChatUserName>
                      {chat.partnerId !== currentUserId
                        ? chat.partnerNickname
                        : chat.userNickname}
                    </ChatUserName>
                    <ChatPreviewMessage>
                      {chat.lastChatMessageDto.message}
                    </ChatPreviewMessage>
                  </ChatPreviewInfo>
                </ChatListItem>
              ))
            )}
          </OverFrow>
        </ChatListContainer>
        <FindContainer>
          <div>대화 상대를 찾고 메세지를 보내보세요</div>
          {!selectedNickname && (
            <MessageButton onClick={openSendModal}>
              <StyledIoIosSend />
              send
            </MessageButton>
          )}
        </FindContainer>
        <ChatModal
          isOpen={selectedNickname !== null}
          onClose={closeModal}
          currentUserId={currentUserId}
          currentNickname={currentNickname}
          partnerNickname={selectedNickname}
          partnerId={selectedPartnerId}
          partnerProfile={selectedProfile}
        />
      </Container>
      <FindModal
        isOpen={isSendModalOpen}
        onClose={closeSendModal}
        openChatModal={openChatModal}
      />
    </>
  );
};

const Container = styled.div`
  margin: 50px auto;
  width: 1080px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  @media (max-width: 1120px) {
    margin: 50px 20px;
  }
`;

const ChatListContainer = styled.div`
  width: 380px;
  height: 564px;
  padding: 25px 20px;
  border-radius: 20px 0 0 20px;
  background: rgba(255, 255, 255, 0.4);
`;

const OverFrow = styled.div`
  width: 100%;
  height: 430px;
  overflow-y: auto;

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

const ChatListTitle = styled.h1`
  font-size: 26px;
  font-weight: 600;
  font-family: Rajdhani;
  text-align: center;
  margin: 8px 0 16px;
`;

const ChatListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 20px;
  margin: 12px 0;
  cursor: pointer;

  &:hover {
    border-radius: 12px;
    background-color: #ffffff;
  }
`;

const UserProfileImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #f0f0f0;
  margin-right: 22px;
`;

const ChatPreviewInfo = styled.div`
  flex: 1;
`;

const ChatUserName = styled.div`
  font-family: "Noto Sans KR", sans-serif;
  font-size: 16px;
  margin: 2px 0 6px;
  color: #232427;
`;

const ChatPreviewMessage = styled.div`
  width: 230px;
  color: #bdbdbd;
  font-family: "Noto Sans KR", sans-serif;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoChatsMessage = styled.div`
  text-align: center;
  color: #bdbdbd;
  font-family: "Noto Sans KR", sans-serif;
  font-weight: 400;
  font-size: 15px;
  margin-top: 24px;
`;

const FindContainer = styled.div`
  width: 700px;
  height: 564px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  div:first-child {
    font-family: "Noto Sans KR", sans-serif;
    color: #939393;
    margin-bottom: 16px;
  }
`;

const MessageButton = styled.button`
  font-family: "Noto Sans", sans-serif;
  background-color: #ffffff;
  color: #ee5050;
  border: none;
  border-radius: 4px;
  padding: 3px 15px 5px;
  cursor: pointer;
  font-size: 17px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
`;

const StyledIoIosSend = styled(IoIosSend)`
  margin-top: 2px;
  margin-right: 4px;
  color: #ee5050;
`;

export default Chat;
