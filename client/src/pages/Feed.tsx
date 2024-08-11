import { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "components/Header";
import { SearchBar } from "components/SearchBar";
import FeedPlayer from "features/videoDetail/FeedPlayer";
import { Feed as FeedType } from "types/index";

const dummyFeedData: FeedType[] = [
  {
    userChallengeId: 1,
    title: "Dummy Video 1",
    thumbnail: "https://via.placeholder.com/300x500.png?text=Video+1",
  },
  {
    userChallengeId: 2,
    title: "Dummy Video 2",
    thumbnail: "https://via.placeholder.com/300x500.png?text=Video+2",
  },
  {
    userChallengeId: 3,
    title: "Dummy Video 3",
    thumbnail: "https://via.placeholder.com/300x500.png?text=Video+3",
  },
  {
    userChallengeId: 4,
    title: "Dummy Video 4",
    thumbnail: "https://via.placeholder.com/300x500.png?text=Video+4",
  },
];

const Feed = () => {
  const [feed, _] = useState(dummyFeedData);
  const [showComments, setShowComments] = useState<number | null>(null);

  useEffect(() => {
    console.log("초기 데이터 불러오기");
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
