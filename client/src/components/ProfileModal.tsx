import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { UserProfile, ResponseData } from "types";
import { accessTokenState } from "stores/authAtom";
import { baseUrl } from "axiosInstance/constants";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface ModalProps {
  onClose: () => void;
  user: UserProfile; // 유저 데이터를 받는 props 추가
}

const Modal: React.FC<ModalProps> = ({ onClose, user }) => {
  const [nickname, setNickname] = useState(user.nickname);
  const [info, setInfo] = useState<{
    message: string;
    isAvailable: boolean | null;
  }>({
    message: "",
    isAvailable: null,
  });
  const [profileComment, setProfileComment] = useState(
    user.profileComment || ""
  );
  const accessToken = useRecoilValue(accessTokenState);

  const handleSaveChanges = () => {
    // 여기서 변경된 데이터를 저장하는 로직을 구현합니다.
    // 예를 들어, API 호출 등을 통해 변경 사항을 저장할 수 있습니다.
    onClose();
  };

  const mutation = useMutation<boolean, Error, string>({
    mutationFn: async (value: string) => {
      const response = await axios.get<ResponseData<{ response: boolean }>>(
        `${baseUrl}/api/v1/user/check`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { nickname: value },
        }
      );
      return response.data.data.response;
    },
    onSuccess: (data) => {
      if (data) {
        setInfo({ message: "사용 가능한 아이디입니다.", isAvailable: true });
      } else {
        setInfo({ message: "사용 불가능한 아이디입니다.", isAvailable: false });
      }
    },
    onError: (error: Error) => {
      console.error("Error fetching data:", error);
    },
  });

  const handleCheckNickname = () => {
    mutation.mutate(nickname);
  };

  return (
    <Overlay>
      <Container>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>Profile</Title>
        <ProfileImg src={user.profileImg} alt="프로필 이미지" />
        <Form>
          <Flex>
            <div>
              {info.isAvailable !== null && info.message.length > 0 && (
                <>
                  {info.isAvailable ? (
                    <SuccessMessage>
                      <FaCheckCircle />
                      {info.message}
                    </SuccessMessage>
                  ) : (
                    <ErrorMessage>
                      <FaTimesCircle />
                      {info.message}
                    </ErrorMessage>
                  )}
                </>
              )}
            </div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                const newNickname = e.target.value;
                setNickname(newNickname);
                if (newNickname === user.nickname) {
                  setInfo({ message: "", isAvailable: true });
                } else {
                  setInfo({ message: "", isAvailable: null });
                }
              }}
            />
            <CheckButton onClick={handleCheckNickname}>중복 확인</CheckButton>
          </Flex>
          <input
            type="text"
            value={profileComment}
            onChange={(e) => setProfileComment(e.target.value)}
          />
          <SaveButton
            onClick={handleSaveChanges}
            disabled={
              !(nickname === user.nickname || info.isAvailable === true)
            }
            $isActive={nickname === user.nickname || info.isAvailable === true}
          >
            change
          </SaveButton>
        </Form>
      </Container>
    </Overlay>
  );
};

const Overlay = styled.div`
  min-width: 1120px;
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
`;

const Container = styled.div`
  width: 450px;
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 8px;
  padding: 40px 36px 28px;

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

const Title = styled.div`
  text-align: center;
  font-family: "Rajdhani", sans-serif;
  font-size: 40px;
  font-weight: 600;
  margin-bottom: 20px;
`;

const ProfileImg = styled.img`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: #ececec;
  margin-bottom: 24px;
`;

const Form = styled.form`
  width: 92%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  & > input {
    width: 100%;
    min-width: 348px;
    color: #ee5050;
    font-family: "Noto Sans KR", sans-serif;
    font-size: 14px;
    border: none;
    box-shadow: inset -2px -2px 4px 4px rgba(255, 255, 255, 0.8),
      inset 1px 1px 2px 2px rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    margin-bottom: 20px;
    outline: none;
    padding: 9.5px 20px;
  }

  input::placeholder {
    color: #ee5050;
    font-size: 16px;
  }

  & > input::placeholder {
    font-size: 14px;
  }
`;

interface SaveButtonProps {
  $isActive: boolean;
}

const SaveButton = styled.button<SaveButtonProps>`
  color: ${({ $isActive }) => ($isActive ? "#ffffff" : "#ee5050")};
  background-color: ${({ $isActive }) =>
    $isActive ? "#4CAF50" : "rgba(255, 255, 255, 0.8)"};
  font-size: 21px;
  font-weight: 500;
  font-family: "Noto Sans", sans-serif;
  width: 100%;
  border: none;
  border-radius: 6px;
  padding: 6px 0;
  margin: 8px 0;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  cursor: ${({ $isActive }) => ($isActive ? "pointer" : "not-allowed")};
  opacity: ${({ $isActive }) => ($isActive ? 1 : 0.6)};
`;

const Flex = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  position: relative;

  & > div:first-child {
    position: absolute;
    top: -16px;
    width: 100%;
    text-align: center;
  }

  & > input {
    width: 248px;
    color: #ee5050;
    font-family: "Noto Sans KR", sans-serif;
    font-size: 14px;
    border: none;
    box-shadow: inset -2px -2px 4px 4px rgba(255, 255, 255, 0.8),
      inset 1px 1px 2px 2px rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    margin-bottom: 18px;
    outline: none;
    padding: 9.5px 20px;
  }

  input::placeholder {
    color: #ee5050;
    font-size: 16px;
  }

  & > input::placeholder {
    font-size: 14px;
  }
`;

const CheckButton = styled.div`
  width: 84px;
  height: 39px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  background-color: #f3f3f3;
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25);
  font-size: 14px;
  font-family: "Noto Sans KR", sans-serif;
  font-weight: 400;
  cursor: pointer;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  color: #6faf6f;
  font-size: 12px;
  font-family: "Noto Sans KR", sans-serif;
  font-weight: 400;

  svg {
    margin-right: 5px;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  color: #ff5454;
  font-size: 12px;
  font-family: "Noto Sans KR", sans-serif;
  font-weight: 400;

  svg {
    margin-right: 5px;
  }
`;

export default Modal;
