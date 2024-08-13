import React from "react";
import styled from "styled-components";
import Header from "components/Header";
import { SearchBar } from "components/SearchBar";
import img1 from "assets/image/img1.png";
import img2 from "assets/image/img2.png";

interface ImageData {
  src: string;
  alt: string;
}

const imageData: ImageData[] = [
  { src: img1, alt: "Description of image 1" },
  { src: img2, alt: "Description of image 2" },
  { src: img1, alt: "Description of image 3" },
  { src: img2, alt: "Description of image 4" },
];

const Home: React.FC = () => {
  return (
    <>
      <Header />
      <Container>
        <MainSection>
          <SearchBar navigation />
          <TitleSection>
            <MainTitle>Our feed</MainTitle>
            <SubTitle>2024-LeadMe</SubTitle>
          </TitleSection>
          <FeedGrid>
            {imageData.map((img, index) => (
              <FeedItem key={index}>
                <FeedImage src={img.src} alt={img.alt} />
              </FeedItem>
            ))}
          </FeedGrid>
        </MainSection>
      </Container>
    </>
  );
};

const Container = styled.div`
  min-width: 1120px;

  display: flex;
  justify-content: center;
  align-items: center;
  margin: 50px auto;
`;

const MainSection = styled.div`
  width: 820px;
  height: 520px;
  border-radius: 20px;
  background: linear-gradient(
    118deg,
    rgba(255, 255, 255, 0.26) 5.72%,
    rgba(255, 255, 255, 0.07) 94.28%
  );
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(25px);
  display: flex;
  flex-direction: column;
  padding: 35px;
  gap: 20px;
`;

const TitleSection = styled.div`
  width: 100%;
`;

const MainTitle = styled.h1`
  font-size: 28px;
  font-weight: bold;
`;

const SubTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  margin: 12px 0 8px;
`;

const FeedGrid = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
`;

const FeedItem = styled.div`
  width: 175px;
  height: 280px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

const FeedImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export default Home;
