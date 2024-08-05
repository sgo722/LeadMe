import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "components/Header";
import styled from "styled-components";
import img1 from "assets/image/img1.png";
import img2 from "assets/image/img2.png";
import ProfileModal from "components/ProfileModal";
import FollowModal from "components/FollowModal";

// 유저 프로필
export interface UserProfile {
  id: number;
  name: string;
  nickname: string;
  email: string;
  gender: string | null;
  age: number | null;
  roleType: string;
  profileImg: string;
  profileComment: string | null;
  loginDateTime: string | null;
  userStatus: string;
}

interface ImageData {
  id: number;
  src: string;
  title: string;
}

const imageData: ImageData[] = [
  {
    id: 1,
    src: img1,
    title: "윈터와 카리나의 블라 블라 ",
  },
  {
    id: 2,
    src: img2,
    title: "카리나 챌린지 카리나 챌린지 카리나asdf 챌린지 카리나 챌린지",
  },
  { id: 3, src: img1, title: "이주은 챌린지" },
  { id: 4, src: img2, title: "카리나 챌린지 카리나 챌린지" },
  { id: 5, src: img1, title: "추가 이미지 1" },
  { id: 6, src: img2, title: "추가 이미지 2" },
  { id: 7, src: img1, title: "추가 이미지 3" },
];

const Mypage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<
    "follower" | "following" | null
  >(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUserProfile = sessionStorage.getItem("user_profile");

    if (savedUserProfile) {
      setUser(JSON.parse(savedUserProfile));
    }
  }, []);

  const handleOpenProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleOpenFollowModal = (type: "follower" | "following") => {
    setFollowModalType(type);
    setIsFollowModalOpen(true);
  };

  const handleCloseFollowModal = () => {
    setIsFollowModalOpen(false);
  };

  const handleMessagesClick = () => {
    if (user) {
      navigate(`/chat/${user.id}`);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header stickyOnly />
      <Container>
        <MainSection>
          <ProfileTitle>Profile</ProfileTitle>
          <ProfileContainer>
            <Flex>
              <ProfileImg src={user.profileImg} alt="프로필 이미지" />
              <table>
                <tbody>
                  <Tr>
                    <Th>아이디</Th>
                    <Td first>{user.nickname}</Td>
                  </Tr>
                  <Tr>
                    <Th>한 줄 소개</Th>
                    <Td>{user.profileComment}</Td>
                  </Tr>
                  <Tr onClick={() => handleOpenFollowModal("follower")}>
                    <Th>팔로워</Th>
                    <Td>{}</Td>
                  </Tr>
                  <Tr onClick={() => handleOpenFollowModal("following")}>
                    <Th>팔로잉</Th>
                    <Td>{}</Td>
                  </Tr>
                </tbody>
              </table>
            </Flex>
            <BtnContainer>
              <Btn onClick={handleMessagesClick}>메세지 목록</Btn>
              <Btn onClick={handleOpenProfileModal}>프로필 편집</Btn>
            </BtnContainer>
          </ProfileContainer>
        </MainSection>
        <MainSection>
          <FeedTitle>Feed</FeedTitle>
          <FeedContainer>
            {imageData.map((img) => (
              <OneFeed key={img.id}>
                <OneImg src={img.src} />
                <OneTitle>{img.title}</OneTitle>
              </OneFeed>
            ))}
          </FeedContainer>
        </MainSection>
      </Container>
      {isProfileModalOpen && (
        <ProfileModal onClose={handleCloseProfileModal} user={user} />
      )}
      {isFollowModalOpen && followModalType && (
        <FollowModal onClose={handleCloseFollowModal} type={followModalType} />
      )}
    </>
  );
};

const Container = styled.div`
  min-width: 1120px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 50px auto;
  flex-direction: column;
`;

const MainSection = styled.div`
  width: 1080px;
  border-radius: 20px;
  background: linear-gradient(
    118deg,
    rgba(255, 255, 255, 0.26) 5.72%,
    rgba(255, 255, 255, 0.07) 94.28%
  );
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(50px);
  padding: 30px 40px 28px;
  margin: 0 20px;

  &:not(:last-child) {
    margin-bottom: 50px;
  }
`;

const ProfileTitle = styled.div`
  font-family: "Rajdhani", sans-serif;
  font-weight: 600;
  font-size: 30px;
  margin-left: 6px;
`;

const FeedTitle = styled.div`
  font-family: "Rajdhani", sans-serif;
  font-weight: 600;
  font-size: 40px;
`;

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: end;
`;

const Flex = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: -6px;
`;

const ProfileImg = styled.img`
  width: 90px;
  height: 90px;
  background-color: white;
  border-radius: 50%;
  margin-right: 60px;
  margin-top: 8px;
`;

const Tr = styled.tr`
  text-align: left;

  &:nth-child(n + 3) {
    cursor: pointer;
  }
`;

const Th = styled.th`
  font-size: 14px;
  color: #a7a7a7;
  width: 160px;
  padding: 6px;
`;

interface TdProps {
  first?: boolean;
}

const Td = styled.td.withConfig({
  shouldForwardProp: (prop) => prop !== "first",
})<TdProps>`
  font-family: "Noto Sans", sans-serif;
  font-size: ${(props) => (props.first ? "20px" : "14px")};
  font-weight: ${(props) => (props.first ? "500" : "400")};
  color: #ee5050;
  padding: 10px;
`;

const BtnContainer = styled.div`
  display: flex;
  margin-bottom: 8px;
`;

const Btn = styled.div`
  font-size: 15px;
  font-family: "Noto Sans KR", sans-serif;
  background-color: rgba(255, 255, 255, 0.65);
  border-radius: 4px;
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.15);
  padding: 7px 14px;
  margin-left: 14px;
  margin-bottom: -2px;
  transition: background-color, 0.3s;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.85);
  }
`;

const FeedContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const OneFeed = styled.div`
  width: 200px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  margin: 12px 0;
  &:hover {
    img {
      transform: scale(1.05);
    }
  }
  &:not(:nth-child(4n)) {
    margin-right: 66.6px;
  }
`;

const OneImg = styled.img`
  width: 200px;
  height: 355.5px;
  border-radius: 8px;
  object-fit: cover;
  margin: 10px 0 12px;
  transition: all 0.3s ease;
  cursor: pointer;
`;

const OneTitle = styled.div`
  color: #ee5050;
  font-family: "Noto Sans KR", sans-serif;
  font-weight: 500;
  width: 100%;
  max-height: 40px;
  font-size: 16px;
  line-height: 1.2;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export default Mypage;
