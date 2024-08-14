import { useState, useEffect } from "react";
import styled from "styled-components";
import { useLocation, useParams } from "react-router-dom";
import Header from "components/Header";
import { SearchBar } from "components/SearchBar";
import FeedPlayer from "features/videoDetail/FeedPlayer";
import { ResponseData, FeedDetail } from "types/index";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "axiosInstance/apiClient";

interface FeedProps {
  totalPage: number;
  totalElement: number;
  pageSize: number;
  size: number;
  content: FeedDetail[];
}

const Feed = () => {
  const [feed, setFeed] = useState<FeedDetail[]>([]);
  const [showComments, setShowComments] = useState<number | null>(null);
  const location = useLocation();
  const { userId } = useParams<{ userId?: string }>();

  const mutationFeed = useMutation<FeedProps, Error, number>({
    mutationFn: async (page: number) => {
      const response = await axiosInstance.get<ResponseData<FeedProps>>(
        "/api/v1/userChallenge/feed",
        {
          params: { page, size: 3 },
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
        `/api/v1/userChallenge/search/users/${id}`
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
        `/api/v1/userChallenge/search/${keyword}`
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
      console.log(userId);
      mutationUserFeed.mutate(userId);
    } else if (location.pathname === "/feed") {
      mutationFeed.mutate(0);
    }
  }, [userId]);

  const toggleComments = (userChallengeId: number) => {
    if (showComments === userChallengeId) {
      setShowComments(null);
    } else {
      setShowComments(userChallengeId);
    }
  };

  const handleSearch = (searchTerm: string) => {
    console.log(searchTerm);
    mutationSearchFeed.mutate(searchTerm);
  };

  return (
    <PageLayout>
      <Header stickyOnly />
      <SearchBarWrapper>
        <SearchBar width={650} navigation={false} onSearch={handleSearch} />
      </SearchBarWrapper>
      <VideoContainer>
        {feed.map((video) => (
          <FeedPlayer
            key={video.userChallengeId}
            video={video}
            showComments={showComments === video.userChallengeId}
            onToggleComments={() => toggleComments(video.userChallengeId)}
            userChallengeId={video.userChallengeId}
          />
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
