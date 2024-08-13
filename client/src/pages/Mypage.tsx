import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import Header from "components/Header";
import styled from "styled-components";
import ProfileModal from "components/ProfileModal";
import FollowModal from "components/FollowModal";
import { UserProfile, ResponseData } from "types";
import { baseUrl } from "axiosInstance/constants";
import { CiImageOff } from "react-icons/ci";
import { useRecoilValue } from "recoil";
import { accessTokenState } from "stores/authAtom";
import { ensureHttps } from "utils/urlUtils";

interface FeedProps {
  userChallengeId: number;
  title: string;
  thumbnail: string;
}

interface PropsData {
  totalElements: number;
  totalPages: number;
  size: number;
  content: FeedProps[];
}

const Mypage: React.FC = () => {
  const [feed, setFeed] = useState<FeedProps[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [isMine, setIsMine] = useState(false);
  const [followModalType, setFollowModalType] = useState<
    "follower" | "following" | null
  >(null);
  const [isFollowing, setIsFollowing] = useState<string>("unfollow");
  const navigate = useNavigate();
  const fetchSessionUserData = () => {
    const userData = sessionStorage.getItem("user_profile");
    return userData ? (JSON.parse(userData) as UserProfile) : null;
  };

  const sessionUser = fetchSessionUserData();
  const accessToken = useRecoilValue(accessTokenState);

  const mutationProfile = useMutation<UserProfile, Error, string>({
    mutationFn: async (value: string): Promise<UserProfile> => {
      const response = await axios.get<ResponseData<UserProfile>>(
        `${baseUrl}/api/v1/user/info/${value}`
      );
      return response.data.data;
    },
    onSuccess: (data: UserProfile) => {
      console.log(data);
      if (sessionUser) {
        if (data.id === sessionUser.id) {
          setIsMine(true);
        } else {
          setIsMine(false);
        }
      }
      setUser(data);
    },
    onError: (error: Error) => {
      console.error("Error fetching user Profile:", error);
    },
  });

  const mutationFeed = useMutation<
    PropsData,
    Error,
    { value: string; page: number }
  >({
    mutationFn: async ({ value, page }) => {
      const response = await axios.get<ResponseData<PropsData>>(
        `${baseUrl}/api/v1/userChallenge/${value}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { page },
        }
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      setFeed(data.content);
      console.log("feed", data.content);
    },
    onError: (error: Error) => {
      navigate("/404");
      console.error("Error fetching user Feed:", error);
    },
  });

  const mutationCheckFollow = useMutation<string, Error, string>({
    mutationFn: async (value: string): Promise<string> => {
      const response = await axios.get<ResponseData<string>>(
        `${baseUrl}/api/v1/user/following/check/${value}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return response.data.data;
    },
    onSuccess: (data: string) => {
      setIsFollowing(data.toLowerCase());
    },
    onError: (error: Error) => {
      navigate("/404");
      console.error("Error checking follow status:", error);
    },
  });

  const followUser = useMutation<void, Error, number>({
    mutationFn: async (userId: number) => {
      await axios.post<ResponseData<boolean>>(
        `${baseUrl}/api/v1/user/following/send/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    },
    onSuccess: () => {
      console.log("팔로우 요청 성공");
      setIsFollowing("follow");
      if (user) {
        setUser((prevUser) =>
          prevUser ? { ...prevUser, following: prevUser.following + 1 } : null
        );
      }
    },
    onError: (error: Error) => {
      console.error("Error following user:", error);
    },
  });

  const unfollowUser = useMutation<void, Error, number>({
    mutationFn: async (userId: number) => {
      await axios.delete<ResponseData<boolean>>(
        `${baseUrl}/api/v1/user/following/unfollow/${userId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    },
    onSuccess: () => {
      console.log("언팔로우 요청 성공");
      setIsFollowing("unfollow");
      if (user) {
        setUser((prevUser) =>
          prevUser ? { ...prevUser, following: prevUser.following - 1 } : null
        );
      }
    },
    onError: (error: Error) => {
      console.error("Error unfollowing user:", error);
    },
  });

  const [localAccessToken, setLocalAccessToken] = useState<string | null>(null);

  useEffect(() => {
    setLocalAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    const urlSegments = location.pathname.split("/");
    const mypageIndex = urlSegments.indexOf("mypage");
    const value = mypageIndex !== -1 ? urlSegments[mypageIndex + 1] : "";

    if (value) {
      mutationProfile.mutate(value);
      mutationFeed.mutate({ value, page: 1 });

      if (localAccessToken) {
        mutationCheckFollow.mutate(value);
      }
    }
  }, [location.pathname, localAccessToken]);

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

  const handleNavigateChat = () => {
    if (user) {
      navigate("/chat");
    }
  };

  const handleSendMessageClick = () => {
    if (user) {
      navigate("/chat", { state: user });
    }
  };

  const handleToggleFollowClick = () => {
    if (user) {
      if (isFollowing === "follow") {
        unfollowUser.mutate(user.id);
      } else {
        followUser.mutate(user.id);
      }
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
              <ProfileImg
                src={ensureHttps(user.profileImg)}
                alt="프로필 이미지"
              />
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
                  {isMine ? (
                    <>
                      <TrCursor
                        onClick={() => handleOpenFollowModal("follower")}
                      >
                        <Th>팔로워</Th>
                        <Td>{user.following}</Td>
                      </TrCursor>
                      <TrCursor
                        onClick={() => handleOpenFollowModal("following")}
                      >
                        <Th>팔로잉</Th>
                        <Td>{user.follower}</Td>
                      </TrCursor>
                    </>
                  ) : (
                    <>
                      <Tr>
                        <Th>팔로워</Th>
                        <Td>{user.following}</Td>
                      </Tr>
                      <Tr>
                        <Th>팔로잉</Th>
                        <Td>{user.follower}</Td>
                      </Tr>
                    </>
                  )}
                </tbody>
              </table>
            </Flex>
            <BtnContainer>
              {isMine ? (
                <>
                  <Btn onClick={handleNavigateChat}>메세지 목록</Btn>
                  <Btn onClick={handleOpenProfileModal}>프로필 편집</Btn>
                </>
              ) : (
                <>
                  <Btn onClick={handleSendMessageClick}>메세지 보내기</Btn>
                  <Btn onClick={handleToggleFollowClick}>
                    {isFollowing === "follow" ? "언팔로우" : "팔로우"}
                  </Btn>
                </>
              )}
            </BtnContainer>
          </ProfileContainer>
        </MainSection>
        <MainSection>
          <FeedTitle>Feed</FeedTitle>
          <FeedContainer>
            {feed && feed.length > 0 ? (
              feed.map((item) => (
                <OneFeed key={item.userChallengeId}>
                  <OneImg
                    src={`data:image/jpeg;base64,${item.thumbnail}`}
                    alt={item.title}
                  />
                  <OneTitle>{item.title}</OneTitle>
                </OneFeed>
              ))
            ) : (
              <None>
                <CiImageOff color="#a1a1a1" size="28" />
                <div>업로드한 게시물이 없습니다.</div>
              </None>
            )}
          </FeedContainer>
        </MainSection>
      </Container>
      {isProfileModalOpen && (
        <ProfileModal
          onClose={handleCloseProfileModal}
          user={user}
          updateUserProfile={setUser}
        />
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
  margin: 0 20px 40px;
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

const None = styled.div`
  width: 100%;
  color: #a1a1a1;
  font-size: 14px;
  font-family: "Noto Sans KR", sans-serif;
  text-align: center;
  padding-top: 56px;
  height: 210px;

  & > div {
    margin-top: 12px;
  }
`;

const TrCursor = styled.tr`
  text-align: left;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 8px;
  }
`;

export default Mypage;
