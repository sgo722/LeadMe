import { ScrollControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Dancer } from "components/Dancer";
import * as THREE from "three";
import { Suspense } from "react";
import { Loader } from "components/Loader";
import { MovingDOM } from "./dom/MovingDOM";
import { useRecoilValue } from "recoil";
import { IsEnteredAtom } from "stores/index";
export const MainCanvas = () => {
  const isEntered = useRecoilValue(IsEnteredAtom);
  const aspectRatio = window.innerWidth / window.innerHeight;
  return (
    <Canvas
      id="canvas"
      gl={{ antialias: true }}
      shadows="soft"
      camera={{
        fov: 30,
        aspect: aspectRatio,
        near: 0.01,
        far: 1000,
        position: [0, 6, 12],
      }}
      scene={{ background: new THREE.Color(0x000000) }}
    >
      <ScrollControls pages={isEntered ? 8 : 0} damping={0.25}>
        <Suspense fallback={<Loader />}>
          <MovingDOM />
          <Dancer />
        </Suspense>
      </ScrollControls>
    </Canvas>
  );
};
