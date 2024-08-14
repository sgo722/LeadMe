import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Header from "components/Header";
import { SearchBar } from "components/SearchBar";
import FeedPlayer from "features/videoDetail/FeedPlayer";
import { ResponseData, FeedDetail } from "types/index";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "axiosInstance/apiClient";
import { getJWTHeader } from "axiosInstance/apiClient";

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
  const videoRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();

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
      const newFeed = data.content;

      if (newFeed.length > 0) {
        const firstNewFeedId = newFeed[0].userChallengeId;

        const isDuplicate = feed.some(
          (item) => item.userChallengeId === firstNewFeedId
        );

        if (!isDuplicate) {
          console.log("새로운 데이터", newFeed);
          setFeed((prevFeed) => [...prevFeed, ...newFeed]);
        }
      }
    },
    onError: (error: Error) => {
      console.error("Error fetching user Feed:", error);
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
      console.log("특정유저 피드", data);
      setFeed(data);
    },
    onError: (error: Error) => {
      console.error("Error fetching user Feed:", error);
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
      console.log("검색결과:", data);
      setFeed(data);
    },
    onError: (error: Error) => {
      console.error("Error fetching search results:", error);
    },
  });

  useEffect(() => {
    if (userId) {
      if (getJWTHeader()) {
        mutationUserFeed.mutate(userId);
      } else {
        alert("로그인 후 이용 가능한 서비스입니다.");
        navigate("/home");
      }
    } else if (location.pathname === "/feed") {
      mutationFeed.mutate(0);
    }
  }, [userId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const videoId = Number(entry.target.getAttribute("data-video-id"));
            setActiveVideoId(videoId);
          }
        });
      },
      { threshold: 0.5 } // 50% 이상 보일 때 활성화로 간주
    );

    Object.values(videoRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(videoRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [feed]);

  const handleSearch = (searchTerm: string) => {
    console.log(searchTerm);
    mutationSearchFeed.mutate(searchTerm);
  };

  return (
    <PageLayout>
      <Header stickyOnly />
      <SearchBarWrapper>
        <SearchBar width={600} navigation={false} onSearch={handleSearch} />
      </SearchBarWrapper>
      <VideoContainer>
        {feed.map((video) => (
          <div
            key={video.userChallengeId}
            ref={(el) => (videoRefs.current[video.userChallengeId] = el)}
            data-video-id={video.userChallengeId}
          >
            <FeedPlayer
              video={video}
              userChallengeId={video.userChallengeId}
              isActive={activeVideoId === video.userChallengeId}
            />
          </div>
        ))}
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
`;

export default Feed;
