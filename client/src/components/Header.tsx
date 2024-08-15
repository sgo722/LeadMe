import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  accessTokenState,
  accessTokenExpireTimeState,
  refreshTokenState,
  refreshTokenExpireTimeState,
  userProfileState,
} from "stores/authAtom";
import styled from "styled-components";
import { FaYoutube } from "react-icons/fa";
import { LoginModal } from "components/LoginModal";
import useAuth from "hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "axiosInstance/constants";
import { UserProfile } from "types";
import Joyride, {
  CallBackProps,
  Step,
  STATUS,
  EVENTS,
  ACTIONS,
} from "react-joyride";

interface HeaderProps {
  stickyOnly?: boolean;
  loginModal?: boolean;
  setLoginModal?: React.Dispatch<React.SetStateAction<boolean>>;
  showGuide?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  stickyOnly = false,
  loginModal: externalLoginModal,
  setLoginModal: externalSetLoginModal,
  showGuide = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [runGuide, setRunGuide] = useState<boolean>(false);

  // 가이드
  useEffect(() => {
    if (showGuide) {
      const hasSeenGuide = localStorage.getItem("hasSeenHomeGuide");
      if (!hasSeenGuide) {
        setRunGuide(true);
        localStorage.setItem("hasSeenHomeGuide", "true");
      }
    }
  }, [showGuide]);

  // 가이드 멘트
  const steps: Step[] = [
    {
      target: '[data-joyride="feed"]',
      content: (
        <>
          회원들의 피드를
          <br />볼 수 있어요 !
        </>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-joyride="challenge"]',
      content: (
        <>
          챌린지를 연습, 녹화
          <br />할 수 있어요 !
        </>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-joyride="battle"]',
      content: (
        <>
          친구와 챌린지
          <br />
          대결을 할 수 있어요 !
        </>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-joyride="guide"]',
      content: (
        <>
          원하는 챌린지를
          <br />
          골라 연습할 수 있어요!
        </>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-joyride="rank"]',
      content: (
        <>
          사용자들의 랭킹을
          <br />
          확인할 수 있어요!
        </>
      ),
      disableBeacon: true,
    },
  ];

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { action, status, type } = data;
    if (type === EVENTS.STEP_AFTER && action === ACTIONS.CLOSE) {
      setRunGuide(false);
    } else if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunGuide(false);
    }
  }, []);

  //props로 상태를 받으면 받은걸 사용하고 없으면 내부 상태 사용
  const [internalLoginModal, setInternalLoginModal] = useState<boolean>(false);
  const [sessionUser, setSessionUser] = useRecoilState(userProfileState);
  const loginModal =
    externalLoginModal !== undefined ? externalLoginModal : internalLoginModal;
  const setLoginModal = externalSetLoginModal || setInternalLoginModal;
  const setAccessToken = useSetRecoilState(accessTokenState);
  const setAccessTokenExpireTime = useSetRecoilState(
    accessTokenExpireTimeState
  );
  const setRefreshToken = useSetRecoilState(refreshTokenState);
  const setRefreshTokenExpireTime = useSetRecoilState(
    refreshTokenExpireTimeState
  );

  const accessToken = useRecoilValue(accessTokenState);
  const isLogin = !!accessToken;

  const mutation = useMutation<UserProfile, Error, string>({
    mutationFn: async (token: string): Promise<UserProfile> => {
      const response = await axios.get<{ data: UserProfile }>(
        `${baseUrl}/api/v1/user/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    },
    onSuccess: (data: UserProfile) => {
      setSessionUser(data); // 성공 시 유저 프로필 저장
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

  useEffect(() => {
    if (isLogin) {
      const user = fetchSessionUserData();
      setSessionUser(user);
    } else {
      setSessionUser(null);
    }
  }, [isLogin]);

  const fetchSessionUserData = () => {
    const userData = sessionStorage.getItem("user_profile");
    return userData ? (JSON.parse(userData) as UserProfile) : null;
  };

  const { logout } = useAuth();

  const getPageTitle = (path: string): string => {
    switch (path) {
      case "/home":
        return "LeadMe";
      case "/challenge":
        return "Challenge";
      case "/rank":
        return "Rank";
      case "/battle":
        return "Battle";
      case "/guide":
        return "Guide";
      default:
        return "LeadMe";
    }
  };

  const handleCloseModal = () => {
    setLoginModal(false);
  };

  return (
    <>
      <Joyride
        steps={steps}
        run={runGuide}
        showSkipButton
        showProgress
        continuous
        disableOverlayClose
        disableCloseOnEsc
        disableScrolling={true}
        disableScrollParentFix
        spotlightClicks={false}
        disableOverlay={false}
        styles={{
          options: {
            arrowColor: "#ffffff",
            backgroundColor: "#ffffff",
            overlayColor: "rgba(0, 0, 0, 0.5)",
            primaryColor: "#ee5050",
            textColor: "#333333",
            zIndex: 99999,
          },
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 99999,
            overflow: "hidden",
            pointerEvents: "auto",
          },
          tooltip: {
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            padding: "16px",
            width: "300px",
          },
          tooltipContainer: {
            textAlign: "center",
          },

          tooltipContent: {
            fontSize: "20px",
            lineHeight: "1.5",
            color: "#ee5050",
            marginTop: "20px",
            padding: "0px",
            fontFamily: "Rajdhani",
            fontWeight: "700",
          },
          buttonNext: {
            backgroundColor: "#ee5050",
            borderRadius: "4px",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: "500",
            transition: "background-color 0.3s ease",
            border: "1px solid #ee5050",
          },
          buttonBack: {
            color: "#ee5050",
            backgroundColor: "#ffffff",
            border: "1px solid #ee5050",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "500",
            marginRight: "8px",
            padding: "8px 16px",
          },
          buttonSkip: {
            color: "#999999",
            fontSize: "14px",
          },
          buttonClose: {
            color: "#ee5050",
            fontSize: "14px",
            fontWeight: "500",
          },
          spotlight: {
            borderRadius: "12px",
            transition: "none",
          },
        }}
        callback={handleJoyrideCallback}
      />
      {loginModal ? <LoginModal onClose={handleCloseModal} /> : null}
      {!stickyOnly && (
        <HeaderWrapper>
          <Top>
            <TopLeft>
              Let's dance with
              <br />
              LeadMe
            </TopLeft>
            <TopCenter>
              <a href="">{getPageTitle(location.pathname)} !</a>
            </TopCenter>
            <TopRight>
              <SnsBox>
                YouTube
                <FaYoutube />
              </SnsBox>
              {/* <SnsBox>
                TikTok
                <FaTiktok />
              </SnsBox> */}
            </TopRight>
          </Top>
        </HeaderWrapper>
      )}
      <StickyNav>
        <NavContent>
          <StyledLink to="/home" data-joyride="home">
            home
          </StyledLink>
          <StyledLink to="/feed" data-joyride="feed">
            feed
          </StyledLink>
          <StyledLink to="/challenge" data-joyride="challenge">
            challenge
          </StyledLink>
          <StyledLink to="/battle" data-joyride="battle">
            battle
          </StyledLink>
          <StyledLink to="/guide" data-joyride="guide">
            guide
          </StyledLink>
          <StyledLink to="/rank" data-joyride="rank">
            rank
          </StyledLink>
          {isLogin && sessionUser ? (
            <LeftContainer>
              <Mypage>
                mypage
                <Fake>
                  <LeftHoverBox>
                    <HoverLink to={`/mypage/${sessionUser.id}`}>
                      마이페이지
                    </HoverLink>
                    <Hr />
                    <HoverDiv onClick={() => navigate("/chat")}>
                      메세지 목록
                    </HoverDiv>
                  </LeftHoverBox>
                </Fake>
              </Mypage>
              <LeftBtn
                onClick={() => {
                  logout();
                }}
              >
                logout
              </LeftBtn>
            </LeftContainer>
          ) : (
            <LeftContainer>
              <LeftBtn
                onClick={() => {
                  setLoginModal(!loginModal);
                }}
              >
                login
              </LeftBtn>
            </LeftContainer>
          )}
        </NavContent>
      </StickyNav>
    </>
  );
};

const HeaderWrapper = styled.header`
  min-width: 1080px;
  margin: 14px 20px -5px;

  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const Top = styled.div`
  padding: 22px 30px 10px;
  color: #ee5050;
  font-size: 16px;
  font-family: "Rajdhani", sans-serif;
  display: flex;
  justify-content: space-between;
  border-radius: 20px 20px 0 0;
  background: linear-gradient(
    108deg,
    rgba(255, 255, 255, 0.26) 0%,
    rgba(255, 255, 255, 0.07) 100%
  );
  box-shadow: -4px 0 4px -4px rgba(0, 0, 0, 0.15),
    4px 0 4px -4px rgba(0, 0, 0, 0.15), 0 -4px 4px -4px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
`;

const TopLeft = styled.div`
  width: 200px;
  text-align: left;
  font-weight: 600;
`;

const TopCenter = styled.div`
  font-weight: 700;
  font-size: 76px;
  margin: 2px 0 6px;

  a {
    color: inherit;
    text-decoration: none;
  }
`;

const TopRight = styled.div`
  width: 200px;
  text-align: right;
  font-weight: 600;
`;

const SnsBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 5px;
  gap: 10px;
`;

const LeftContainer = styled.div`
  position: absolute;
  right: 22px;

  display: flex;
  flex-direction: row;
`;

const LeftBtn = styled.div`
  font-family: "Noto Sans", sans-serif;
  font-size: 15px;
  color: #ee5050;
  border: none;
  padding: 9px 12px;
  background-color: inherit;
  text-decoration: none;
  margin: 0 12px;
  position: relative;
  cursor: pointer;

  &:hover {
    color: #ff7676;
    text-decoration: underline;
  }
`;

const Mypage = styled.div`
  font-family: "Noto Sans", sans-serif;
  font-size: 15px;
  color: #ee5050;
  border: none;
  padding: 9px 14px;
  background-color: inherit;
  text-decoration: none;
  margin: 0 12px;
  position: relative;
  cursor: default;

  &:hover {
    div {
      display: block;
    }
  }
`;

const Fake = styled.div`
  display: none;
  position: absolute;
  left: -44px;
  top: 30px;
  padding: 16px;
`;

const LeftHoverBox = styled.div`
  width: 135px;
  top: 48px;
  z-index: 9999;
  padding: 1px 0;

  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.85);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(25px);

  cursor: default;
`;

const HoverLink = styled(Link)`
  display: block;
  color: #ee5050;
  text-align: center;
  font-size: 15px;
  font-family: "Noto Sans KR", sans-serif;
  text-decoration: none;
  padding: 8px;
  margin: 6px;
`;

const HoverDiv = styled.div`
  display: block;
  color: #ee5050;
  text-align: center;
  font-size: 15px;
  font-family: "Noto Sans KR", sans-serif;
  text-decoration: none;
  padding: 8px;
  margin: 6px;
`;

const StickyNav = styled.nav`
  min-width: 1080px;
  position: sticky;
  top: 0px;
  z-index: 999;
  margin: 0px 20px;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 1) 80%,
    rgba(255, 255, 255, 0) 100%
  );
  border-radius: 0 0 20px 20px;

  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const NavContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2.5px 0;
  background: linear-gradient(
    108deg,
    rgba(255, 255, 255, 0.26) 0%,
    rgba(255, 255, 255, 0.07) 100%
  );
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 0 0 20px 20px;
  position: relative;
`;

const StyledLink = styled(Link)`
  color: #ee5050;
  font-size: 16px;
  font-family: "Noto Sans", sans-serif;
  text-decoration: none;
  padding: 9px 14px;
  margin: 0 16px;
  position: relative;
  display: inline-block;

  &::after {
    content: attr(data-joyride);
    content: attr(data-joyride) / "";
    height: 2px;
    bottom: 3px;
    position: absolute;
    left: 14px;
    transform: scaleX(0);
    transform-origin: left;
    background-color: #ee5050;
    transition: transform 0.3s ease-out;
    white-space: nowrap;
    color: transparent;
    pointer-events: none;
  }

  &:hover {
    color: #ee5050;
  }

  &:hover::after {
    transform: scaleX(1);
  }
`;

const Hr = styled.hr`
  border: 1px solid white;
  margin: 0;
`;

export default Header;
