import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "components/Header";
import { SearchBar } from "components/SearchBar";
import img1 from "assets/image/img1.png";
import img2 from "assets/image/img2.png";

const images = [img1, img2, img1];

const Home: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <Header showGuide={true} />
      <Container>
        <MainSection>
          <SearchBar navigation />
          {/* <TitleSection>
            <MainTitle>Our feed</MainTitle>
            <SubTitle>2024-LeadMe</SubTitle>
          </TitleSection> */}
          <FeedGrid>
            <CarouselWrapper>
              <Carousel currentIndex={currentIndex}>
                {images.map((image, index) => (
                  <CarouselSlide key={index}>
                    <Image src={image} alt={`Slide ${index + 1}`} />
                  </CarouselSlide>
                ))}
              </Carousel>
            </CarouselWrapper>
            <Indicators>
              {images.map((_, index) => (
                <Dot
                  key={index}
                  active={index === currentIndex}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </Indicators>
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
  height: 480px;
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

// const TitleSection = styled.div`
//   width: 100%;
// `;

// const MainTitle = styled.h1`
//   font-size: 28px;
//   font-weight: bold;
// `;

// const SubTitle = styled.h2`
//   font-size: 14px;
//   font-weight: 600;
//   margin: 12px 0 8px;
// `;

const FeedGrid = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  height: 320px;
  position: relative;
  margin-top: 20px;
`;

const CarouselWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
`;

const Carousel = styled.div<{ currentIndex: number }>`
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 1s ease-in-out;
  transform: translateX(${({ currentIndex }) => -currentIndex * 100}%);
`;

const CarouselSlide = styled.div`
  min-width: 100%;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

const Indicators = styled.div`
  position: absolute;
  bottom: -20px;
  display: flex;
  gap: 10px;
`;

const Dot = styled.div<{ active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ active }) => (active ? "#ee5050" : "#e1e1e1")};
  cursor: pointer;
`;

export default Home;
