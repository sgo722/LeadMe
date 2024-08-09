import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { IoIosSend } from "react-icons/io";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { ResponseData } from "types";
import { baseUrl } from "axiosInstance/constants";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { accessTokenState } from "stores/authAtom";

interface FollowModalProps {
  onClose: () => void;
  type: string;
}

interface PeopleProps {
  id: number;
  nickname: string;
  profileImg: string;
}

const FollowModal: React.FC<FollowModalProps> = ({ onClose, type }) => {
  const navigate = useNavigate();
  const accessToken = useRecoilValue(accessTokenState);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const mutationFollow = useMutation<PeopleProps[], Error, string>({
    mutationFn: async (value: string) => {
      const response = await axios.get<ResponseData<PeopleProps[]>>(
        `${baseUrl}/api/v1/user/${value}/list`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return response.data.data;
    },
    onSuccess: (data: PeopleProps[]) => {
      console.log(data);
      setPeople(data);
    },
    onError: (error: Error) => {
      console.error("Error fetching user data:", error);
    },
  });

  const [people, setPeople] = useState<PeopleProps[]>([]);

  const [localAccessToken, setLocalAccessToken] = useState<string | null>(null);

  useEffect(() => {
    setLocalAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (type && localAccessToken) {
      mutationFollow.mutate(type);
    }
  }, [type, localAccessToken]);

  const handleSend = (
    user: PeopleProps,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    navigate("/chat", { state: user });
  };

  const handleNavigateMypage = (id: number) => {
    navigate(`/mypage/${id}`);
    onClose();
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Container onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>{type === "follower" ? "Follower" : "Following"}</Title>
        <OverContainer>
          {people && people.length > 0 ? (
            people.map((user) => (
              <UserRow
                key={user.id}
                onClick={() => handleNavigateMypage(user.id)}
              >
                <UserImg src={user.profileImg} alt={`${user.nickname}`} />
                <UserId>{user.nickname}</UserId>
                <MessageButton onClick={(e) => handleSend(user, e)}>
                  <StyledIoIosSend />
                  send
                </MessageButton>
              </UserRow>
            ))
          ) : (
            <None>No {type}</None>
          )}
        </OverContainer>
      </Container>
    </Overlay>
  );
};

const StyledIoIosSend = styled(IoIosSend)`
  margin-top: 2px;
  margin-right: 4px;
  color: #ee5050;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  min-width: 1120px;
`;

const Container = styled.div`
  width: 420px;
  height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 8px;
  padding: 40px 0 48px;
  z-index: 9999;
  border-radius: 10px;
  border: 3px solid rgba(223, 223, 223, 0.4);
  background: rgba(252, 252, 252, 0.8);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  color: #ee5050;
  cursor: pointer;
`;

const Title = styled.h2`
  text-align: center;
  font-family: "Rajdhani", sans-serif;
  font-size: 40px;
  font-weight: 600;
  margin-bottom: 24px;
`;

const OverContainer = styled.div`
  width: 100%;
  padding: 0 36px;
  height: 100%;
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

const UserRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e6e6e6;
  border-radius: 8px;
  cursor: pointer;

  &:last-child {
    border: none;
  }

  &:hover {
    background-color: #ffffff;
  }
`;

const UserImg = styled.img`
  width: 40px;
  height: 40px;
  background-color: #ebebeb;
  border-radius: 50%;
`;

const UserId = styled.div`
  font-family: "Noto Sans", sans-serif;
  font-size: 15px;
  color: #333;
  flex-grow: 1;
  margin-left: 10px;
`;

const MessageButton = styled.button`
  font-family: "Noto Sans", sans-serif;
  background-color: #ffffff;
  color: #ee5050;
  border: none;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const None = styled.div`
  margin-top: 128px;
  font-size: 20px;
  text-align: center;
  color: #dadada;
`;

export default FollowModal;
