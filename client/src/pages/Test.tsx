import { useState } from "react";
import styled from "styled-components";

const dummyData = [
  { id: 1, title: "첫 번째 동작" },
  { id: 2, title: "두 번째 동작" },
  { id: 3, title: "세 번째 동작" },
  { id: 4, title: "네 번째 동작" },
  { id: 6, title: "다섯 번째 동작" },
  { id: 7, title: "다섯 번째 동작" },
  { id: 8, title: "다섯 번째 동작" },
  { id: 9, title: "다섯 번째 동작" },
  { id: 10, title: "다섯 번째 동작" },
  { id: 11, title: "다섯 번째 동작" },
  { id: 12, title: "다섯 번째 동작" },
  { id: 13, title: "다섯 번째 동작" },
];

export const Test: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const handleItemClick = (id: number) => {
    setSelectedItem(id);
  };

  return (
    <Container>
      <BattleArea>
        <LeftWebcamBox $isSmall={selectedItem !== null}></LeftWebcamBox>
        <DataBox>
          <Title>Battle!</Title>
          <ScrollableList>
            {dummyData.map((item) => (
              <ListItem
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                $isSelected={selectedItem === item.id}
              >
                {item.title}
              </ListItem>
            ))}
          </ScrollableList>
        </DataBox>
        {selectedItem && <YouTubeBox></YouTubeBox>}
        <RightWebcamBox $isSmall={selectedItem !== null}></RightWebcamBox>
      </BattleArea>
    </Container>
  );
};

const Container = styled.div`
  min-width: 1120px;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const BattleArea = styled.div`
  min-width: 1080px;
  width: 90vw;
  margin: 20px 20px;
  min-height: 85vh;
  border-radius: 20px;
  background: linear-gradient(
    108deg,
    rgba(255, 255, 255, 0.26) 0%,
    rgba(255, 255, 255, 0.07) 100%
  );

  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(15px);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  gap: 50px;
  padding: 20px;
`;

const LeftWebcamBox = styled.div<{ $isSmall: boolean }>`
  width: ${(props) => (props.$isSmall ? "280px" : "380px")};
  height: ${(props) => (props.$isSmall ? "500px" : "675px")};
  background-color: #943636;
  border-radius: 15px;
  transition: all 0.3s ease-in-out;
  position: ${(props) =>
    props.$isSmall
      ? "absolute"
      : "relative"}; /* 초기에는 상대 위치, 클릭 시 절대 위치로 변경 */
  left: ${(props) =>
    props.$isSmall ? "20px" : "auto"}; /* 클릭 후 왼쪽 하단으로 이동 */
  bottom: ${(props) =>
    props.$isSmall ? "20px" : "auto"}; /* 클릭 시 bottom 값 조정 */
`;

const RightWebcamBox = styled.div<{ $isSmall: boolean }>`
  width: ${(props) => (props.$isSmall ? "280px" : "380px")};
  height: ${(props) => (props.$isSmall ? "500px" : "675px")};
  background-color: #943636;
  border-radius: 15px;
  transition: all 0.3s ease-in-out;
  position: ${(props) =>
    props.$isSmall
      ? "absolute"
      : "relative"}; /* 초기에는 상대 위치, 클릭 시 절대 위치로 변경 */
  right: ${(props) =>
    props.$isSmall ? "20px" : "auto"}; /* 클릭 후 오른쪽 하단으로 이동 */
  bottom: ${(props) =>
    props.$isSmall ? "20px" : "auto"}; /* 클릭 시 bottom 값 조정 */
`;
const DataBox = styled.div`
  width: 380px;
  height: 675px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 20px 10px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 8px 8px 4px 0px rgba(0, 0, 0, 0.1);
  z-index: 1;
`;

const YouTubeBox = styled.div`
  width: 380px;
  height: 675px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 20px 10px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 8px 8px 4px 0px rgba(0, 0, 0, 0.1);
  z-index: 1;
  transition: opacity 0.3s ease-in-out; /* 서서히 나타나는 효과 추가 */
`;

const Title = styled.h1`
  color: #ee5050;
  font-family: Rajdhani;
  font-size: 60px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: -0.6px;
`;

const ScrollableList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  border-radius: 10px;
  padding: 10px;
`;

const ListItem = styled.div<{ $isSelected: boolean }>`
  padding: 15px;
  margin: 10px 0;
  cursor: pointer;
  transition: background-color 0.3s;
  border-radius: 8px;
  background: ${(props) =>
    props.$isSelected
      ? "linear-gradient(90deg, #f3e7e7 0%, #ffd6e7 100%)"
      : "linear-gradient(90deg, #f7f7f7 0%, #ffedf6 100%)"};
`;
