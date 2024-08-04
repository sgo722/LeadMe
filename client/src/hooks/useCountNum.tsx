import { useEffect, useState, useRef } from "react";

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export default function useCountNum(end: number, start = 0, duration = 2000) {
  const [count, setCount] = useState(start);
  const previousEnd = useRef(end); // 이전 end 값을 저장

  useEffect(() => {
    if (previousEnd.current !== end) {
      previousEnd.current = end; // end 값이 변경될 때만 업데이트
      let startTime: number | null = null;

      const animate = (time: number) => {
        if (startTime === null) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);
        const newCount = Math.round(
          start + (end - start) * easeOutExpo(progress)
        );
        setCount(newCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [end, start, duration]);

  return count;
}
