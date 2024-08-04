import {
  useAnimations,
  useGLTF,
  useScroll,
  Box,
  Circle,
  Points,
  useTexture,
} from "@react-three/drei";
import { useEffect, useRef, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import { IsEnteredAtom } from "stores/index";
import { Loader } from "components/Loader";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import { Group } from "three";
let timeline: gsap.core.Timeline | null = null;
const colors = {
  boxMaterialColor: "#ee5050",
};
export const Dancer = () => {
  const three = useThree(); // 카메라 이동시키려고 씀
  const isEntered = useRecoilValue(IsEnteredAtom);
  const dancerRef = useRef<Group>(null);
  const boxRef =
    useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(null);
  const starRef = useRef(null);
  const rectAreaLightRef = useRef(null);
  const hemisphereLightRef = useRef(null);
  const { scene, animations } = useGLTF("/models/dancer.glb");
  const texture = useTexture("/texture/star.png");
  const { actions } = useAnimations(animations, dancerRef);

  const [currentAnimation, setCurrentAnimation] = useState("wave"); // 초기 애니메이션
  const [rotateFinished, setRotateFinished] = useState(false); // 스크롤 맨 아래에서 카메라가 회전을 마무리 했는지

  const { positions } = useMemo(() => {
    const count = 500; // 별 개수
    const positions = new Float32Array(count * 3); // x, y, z 3차원으로 받아야되서 *3
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 25;
      positions[i + 1] = (Math.random() - 0.5) * 25;
      positions[i + 2] = (Math.random() - 0.5) * 25;
    }
    return { positions };
  }, []);
  const scroll = useScroll();

  // 초기화
  useEffect(() => {
    if (!isEntered) return;
    three.camera.lookAt(1, 2, 0); // 맨 처음 카메라가 1,2,0을 보도록
    actions["wave"]?.play();
    three.scene.background = new THREE.Color(colors.boxMaterialColor);
    // 모델에 그림자 넣기
    scene.traverse((object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, [actions, isEntered, three.camera, three.scene, scene]);

  // 애니메이션 제어
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (currentAnimation === "wave") {
      actions[currentAnimation]?.reset().fadeIn(0.5).play();
    } else {
      actions[currentAnimation]
        ?.reset()
        .fadeIn(0.5)
        .play()
        .setLoop(THREE.LoopOnce, 1);

      timeoutId = setTimeout(() => {
        if (actions[currentAnimation]) {
          actions[currentAnimation].paused = true;
        }
      }, 8000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      actions[currentAnimation]?.reset().fadeOut(0.5).stop();
    };
  }, [actions, currentAnimation, scroll.offset]);

  useEffect(() => {
    if (!isEntered) return;
    if (!dancerRef.current) return;
    // 카메라가 (-5,5,5) 위치에서 시작해서 2.5초 동안 (0,6,12) 위치로 이동
    gsap.fromTo(
      three.camera.position,
      {
        x: -5,
        y: 5,
        z: 5,
      },
      { duration: 2.5, x: 0, y: 6, z: 12 }
    );

    // 카메라가(z축 방향으로 180도 방향에서 0도로 이동)
    gsap.fromTo(three.camera.rotation, { z: Math.PI }, { duration: 2.5, z: 0 });

    // 처음 마운트될때 배경색이 검정색에서 주황색으로 바뀜
    gsap.fromTo(
      colors,
      { boxMaterialColor: "#0c0400" },
      { duration: 2.5, boxMaterialColor: "#ee5050" }
    );

    // 배경에 있는 별 반짝거리게 yoyo랑 repeat -1으로 무한반복되도록
    gsap.to(starRef.current, {
      yoyo: true,
      duration: 2,
      repeat: -1,
      ease: "linear",
      size: 0.05,
    });
  }, [isEntered, three.camera.position, three.camera.rotation]);

  // 타임라인
  useEffect(() => {
    if (!isEntered) return;
    if (!dancerRef.current) return;

    // 피봇으로 모델 주위 돌게하기 위해서
    const pivot = new THREE.Group();
    // 모델 위치 복사하고
    pivot.position.copy(dancerRef.current.position);
    // 카메라 추가
    pivot.add(three.camera);
    // scene에 피봇 추가
    three.scene.add(pivot);

    timeline = gsap.timeline();

    timeline
      //타임라인상 0.5 위치에서 rotation 조절 애니메이션 실행
      .from(dancerRef.current.rotation, { duration: 4, y: Math.PI }, 0.5)
      // 위 애니메이션과 같이 실행 x :3 좌표에서 0의 위치로 돌아옴
      .from(dancerRef.current.position, { duration: 4, x: 3 }, "<")
      // 위 애니메이션들과 같이 초기위치에서 x:2 z:8 위치로 이동
      .to(three.camera.position, { duration: 10, x: 2, z: 8 }, "<")
      .to(colors, { duration: 10, boxMaterialColor: "#0c0400" }, "<")
      .to(pivot.rotation, { duration: 10, y: Math.PI })
      .to(three.camera.position, { duration: 10, x: -4, z: 12 }, "<")
      // 앞의 3개 애니메이션이 끝난 뒤 카메라 위치가 x:0, z:6 위치로 이동
      .to(three.camera.position, { duration: 10, x: 0, z: 6 })
      // 결국 카메라 이동은 MainCanvas에서 지정한 초기 position:[0,6,12] 에서
      // x:2, y:6, z:8 으로 이동했다가 이동이 끝나면 x:0, y:6, z: 6 으로 이동

      // 카메라가 앞의 애니메이션 실행 후 x:0, y:6, z:16 으로 이동
      .to(three.camera.position, {
        duration: 10,
        x: 0,
        z: 16,
        onUpdate: () => {
          setRotateFinished(false);
        },
      })
      .to(
        pivot.rotation,
        {
          duration: 15,
          y: Math.PI * 4,
          onUpdate: () => {
            setRotateFinished(true);
          },
        },
        "<"
      )
      .to(colors, {
        boxMaterialColor: "#ee5050",
      });
    return () => {
      three.scene.remove(pivot);
    };
  }, [isEntered, three.camera.position, three.camera, three.scene]);
  // 매 프레임마다(1초에 60번 정도) 실행될 함수
  useFrame(() => {
    if (!isEntered || !boxRef.current || !boxRef.current.material) return;
    if (timeline) {
      timeline.seek(scroll.offset * timeline.duration());
      //scroll.offset : 현재 스크롤 위치를 0~1 사이의 값으로 나타냄
      //timeline.duration(): 전체 타임라인의 지속시간 반환
      // 두개 곱하면 현재 스크롤 위치에 해당하는 타임라인 시간을 계산함
      // timeline.seek() : 계산된 시간으로 타임라인 이동시킴
      // 타임라인을 스크롤 기반으로 쓰려고 하는거임
    }
    // 박스 재질 색 맨 위의 colors에 정의한 색으로 변경
    boxRef.current.material.color = new THREE.Color(colors.boxMaterialColor);
    // 회전이 끝났다면 애니메이션을 breakdancingEnd 해주고 그게 아니면 그대로 wave 실행
    if (rotateFinished) {
      setCurrentAnimation("breakdancingEnd");
    } else {
      setCurrentAnimation("wave");
    }
  });

  if (isEntered) {
    return (
      <>
        <primitive ref={dancerRef} object={scene} scale={0.05} />
        <ambientLight intensity={2} />
        <rectAreaLight
          ref={rectAreaLightRef}
          position={[0, 10, 0]}
          intensity={30}
        />
        <pointLight
          position={[0, 5, 0]}
          intensity={45}
          castShadow
          receiveShadow
        />
        <hemisphereLight
          ref={hemisphereLightRef}
          position={[0, 5, 0]}
          intensity={0}
          groundColor={"lime"}
          color="blue"
        />
        {/* 배경 */}
        <Box ref={boxRef} position={[0, 0, 0]} args={[100, 100, 100]}>
          <meshStandardMaterial color={"#ee5050"} side={THREE.DoubleSide} />
        </Box>
        {/* 댄서가 밟고있는 땅 */}
        <Circle
          castShadow
          receiveShadow
          args={[8, 32]}
          rotation-x={-Math.PI / 2}
          position-y={-4.4}
        >
          <meshStandardMaterial color={"#DC4F00"} side={THREE.DoubleSide} />
        </Circle>
        {/* 별찍기 */}

        <Points positions={positions}>
          <pointsMaterial
            ref={starRef}
            size={0.5}
            color={new THREE.Color("#d4d13a")}
            sizeAttenuation
            depthWrite={false}
            alphaMap={texture}
            transparent
            alphaTest={0.001}
          />
        </Points>
      </>
    );
  }
  return <Loader isCompleted />;
};
