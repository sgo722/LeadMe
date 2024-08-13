import React, {
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useParams, useLocation } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { axiosInstance } from "axiosInstance/apiClient";
import { VideoPlayer } from "features/search/VideoPlayer";
import Header from "components/Header";
import { SearchBar } from "components/SearchBar";
import { baseUrl } from "axiosInstance/constants";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { ResponseData } from "types";

interface Video {
  videoId: string;
  snippet: {
    title: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
}

interface FetchVideosResponse {
  data: Video[];
  nextPageToken?: string;
}

const fetchVideos = async ({
  pageParam = "",
  query,
  initialVideoId,
}: {
  pageParam: string;
  query: string;
  initialVideoId?: string;
}) => {
  const response = await axiosInstance.post<FetchVideosResponse>(
    "/api/v1/youtube",
    {
      part: "snippet",
      q: `${query} #shorts #챌린지 #춤 #dance #댄스챌린지`,
      type: "video",
      videoDuration: "short",
      maxResults: 10,
      pageToken: pageParam,
    }
  );

  if (!pageParam && initialVideoId) {
    const initialVideo = response.data.data.find(
      (video) => video.videoId === initialVideoId
    );
    if (initialVideo) {
      response.data.data = [
        initialVideo,
        ...response.data.data.filter((v) => v.videoId !== initialVideoId),
      ];
    }
  }

  return response.data;
};

export const SearchResultDetail: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [challengeVideoIds, setChallengeVideoIds] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await axios.get<ResponseData<{ youtubeId: string[] }>>(
        `${baseUrl}/api/v1/challenge/list`
      );
      return response.data.data.youtubeId;
    },
    onSuccess: (data) => {
      setChallengeVideoIds(data);
    },
    onError: (error: Error) => {
      console.error("Error fetching challenge video IDs:", error.message);
      setChallengeVideoIds([]);
    },
  });

  useEffect(() => {
    if (challengeVideoIds.length === 0) mutation.mutate();
  }, []);

  useEffect(() => {
    if (videoId) {
      setActiveVideoId(videoId);
    }
  }, [videoId]);

  const handleIntersection = useCallback(
    (videoId: string, isIntersecting: boolean) => {
      if (isIntersecting) {
        setActiveVideoId(videoId);
      }
    },
    []
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["videos", query, videoId],
      queryFn: ({ pageParam = "" }) =>
        fetchVideos({ pageParam, query, initialVideoId: videoId }),
      getNextPageParam: (lastPage) => lastPage.nextPageToken,
      initialPageParam: "",
    });

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, clientHeight, scrollHeight } = containerRef.current;

      if (
        scrollHeight - scrollTop <= clientHeight * 1.5 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const videos = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data]
  );

  // 클릭한 비디오를 찾아 맨 앞으로 이동
  const sortedVideos = useMemo(() => {
    if (!videoId || videos.length === 0) return videos;
    const clickedVideoIndex = videos.findIndex((v) => v.videoId === videoId);
    if (clickedVideoIndex === -1) return videos;
    return [
      videos[clickedVideoIndex],
      ...videos.slice(0, clickedVideoIndex),
      ...videos.slice(clickedVideoIndex + 1),
    ];
  }, [videos, videoId]);

  return (
    <PageLayout>
      <Header stickyOnly />
      <SearchBarWrapper>
        <SearchBar width={650} navigation />
      </SearchBarWrapper>
      <VideoContainer ref={containerRef} onScroll={handleScroll}>
        {sortedVideos.map((video) => (
          <VideoPlayer
            key={video.videoId}
            video={video}
            isActive={video.videoId === activeVideoId}
            onIntersection={handleIntersection}
            challengeVideoIds={challengeVideoIds}
          />
        ))}
        {isFetchingNextPage && <div>Loading more...</div>}
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
  &::-webkit-scrollbar {
    display: none;
  }
`;
