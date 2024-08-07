import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { accessTokenState, userProfileState } from "stores/authAtom";
import styled from "styled-components";
import { FaTiktok } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";
import { LoginModal } from "components/LoginModal";
import useAuth from "hooks/useAuth";

interface HeaderProps {
  stickyOnly?: boolean;
}

const Header: React.FC<HeaderProps> = ({ stickyOnly = false }) => {
  const location = useLocation();
  const [loginModal, setLoginModal] = useState<boolean>(false);

  const accessToken = useRecoilValue(accessTokenState);
  const userProfile = useRecoilValue(userProfileState);
  const currentUserId = userProfile?.id;
  const isLogin = !!accessToken;

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
      default:
        return "LeadMe";
    }
  };

  const handleCloseModal = () => {
    setLoginModal(false);
  };

  return (
    <>
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
              <SnsBox>
                TikTok
                <FaTiktok />
              </SnsBox>
            </TopRight>
          </Top>
        </HeaderWrapper>
      )}
      <StickyNav>
        <NavContent>
          <StyledLink to="/home">home</StyledLink>
          <StyledLink to="/feed">feed</StyledLink>
          <StyledLink to="/practice">practice</StyledLink>
          <StyledLink to="/battle">battle</StyledLink>
          <StyledLink to="/challenge">challenge</StyledLink>
          <StyledLink to="/rank">rank</StyledLink>
          {isLogin ? (
            <LeftContainer>
              <Mypage>
                mypage
                <Fake>
                  <LeftHoverBox>
                    <HoverLink to={`/mypage/${currentUserId}`}>
                      마이페이지
                    </HoverLink>
                    <Hr />
                    <HoverLink to="/chat">메세지 목록</HoverLink>
                  </LeftHoverBox>
                </Fake>
              </Mypage>
              <LeftBtn onClick={logout}>logout</LeftBtn>
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

  &:hover {
    color: #ff7676;
    text-decoration: underline;
  }
`;

const Hr = styled.hr`
  border: 1px solid white;
  margin: 0;
`;

export default Header;
