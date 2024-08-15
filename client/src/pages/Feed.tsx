import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Header from "components/Header";
import { SearchBar } from "components/SearchBar";
import FeedPlayer from "features/videoDetail/FeedPlayer";
import { LoadingSpinner } from "components/LoadingSpinner";
import { ResponseData, FeedDetail } from "types/index";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "axiosInstance/apiClient";
import { getJWTHeader } from "axiosInstance/apiClient";
import { ensureHttps } from "utils/urlUtils";

interface FeedProps {
  totalPage: number;
  totalElement: number;
  pageSize: number;
  size: number;
  content: FeedDetail[];
}

const Feed = () => {
  const [feed, setFeed] = useState<FeedDetail[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const videoRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const lastActiveVideoId = useRef<number | null>(null); // 마지막으로 활성화된 비디오 ID를 저장
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();

  const selectedVideoIndex = location.state?.selectedVideoIndex || 0;

  const mutationFeed = useMutation<FeedProps, Error, number>({
    mutationFn: async (page: number) => {
      const response = await axiosInstance.get<ResponseData<FeedProps>>(
        "/api/v1/userChallenge/feed",
        {
          params: { page, size: 3 },
          headers: getJWTHeader(),
        }
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      setFeed((prevFeed) => {
        const newFeed = data.content.filter(
          (newVideo) =>
            !prevFeed.some(
              (existingVideo) =>
                existingVideo.userChallengeId === newVideo.userChallengeId
            )
        );

        if (newFeed.length > 0) {
          return [...prevFeed, ...newFeed];
        }
        return prevFeed;
      });

      setIsLoading(false);
      setIsFetchingMore(false);
      setHasMore(data.content.length > 0);

      // 현재 보고 있는 영상이 계속 유지되도록 함 (스크롤 없이)
      lastActiveVideoId.current = activeVideoId;
    },
    onError: (error: Error) => {
      console.error("Error fetching user Feed:", error);
      setIsLoading(false);
      setIsFetchingMore(false);
    },
  });

  const mutationUserFeed = useMutation<FeedDetail[], Error, string>({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.get<ResponseData<FeedDetail[]>>(
        `/api/v1/userChallenge/search/users/${id}`,
        {
          headers: getJWTHeader(),
        }
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      const reversedData = data.reverse();
      setFeed(reversedData);
      setIsLoading(false);
      setHasMore(false);
    },
    onError: (error: Error) => {
      console.error("Error fetching user Feed:", error);
      setIsLoading(false);
      alert("로그인 후 이용 가능한 서비스 입니다.");
      navigate("/home");
    },
  });

  const mutationSearchFeed = useMutation<FeedDetail[], Error, string>({
    mutationFn: async (keyword: string) => {
      const response = await axiosInstance.get<ResponseData<FeedDetail[]>>(
        `/api/v1/userChallenge/search/${keyword}`,
        {
          headers: getJWTHeader(),
        }
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      setFeed(data);
      setIsLoading(false);
      setHasMore(false);
    },
    onError: (error: Error) => {
      console.error("Error fetching search results:", error);
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (userId) {
      mutationUserFeed.mutate(userId);
    } else if (location.pathname === "/feed") {
      mutationFeed.mutate(page);
    }
  }, [userId, page]);

  useEffect(() => {
    if (feed.length > 0 && videoRefs.current[selectedVideoIndex]) {
      videoRefs.current[selectedVideoIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setActiveVideoId(feed[selectedVideoIndex].userChallengeId);
    }
  }, [feed, selectedVideoIndex]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const videoId = Number(entry.target.getAttribute("data-video-id"));
            setActiveVideoId(videoId);

            const lastIndex = feed.length - 1;
            if (
              feed[lastIndex]?.userChallengeId === videoId &&
              hasMore &&
              !isFetchingMore
            ) {
              console.log("다음 영상 가져오기");
              setIsFetchingMore(true);
              setPage((prevPage) => prevPage + 1);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    Object.values(videoRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(videoRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [feed, hasMore, isFetchingMore]);

  const handleSearch = (searchTerm: string) => {
    setIsLoading(true);
    mutationSearchFeed.mutate(searchTerm);
  };

  const handleProfileClick = (id: number) => {
    navigate(`/mypage/${id}`);
  };

  const handleVideoDeleted = (deletedVideoId: number) => {
    const newFeed = feed.filter(
      (video) => video.userChallengeId !== deletedVideoId
    );
    setFeed(newFeed);

    if (newFeed.length > 0) {
      const nextIndex =
        feed.findIndex((video) => video.userChallengeId === deletedVideoId) + 1;
      const nextVideo = newFeed[nextIndex % newFeed.length];

      setTimeout(() => {
        setActiveVideoId(nextVideo.userChallengeId);
        videoRefs.current[nextIndex % newFeed.length]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 500);
    } else {
      setActiveVideoId(null);
    }
  };

  return (
    <PageLayout>
      <Header stickyOnly />
      <SearchBarWrapper>
        <SearchBar width={600} navigation={false} onSearch={handleSearch} />
      </SearchBarWrapper>
      <VideoContainer>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          feed.map((video, index) => (
            <div
              key={video.userChallengeId}
              ref={(el) => (videoRefs.current[index] = el)}
              data-video-id={video.userChallengeId}
            >
              <FeedPlayer
                video={video}
                userChallengeId={video.userChallengeId}
                isActive={activeVideoId === video.userChallengeId}
                onVideoDeleted={() => handleVideoDeleted(video.userChallengeId)}
              />
              <Profile>
                <div>
                  <ProfileImg
                    src={ensureHttps(video.profileImg)}
                    alt={video.nickname}
                    onClick={() => handleProfileClick(video.userId)}
                  />
                </div>
                <Title>{video.title}</Title>
              </Profile>
            </div>
          ))
        )}
        {isFetchingMore && (
          <LoadingSpinnerWrapper>
            <LoadingSpinner />
          </LoadingSpinnerWrapper>
        )}
      </VideoContainer>
    </PageLayout>
  );
};

const PageLayout = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const SearchBarWrapper = styled.div`
  padding: 20px;
  display: flex;
  justify-content: center;
`;

const VideoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  height: 100vh;
  padding-bottom: 5vh;
  &::-webkit-scrollbar {
    display: none;
  }

  & > div {
    position: relative;
  }
`;

const Profile = styled.div`
  position: absolute;
  width: 100%;
  height: 60px;
  top: 22px;
  z-index: 100;
  border-radius: 6px 6px 0 0;
  padding: 0 14px;

  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ProfileImg = styled.img`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  margin-right: 12px;
  cursor: pointer;
`;

const Title = styled.div`
  width: 100%;
  color: #ffffff;
  font-family: "Noto Sans KR", sans-serif;

  max-height: 45px;
  line-height: 1.2;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const LoadingSpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
`;

export default Feed;
