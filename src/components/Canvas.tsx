import { useEffect, useRef } from "react";

interface CanvasProps {
  draw: (context: CanvasRenderingContext2D) => void;
  width: number;
  height: number;
}

const Canvas = ({ draw, width, height }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", {
      willReadFrequently: true,
      alpha: true,
    });
    if (!context) return;

    // Set up the context for better particle rendering
    context.globalCompositeOperation = "lighter";
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    let animationId: number;
    const animate = () => {
      draw(context);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="fixed top-0 left-0 w-full h-full transition-[opacity,filter] duration-1000"
      style={{
        opacity: 0.6,
        filter: "blur(0.5px)",
        mixBlendMode: "lighten",
      }}
    />
  );
};

export default Canvas;
