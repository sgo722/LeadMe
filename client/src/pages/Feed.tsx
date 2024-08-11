import { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "components/Header";
import { SearchBar } from "components/SearchBar";
import FeedPlayer from "features/videoDetail/FeedPlayer";
import { Comment } from "types/index";

const dummyData = [
  {
    id: 1,
    src: "https://via.placeholder.com/300x500.png?text=Video+1",
    title: "Dummy Video 1",
    likes: 1500,
    comments: [
      {
        username: "nickname",
        profileImg: "profile",
        content: "댓글 내용입니다",
        createdData: "2024-07-29T14:38:44.087699",
        lastModifiedDate: "2024-07-29T14:38:44.087699",
      },
    ] as Comment[],
  },
  {
    id: 2,
    src: "https://via.placeholder.com/300x500.png?text=Video+2",
    title: "Dummy Video 2",
    likes: 2300,
    comments: [
      {
        username: "nickname",
        profileImg: "profile",
        content: "댓글 내용입니다2",
        createdData: "2024-07-29T14:38:44.087699",
        lastModifiedDate: "2024-07-29T14:38:44.087699",
      },
      {
        username: "nickname",
        profileImg: "profile",
        content: "댓글 내용입니다3",
        createdData: "2024-07-29T14:38:44.087699",
        lastModifiedDate: "2024-07-29T14:38:44.087699",
      },
      {
        username: "nickname",
        profileImg: "profile",
        content: "댓글 내용입니다2",
        createdData: "2024-07-29T14:38:44.087699",
        lastModifiedDate: "2024-07-29T14:38:44.087699",
      },
      {
        username: "nickname",
        profileImg: "profile",
        content: "댓글 내용입니다3",
        createdData: "2024-07-29T14:38:44.087699",
        lastModifiedDate: "2024-07-29T14:38:44.087699",
      },
      {
        username: "nickname",
        profileImg: "profile",
        content: "댓글 내용입니다2",
        createdData: "2024-07-29T14:38:44.087699",
        lastModifiedDate: "2024-07-29T14:38:44.087699",
      },
      {
        username: "nickname",
        profileImg: "profile",
        content: "댓글 내용입니다3",
        createdData: "2024-07-29T14:38:44.087699",
        lastModifiedDate: "2024-07-29T14:38:44.087699",
      },
      {
        username: "nickname",
        profileImg: "profile",
        content: "댓글 내용입니다2",
        createdData: "2024-07-29T14:38:44.087699",
        lastModifiedDate: "2024-07-29T14:38:44.087699",
      },
      {
        username: "nickname",
        profileImg: "profile",
        content: "댓글 내용입니다3",
        createdData: "2024-07-29T14:38:44.087699",
        lastModifiedDate: "2024-07-29T14:38:44.087699",
      },
      {
        username: "nickname",
        profileImg: "profile",
        content: "댓글 내용입니다2",
        createdData: "2024-07-29T14:38:44.087699",
        lastModifiedDate: "2024-07-29T14:38:44.087699",
      },
      {
        username: "nickname",
        profileImg: "profile",
        content: "댓글 내용입니다3",
        createdData: "2024-07-29T14:38:44.087699",
        lastModifiedDate: "2024-07-29T14:38:44.087699",
      },
    ] as Comment[],
  },
  {
    id: 3,
    src: "https://via.placeholder.com/300x500.png?text=Video+3",
    title: "Dummy Video 3",
    likes: 900,
    comments: [
      {
        username: "nickname",
        profileImg: "profile",
        content: "댓글 내용입니다444",
        createdData: "2024-07-29T14:38:44.087699",
        lastModifiedDate: "2024-07-29T14:38:44.087699",
      },
    ] as Comment[],
  },
  {
    id: 4,
    src: "https://via.placeholder.com/300x500.png?text=Video+3",
    title: "Dummy Video 3",
    likes: 900,
    comments: [
      {
        username: "nickname",
        profileImg: "profile",
        content: "댓글 내용입니다444",
        createdData: "2024-07-29T14:38:44.087699",
        lastModifiedDate: "2024-07-29T14:38:44.087699",
      },
    ] as Comment[],
  },
];

const Feed = () => {
  const [feed, _] = useState(dummyData);
  const [showComments, setShowComments] = useState<number | null>(null);

  useEffect(() => {
    // 서버로부터 데이터 가져오는 부분
    console.log("초기 데이터 불러오기");
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    console.log(e);
    // 스크롤이 바닥에 닿으면 다음 페이지를 불러옴 - 무한 스크롤
  };

  const toggleComments = (id: number) => {
    setShowComments((prev) => (prev === id ? null : id));
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
            key={video.id}
            video={video}
            showComments={showComments === video.id}
            onToggleComments={() => toggleComments(video.id)}
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
