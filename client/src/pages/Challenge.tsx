import { useEffect } from "react";
import Header from "components/Header";
import styled from "styled-components";
import playButtonIcon from "assets/icons/playButton.png";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { ChallengeItem, ResponseData } from "types";
import { baseUrl } from "axiosInstance/constants";
import { useState } from "react";

const Challenge: React.FC = () => {
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);

  const mutationChallenge = useMutation<ChallengeItem[], Error, void>({
    mutationFn: async () => {
      const response = await axios.get<ResponseData<ChallengeItem[]>>(
        `${baseUrl}/api/v1/challenge`
      );
      return response.data.data;
    },
    onSuccess: (data: ChallengeItem[]) => {
      console.log(data);
      setChallenges(data);
    },
    onError: (error: Error) => {
      console.error("Error fetching Challenge:", error);
    },
  });

  useEffect(() => {
    mutationChallenge.mutate();
  }, []);

  const sections = [];
  for (let i = 0; i < challenges.length; i += 4) {
    sections.push(challenges.slice(i, i + 4));
  }

  return (
    <>
      <Header />
      <Container>
        {sections.map((section, index) => (
          <MainSection key={index}>
            {section.map((img) => (
              <ContentSection key={img.challengeId}>
                <TitleSection>
                  <MainTitle>{img.title}</MainTitle>
                  <PlayButton src={playButtonIcon} />
                </TitleSection>
                <SubTitle>{img.hashtags}</SubTitle>
                <FeedImage src={img.thumbnail} />
              </ContentSection>
            ))}
          </MainSection>
        ))}
      </Container>
    </>
  );
};

export default Challenge;

const Container = styled.div`
  min-width: 1120px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 50px auto;
  flex-direction: column;
  gap: 30px;
`;

const MainSection = styled.div`
  width: 1080px;
  border-radius: 20px;
  background: linear-gradient(
    118deg,
    rgba(255, 255, 255, 0.26) 5.72%,
    rgba(255, 255, 255, 0.07) 94.28%
  );
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(25px);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 35px 40px 40px;
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;

  &:hover {
    img {
      transform: scale(1.05);
    }
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 200px;
`;

const MainTitle = styled.h1`
  font-size: 21px;
  font-weight: 600;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PlayButton = styled.img`
  width: 55px;
  height: 55px;
  margin-bottom: -8px;
  margin-right: -8px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.2);
  }
`;

const SubTitle = styled.div`
  font-size: 16px;
  font-family: "Noto Sans KR", sans-serif;
  font-weight: 500;
  margin-top: -6px;
  margin-bottom: 22px;
`;

const FeedImage = styled.img`
  width: 200px;
  height: 355.5px;
  border-radius: 8px;
  object-fit: cover;
  transition: transform 0.3s ease;
`;
