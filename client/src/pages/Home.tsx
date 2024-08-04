import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import {
  accessTokenState,
  accessTokenExpireTimeState,
  refreshTokenState,
  refreshTokenExpireTimeState,
  userProfileState,
} from "stores/authAtom";
import styled from "styled-components";
import Header from "components/Header";
import { SearchBar } from "components/SearchBar";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { baseUrl } from "axiosInstance/constants";
import img1 from "assets/image/img1.png";
import img2 from "assets/image/img2.png";
import { UserProfile } from "types";

interface ImageData {
  src: string;
  alt: string;
}

interface ResponseData {
  code: number;
  message: string;
  data: UserProfile;
  errors: any[];
  isSuccess: boolean;
}

const imageData: ImageData[] = [
  { src: img1, alt: "Description of image 1" },
  { src: img2, alt: "Description of image 2" },
  { src: img1, alt: "Description of image 3" },
  { src: img2, alt: "Description of image 4" },
];

const Home: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setAccessToken = useSetRecoilState(accessTokenState);
  const setAccessTokenExpireTime = useSetRecoilState(
    accessTokenExpireTimeState
  );
  const setRefreshToken = useSetRecoilState(refreshTokenState);
  const setRefreshTokenExpireTime = useSetRecoilState(
    refreshTokenExpireTimeState
  );
  const setUserProfile = useSetRecoilState(userProfileState);

  const mutation = useMutation<UserProfile, Error, string>({
    mutationFn: async (token: string): Promise<UserProfile> => {
      const response = await axios.get<ResponseData>(
        `${baseUrl}/api/v1/user/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    },
    onSuccess: (data: UserProfile) => {
      setUserProfile(data); // 성공 시 유저 프로필 저장
      sessionStorage.setItem("user_profile", JSON.stringify(data)); // 세션 스토리지에 유저 프로필 저장
    },
    onError: (error: Error) => {
      console.error("Error fetching data:", error);
    },
  });

  const initialFetchRef = useRef(false);

  useEffect(() => {
    if (initialFetchRef.current) return;

    const params = new URLSearchParams(location.search);
    const accessToken = params.get("accessToken");
    const accessTokenExpireTime = params.get("accessTokenExpireTime");
    const refreshToken = params.get("refreshToken");
    const refreshTokenExpireTime = params.get("refreshTokenExpireTime");

    if (accessToken) {
      // URL에서 토큰 관련 데이터 추출 후 세션 스토리지에 저장
      sessionStorage.setItem("access_token", accessToken);
      sessionStorage.setItem(
        "access_token_expire_time",
        accessTokenExpireTime || ""
      );
      sessionStorage.setItem("refresh_token", refreshToken || "");
      sessionStorage.setItem(
        "refresh_token_expire_time",
        refreshTokenExpireTime || ""
      );

      setAccessToken(accessToken);
      setAccessTokenExpireTime(accessTokenExpireTime || "");
      setRefreshToken(refreshToken || "");
      setRefreshTokenExpireTime(refreshTokenExpireTime || "");

      params.delete("accessToken");
      params.delete("accessTokenExpireTime");
      params.delete("refreshToken");
      params.delete("refreshTokenExpireTime");

      navigate(
        {
          pathname: location.pathname,
          search: params.toString(),
        },
        { replace: true }
      );

      mutation.mutate(accessToken);
      initialFetchRef.current = true; // 중복 실행 방지용
    }
  }, [
    location,
    navigate,
    setAccessToken,
    setAccessTokenExpireTime,
    setRefreshToken,
    setRefreshTokenExpireTime,
  ]);

  return (
    <>
      <Header />
      <Container>
        <MainSection>
          <SearchBar navigation />
          <TitleSection>
            <MainTitle>Our feed</MainTitle>
            <SubTitle>2024-LeadMe</SubTitle>
          </TitleSection>
          <FeedGrid>
            {imageData.map((img, index) => (
              <FeedItem key={index}>
                <FeedImage src={img.src} alt={img.alt} />
              </FeedItem>
            ))}
          </FeedGrid>
        </MainSection>
      </Container>
    </>
  );
};

const Container = styled.div`
  min-width: 1120px;

  display: flex;
  justify-content: center;
  align-items: center;
  margin: 50px auto;
`;

const MainSection = styled.div`
  width: 820px;
  height: 520px;
  border-radius: 20px;
  background: linear-gradient(
    118deg,
    rgba(255, 255, 255, 0.26) 5.72%,
    rgba(255, 255, 255, 0.07) 94.28%
  );
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(25px);
  display: flex;
  flex-direction: column;
  padding: 35px;
  gap: 20px;
`;

const TitleSection = styled.div`
  width: 100%;
`;

const MainTitle = styled.h1`
  font-size: 28px;
  font-weight: bold;
`;

const SubTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  margin: 12px 0 8px;
`;

const FeedGrid = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
`;

const FeedItem = styled.div`
  width: 175px;
  height: 280px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

const FeedImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export default Home;
