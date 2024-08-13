import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

interface Position {
  x: number;
  y: number;
}

export const NotFoundPage: React.FC = () => {
  const [shipPosition, setShipPosition] = useState<Position>({ x: 50, y: 80 });
  const [lasers, setLasers] = useState<Position[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && shipPosition.x > 0) {
        setShipPosition((prev) => ({ ...prev, x: Math.max(0, prev.x - 5) }));
      } else if (e.key === "ArrowRight" && shipPosition.x < 90) {
        setShipPosition((prev) => ({ ...prev, x: Math.min(90, prev.x + 5) }));
      } else if (e.key === " ") {
        setLasers((prev) => [
          ...prev,
          { x: shipPosition.x + 2, y: shipPosition.y },
        ]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shipPosition]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLasers((prevLasers) =>
        prevLasers
          .map((laser) => ({ ...laser, y: laser.y - 5 }))
          .filter((laser) => laser.y > 0)
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <SpaceContainer>
      <NeonTitle>404</NeonTitle>
      <NeonSubtitle>Page Not Found</NeonSubtitle>
      <NeonInstructions>
        Use arrow keys to move, space to shoot
      </NeonInstructions>
      <Spaceship
        style={{ left: `${shipPosition.x}%`, top: `${shipPosition.y}%` }}
      >
        🚀
      </Spaceship>
      {lasers.map((laser, index) => (
        <Laser
          key={index}
          style={{ left: `${laser.x}%`, top: `${laser.y}%` }}
        />
      ))}
    </SpaceContainer>
  );
};

const neonFlicker = keyframes`
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    text-shadow:
      0 0 2px #fff,
      0 0 4px #fff,
      0 0 6px #fff,
      0 0 10px #ff1177,
      0 0 20px #ff1177;
  }
  20%, 24%, 55% {
    text-shadow: none;
  }
`;

const SpaceContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #ee5050;
  position: relative;
  overflow: hidden;
`;

const NeonTitle = styled.h1`
  color: #fff;
  font-size: 10rem;
  text-align: center;
  font-family: "DOSIyagiMedium", sans-serif;
  margin-top: 2rem;
  animation: ${neonFlicker} 1.5s infinite alternate;
  text-transform: uppercase;
  letter-spacing: 15px;
`;

const NeonSubtitle = styled.h2`
  color: #fff;
  font-size: 3rem;
  font-family: "DOSIyagiMedium", sans-serif;
  text-align: center;
  text-shadow: 0 0 2px #fff, 0 0 4px #fff, 0 0 6px #fff, 0 0 10px #ff1177;
  margin: 2rem 0;
`;

const NeonInstructions = styled.p`
  color: #fff;
  font-size: 1.2rem;
  font-family: "DOSIyagiMedium", sans-serif;
  text-align: center;
  text-shadow: 0 0 2px #fff, 0 0 4px #fff;
  letter-spacing: 2px;
`;

const Spaceship = styled.div`
  position: absolute;
  transition: all 0.1s;
  color: #fff;
  font-size: 3rem;
  filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 4px #fff);
`;

const Laser = styled.div`
  width: 2px;
  height: 20px;
  background-color: #fff;
  box-shadow: 0 0 2px #fff, 0 0 4px #fff, 0 0 6px #ff1177;
  position: absolute;
`;
