import { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "components/Header";
import { SearchBar } from "components/SearchBar";
import VideoPlayer from "features/videoDetail/VideoPlayer";

const dummyData = [
  {
    id: 1,
    src: "https://via.placeholder.com/300x500.png?text=Video+1",
    title: "Dummy Video 1",
    likes: 1500,
    comments: [
      { id: 1, user: "User1", text: "Great video!" },
      { id: 2, user: "User2", text: "Amazing!" },
    ],
  },
  {
    id: 2,
    src: "https://via.placeholder.com/300x500.png?text=Video+2",
    title: "Dummy Video 2",
    likes: 2300,
    comments: [
      { id: 3, user: "User3", text: "Love it!" },
      { id: 4, user: "User4", text: "Awesome content!" },
    ],
  },
  {
    id: 3,
    src: "https://via.placeholder.com/300x500.png?text=Video+3",
    title: "Dummy Video 3",
    likes: 900,
    comments: [
      { id: 5, user: "User5", text: "Nice!" },
      { id: 6, user: "User6", text: "Well done!" },
    ],
  },
];

const Feed = () => {
  const [feed, setFeed] = useState(dummyData);
  const [showComments, setShowComments] = useState<boolean>(false);

  useEffect(() => {
    // 서버로부터 데이터 가져오는 부분
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // 스크롤이 바닥에 닿으면 다음 페이지를 불러옴 - 무한 스크롤
  };

  const toggleComments = () => {
    setShowComments((prev) => !prev);
  };

  return (
    <PageLayout onScroll={handleScroll}>
      <Header stickyOnly />
      <SearchBarWrapper>
        <SearchBar width={650} navigation />
      </SearchBarWrapper>
      <VideoContainer>
        {feed.map((video, index) => (
          <VideoPlayer
            key={video.id}
            video={video}
            showComments={showComments}
            onToggleComments={toggleComments}
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
  margin-bottom: 8px;
`;

const VideoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  height: 100vh;
  padding-bottom: 0vh;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export default Feed;
