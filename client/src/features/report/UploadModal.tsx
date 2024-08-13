import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaLock } from "react-icons/fa";
import { FaLockOpen } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import { userProfileState } from "stores/authAtom";
import { ResponseData } from "types";
import { axiosInstance } from "axiosInstance/apiClient";
import { getJWTHeader } from "axiosInstance/apiClient";

interface scoreData {
  uuid: string;
  youtubeId: string;
  challengeId: string;
  totalScore: number;
  scoreHistory: number[];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: scoreData | null;
}

interface UploadData {
  userChallengeId: number;
  fileName: string;
  challengeId: number;
}

const UpdateModal: React.FC<ModalProps> = ({ isOpen, onClose, reportData }) => {
  const [inputValue, setInputValue] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const userProfile = useRecoilValue(userProfileState);
  const navigate = useNavigate();

  useEffect(() => {
    setIsDisabled(inputValue.length === 0);
  }, [inputValue]);

  const mutation = useMutation<UploadData, Error, string>({
    mutationFn: async (access: string): Promise<UploadData> => {
      if (!reportData || !userProfile) throw new Error("Missing data");

      const requestData = {
        challengeId: reportData.challengeId,
        userId: userProfile.id,
        uuid: reportData.uuid,
        fileName: inputValue,
        access: access,
      };

      const response = await axiosInstance.post<ResponseData<UploadData>>(
        "/api/v1/userChallenge/temporary/save",
        requestData,
        { headers: getJWTHeader() }
      );

      if (!response.data.isSuccess) {
        throw new Error(response.data.message);
      }
      console.log(requestData);

      return response.data.data;
    },
    onSuccess: (data: UploadData) => {
      console.log("Response:", data);
      alert("업로드 완료");
      onClose(); // 요청이 성공하면 모달 닫기
      navigate(`/mypage/${data.userChallengeId}`); // 업로드 된 영상 디테일 페이지로 이동 (수정 필요)
    },
    onError: (error) => {
      console.error("Error uploading data:", error);
    },
  });

  const handleUpload = (access: string) => {
    if (!isDisabled) {
      mutation.mutate(access);
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Container onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>Upload</Title>
        <Form>
          <input
            type="text"
            placeholder="업로드 제목"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Info>공개 비공개 여부는 추후에도 수정이 가능합니다.</Info>
          <Flex>
            <PrivateBtn
              disabled={isDisabled}
              onClick={() => handleUpload("private")}
            >
              <FaLock size="16" color="#d6d6d6" />
              <div>private</div>
            </PrivateBtn>
            <PuplicBtn
              disabled={isDisabled}
              onClick={() => handleUpload("public")}
            >
              <FaLockOpen size="18" color="#d6d6d6" />
              <div>public</div>
            </PuplicBtn>
          </Flex>
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
  width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 8px;
  padding: 40px 36px 28px;

  z-index: 9999;
  border-radius: 10px;
  border: 3px solid rgba(223, 223, 223, 0.4);
  background: rgba(252, 252, 252, 0.7);
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
  font-size: 44px;
  font-weight: 600;
  margin-bottom: 20px;
`;

const Form = styled.form`
  width: 96%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  input {
    width: 100%;
    min-width: 348px;
    color: #232427;
    font-family: "Noto Sans KR", sans-serif;
    font-size: 14px;
    border: 3px solid rgba(223, 223, 223, 0.4);
    background-color: rgba(255, 255, 255, 0.85);
    border-radius: 8px;
    outline: none;
    text-align: center;
    padding: 8px 20px;
  }

  input::placeholder {
    color: #aaaaaa;
    font-size: 16px;
    font-weight: 400;
  }
`;

const Info = styled.div`
  color: #d2d2d2;
  text-align: center;
  font-size: 12px;
  margin: 40px 0px 30px;
`;

const Flex = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
`;

const PrivateBtn = styled.div<{ disabled: boolean }>`
  color: ${({ disabled }) => (disabled ? "#c0c0c0" : "#ee5050")};
  font-size: 20px;
  font-weight: 600;
  font-family: "Rajdhani", sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48%;
  border: none;
  border-radius: 8px;
  padding: 8px 0;
  border: 3px solid rgba(223, 223, 223, 0.4);
  background-color: rgba(255, 255, 255, 0.85);
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25);
  margin-bottom: 16px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

  & > div {
    margin-left: 10px;
  }
`;

const PuplicBtn = styled(PrivateBtn)``;

export default UpdateModal;
