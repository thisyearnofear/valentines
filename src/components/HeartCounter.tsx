import { useState } from "react";
import { FaHeart } from "react-icons/fa";

interface HeartCounterProps {
  counter: number;
  onHold: () => void;
  size: number;
}

const HeartCounter = ({ counter, onHold, size }: HeartCounterProps) => {
  const [showShadow, setShowShadow] = useState(false);
  const actualSize = size * 0.5; // Make the heart even smaller to match original

  return (
    <div
      className="relative hover:cursor-pointer transform-gpu"
      onMouseDown={() => setShowShadow(true)}
      onMouseUp={() => {
        setShowShadow(false);
        onHold();
      }}
      onMouseLeave={() => setShowShadow(false)}
      onTouchStart={() => setShowShadow(true)}
      onTouchEnd={() => {
        setShowShadow(false);
        onHold();
      }}
      style={{
        width: actualSize + "px",
        height: actualSize + "px",
      }}
    >
      <FaHeart
        className="relative z-0 top-0 left-0 transition-all duration-75 ease-in-out transform-gpu"
        color="#ff1744"
        size={actualSize}
        style={{
          filter: `
            drop-shadow(0 0 ${
              showShadow ? "30px" : "15px"
            } rgba(255, 23, 68, 0.5))
            drop-shadow(0 0 ${
              showShadow ? "15px" : "8px"
            } rgba(255, 23, 68, 0.8))
          `,
          transform: `
            scale(${showShadow ? 0.92 : 1})
            ${showShadow ? "translateY(2px)" : "translateY(0)"}
          `,
        }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center z-10 select-none font-bold transition-all duration-75 ease-in-out transform-gpu"
        style={{
          color: "rgba(255, 255, 255, 0.95)",
          transform: `
            scale(${showShadow ? 0.92 : 1})
            ${showShadow ? "translateY(2px)" : "translateY(0)"}
          `,
          fontSize: actualSize / 6 + "px",
          textShadow: `
            0 2px 4px rgba(0,0,0,0.3),
            0 0 ${showShadow ? "8px" : "4px"} rgba(255,255,255,0.5)
          `,
        }}
      >
        {counter.toLocaleString()}
      </div>
    </div>
  );
};

export default HeartCounter;
