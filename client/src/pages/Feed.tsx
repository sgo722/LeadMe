import { useState, useEffect } from "react";
import styled from "styled-components";
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

  const mutationFeed = useMutation<FeedProps, Error, number>({
    mutationFn: async (page: number) => {
      const response = await axiosInstance.get<ResponseData<FeedProps>>(
        "/api/v1/userChallenge/feed",
        {
          params: { page, size: 5 },
        }
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      console.log("feed", data);
      setFeed(data.content)
    },
    onError: (error: Error) => {
      console.error("Error fetching user Feed:", error);
    },
  });

  useEffect(() => {
    mutationFeed.mutate(0);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    console.log(e);
    // 스크롤이 바닥에 닿으면 다음 페이지를 불러옴 - 무한 스크롤
  };

  const toggleComments = (userChallengeId: number) => {
    if (showComments === userChallengeId) {
      setShowComments(null);
    } else {
      setShowComments(userChallengeId);
    }
  };

  return (
    <PageLayout onScroll={handleScroll}>
      <Header stickyOnly />
      <SearchBarWrapper>
        <SearchBar width={650} navigation />
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
