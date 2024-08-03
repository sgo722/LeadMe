import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { BsFillCaretRightFill } from "react-icons/bs";
import youtubeButton from "assets/icons/youtubeButton.png";
import tiktokButton from "assets/icons/tiktokButton.png";
import instaButton from "assets/icons/instaButton.png";
import playButton from "assets/icons/playButton.png";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "axiosInstance/apiClient";
import { LoadingSpinner } from "components/LoadingSpinner";
interface FetchVideosParams {
  pageParam: string;
  query: string;
}

interface SearchResultProps {
  platform: string;
}

interface Thumbnail {
  url: string;
}

interface Snippet {
  title: string;
  thumbnails: {
    high: Thumbnail;
  };
}

interface VideoItem {
  videoId: string;
  nextPageToken: string;
  snippet: Snippet;
}

interface FetchVideosResponse {
  code: number;
  message: string;
  data: VideoItem[];
  errors: string[];
  isSuccess: boolean;
}

const ITEMS_PER_PAGE = 4;
const SLIDE_WIDTH = 266.5;

const fetchVideos = async ({
  pageParam,
  query,
}: FetchVideosParams): Promise<FetchVideosResponse> => {
  const response = await axiosInstance.post("/api/v1/youtube", {
    part: "snippet",
    q: `${query} #shorts #챌린지 #춤 #dance #댄스챌린지`,
    type: "video",
    videoDuration: "short",
    maxResults: 4,
    pageToken: pageParam,
  });
  console.log(response.data.data);
  return response.data;
};

export const SearchResult: React.FC<SearchResultProps> = ({ platform }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const location = useLocation();
  const nav = useNavigate();
  const query = new URLSearchParams(location.search).get("q") || "";
  const [currentPage, setCurrentPage] = useState(0);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["videos", query],
    queryFn: ({ pageParam }) => fetchVideos({ pageParam, query }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.data[0]?.nextPageToken,
  });

  const getImg = (pf: string): string => {
    switch (pf) {
      case "YouTube":
        return youtubeButton;
      case "TikTok":
        return tiktokButton;
      case "Instagram":
        return instaButton;
      default:
        return playButton;
    }
  };

  const prefetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      const nextPageIndex = currentPage + 1;
      const nextPageData = data?.pages[nextPageIndex];
      if (!nextPageData) {
        fetchNextPage();
      }
    }
  }, [currentPage, data, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    prefetchNextPage();
  }, [prefetchNextPage]);

  const handleNext = useCallback(() => {
    const totalVideos = data?.pages.flatMap((page) => page.data).length || 0;
    const nextIndex = Math.min(
      currentIndex + ITEMS_PER_PAGE,
      totalVideos - ITEMS_PER_PAGE
    );
    setCurrentIndex(nextIndex);
    setCurrentPage(Math.floor(nextIndex / ITEMS_PER_PAGE));
    prefetchNextPage();
  }, [currentIndex, data, prefetchNextPage]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - ITEMS_PER_PAGE, 0));
  };

  const handleThumbnailClick = (videoId: string) => {
    nav(`/search/${videoId}?q=${encodeURIComponent(query)}`);
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div>에러: {(error as Error).message}</div>;

  const videos = data?.pages.flatMap((page) => page.data) || [];
  if (videos.length === 0) return <div>검색 결과가 없습니다.</div>;
  return (
    <Container>
      <Title>
        <img src={getImg(platform)} alt="platform logo" />
        <div>{platform}</div>
      </Title>
      <SliderContainer>
        {currentIndex > 0 && (
          <LeftBtn onClick={handlePrev}>
            <BsFillCaretRightFill
              color="#ee5050"
              size="24"
              style={{ transform: "rotate(180deg)" }}
            />
          </LeftBtn>
        )}
        <SliderWrapper>
          <Slider $translateValue={-currentIndex * SLIDE_WIDTH}>
            {videos.map((video: VideoItem, index) => (
              <ContentSection
                key={`${video.videoId}-${index}`}
                onClick={() => handleThumbnailClick(video.videoId)}
              >
                <FeedImage src={video.snippet.thumbnails.high.url} />
                <FeedTitle>{video.snippet.title}</FeedTitle>
              </ContentSection>
            ))}
          </Slider>
        </SliderWrapper>
        {(currentIndex + ITEMS_PER_PAGE < videos.length || hasNextPage) && (
          <RightBtn onClick={handleNext} disabled={isFetchingNextPage}>
            <BsFillCaretRightFill color="#ee5050" size="24" />
          </RightBtn>
        )}
      </SliderContainer>
      {isFetchingNextPage && <div>로딩 중...</div>}
    </Container>
  );
};

const Container = styled.div`
  width: 1080px;
  min-height: 550px;
  border-radius: 20px;
  margin: 50px auto 56px;
  background: linear-gradient(
    108deg,
    rgba(255, 255, 255, 0.26) 0%,
    rgba(255, 255, 255, 0.07) 100%
  );
  box-shadow: 0px 6px 5px 0px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(15px);
  display: flex;
  flex-direction: column;
  padding: 14px 40px 32px;
  position: relative;
  z-index: 100;

  &::before {
    content: "";
    width: 100%;
    height: 55%;
    position: absolute;
    bottom: 0;
    left: 0;
    border-radius: 0 0 20px 20px;
    z-index: -50;

    background: linear-gradient(
      to top,
      rgba(255, 255, 255, 0.9) 80%,
      rgba(255, 255, 255, 0) 100%
    );
  }
`;

const Title = styled.div`
  font-size: 38px;
  font-weight: 600;
  font-family: "Rajdhani", sans-serif;
  display: flex;
  align-items: center;

  img {
    width: 86px;
    margin-left: -24px;
    margin-top: 4px;
  }

  div {
    margin-left: -6px;
  }
`;

const SliderContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

const SliderWrapper = styled.div`
  width: 100%;
  overflow: hidden;
`;

interface SliderProps {
  $translateValue: number;
}

const Slider = styled.div<SliderProps>`
  display: flex;
  transition: transform 0.5s ease;
  transform: translateX(${(props) => props.$translateValue}px);
`;

const ContentSection = styled.div`
  width: 250px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  &:hover {
    img {
      transform: scale(1.05);
    }
  }
  &:not(:last-child) {
    margin-right: 66.5px;
  }
`;

const FeedImage = styled.img`
  width: 200px;
  height: 355.5px;
  border-radius: 8px;
  object-fit: cover;
  margin: 10px 0 12px;
  transition: all 0.3s ease;
  cursor: pointer;
`;

const FeedTitle = styled.div`
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

const LeftBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  user-select: none;
  position: absolute;
  top: 200px;
  left: -34px;
  z-index: 150;
`;

const RightBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  user-select: none;
  position: absolute;
  top: 200px;
  right: -34px;
  z-index: 150;
`;
