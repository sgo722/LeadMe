import { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "components/Header";
import axios from "axios";
import { SearchBar } from "components/SearchBar";
import { ResponseData } from "types";
import { useMutation } from "@tanstack/react-query";
import { baseUrl } from "axiosInstance/constants";

const Feed = () => {
  const [_, setFeed] = useState<feedProps[]>();

  interface feedProps {}

  const mutationFeed = useMutation<feedProps[], Error, number>({
    mutationFn: async (page: number) => {
      const response = await axios.get<ResponseData<feedProps[]>>(
        `${baseUrl}/api/v1/userChallenge/feed`,
        {
          params: { page },
        }
      );
      return response.data.data;
    },
    onSuccess: (data: feedProps[]) => {
      console.log(data);
      setFeed(data);
    },
    onError: (error: Error) => {
      console.error("Error fetching user data:", error);
    },
  });

  useEffect(() => {
    mutationFeed.mutate(1);
  }, []);

  return (
    <PageLayout>
      <Header stickyOnly />
      <SearchBarWrapper>
        <SearchBar width={650} navigation />
      </SearchBarWrapper>
      <VideoContainer></VideoContainer>
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

export default Feed;
