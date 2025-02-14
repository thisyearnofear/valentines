"use client";

import { useEffect, useState, useCallback } from "react";
import { useWindowSize } from "@uidotdev/usehooks";
import {
  doc,
  updateDoc,
  getDoc,
  Timestamp,
  increment,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { useDebounce } from "@uidotdev/usehooks";
import { db, auth } from "../services/firebase";
import HeartCounter from "../components/HeartCounter";
import Footer from "../components/Footer";
import UpdateText from "../components/UpdateText";
import Canvas from "../components/Canvas";
import WalletConnect from "../components/WalletConnect";
import Alert from "../components/Alert";
import LubModal from "../components/LubModal";
import OnboardingTour from "../components/OnboardingTour";

interface Data {
  count: number;
  lastUpdated: Timestamp;
}

export default function Home() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentDatetime, setCurrentDatetime] = useState(new Date());
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState("");
  const size = useWindowSize();
  const counterRef = doc(db, "counter/counter");
  const submitCounterDebounce = useDebounce(count, 1000);
  const [particles, setParticles] = useState<
    Array<{
      x: number;
      y: number;
      color: string;
      size: number;
      speedMultiplier: number;
      angle: number;
    }>
  >([]);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getData = useCallback(() => {
    getDoc(counterRef)
      .then((res) => {
        const data = res.data() as Data;
        if (data) {
          setTotalCount(data.count);
          localStorage.setItem("count", data.count.toString());
          setLastUpdated(data.lastUpdated.toDate());
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [counterRef]);

  useEffect(() => {
    // check last saved count
    const savedCount = localStorage.getItem("count");
    if (savedCount) {
      const parsedCount = parseInt(savedCount);
      if (typeof parsedCount === "number" && parsedCount >= 0) {
        setTotalCount(parsedCount);
      } else {
        localStorage.removeItem("count");
      }
    }

    // sign in anonymously then get data
    signInAnonymously(auth)
      .then(() => {
        getData();
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [getData]);

  useEffect(() => {
    if (count === 0) return;
    if (submitCounterDebounce) {
      const timestamp = Timestamp.fromDate(new Date());
      updateDoc(counterRef, {
        count: increment(submitCounterDebounce),
        lastUpdated: timestamp,
      }).catch((err) => {
        setError(err.message);
      });
      setCount(0);
      setLastUpdated(new Date());
      localStorage.setItem("count", totalCount.toString());
    }
  }, [submitCounterDebounce, count, counterRef, totalCount]);

  const getRandomColor = () => {
    // Use more vibrant colors with higher saturation
    const hue = Math.floor(Math.random() * 360);
    const saturation = 90 + Math.floor(Math.random() * 10); // 90-100%
    const lightness = 60 + Math.floor(Math.random() * 10); // 60-70%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  useEffect(() => {
    // Initialize particles with better distribution
    const initialParticles = Array.from({ length: 1500 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const distance =
        (Math.random() *
          Math.min(
            size.width ?? window.innerWidth,
            size.height ?? window.innerHeight
          )) /
        2;
      const centerX = (size.width ?? window.innerWidth) / 2;
      const centerY = (size.height ?? window.innerHeight) / 2;

      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        color: getRandomColor(),
        size: 1.5 + Math.random() * 1.5, // Slightly larger particles
        speedMultiplier: 0.9 + Math.random() * 0.2, // More consistent speed
        angle: Math.random() * Math.PI * 2, // For circular motion
      };
    });
    setParticles(initialParticles);
  }, [size.width, size.height]);

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    particles.forEach((particle) => {
      const wobble = shouldAnimate
        ? Math.sin(Date.now() * 0.01 + particle.angle) * 2
        : 0;
      const animationOffset = shouldAnimate
        ? {
            x:
              (Math.cos(particle.angle) * 12 + wobble) *
              particle.speedMultiplier,
            y:
              (Math.sin(particle.angle) * 12 + wobble) *
              particle.speedMultiplier,
          }
        : { x: 0, y: 0 };

      const gradient = ctx.createRadialGradient(
        particle.x + animationOffset.x,
        particle.y + animationOffset.y,
        0,
        particle.x + animationOffset.x,
        particle.y + animationOffset.y,
        particle.size * (shouldAnimate ? 2 : 1)
      );

      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(0.4, particle.color.replace(")", ", 0.8)"));
      gradient.addColorStop(1, "transparent");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(
        particle.x + animationOffset.x,
        particle.y + animationOffset.y,
        particle.size * (shouldAnimate ? 2 : 1),
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
  };

  const handleClick = () => {
    setCount(count + 1);
    setTotalCount(totalCount + 1);
    setShouldAnimate(true);
    setTimeout(() => setShouldAnimate(false), 400); // Slightly longer animation
  };

  const handleLastUpdatedRefresh = () => {
    getData();
    setCurrentDatetime(new Date());
  };

  return (
    <main className="min-h-screen bg-[#fad1cf] dark:bg-purple-800 transition-colors duration-1000">
      <Alert message={error} onClose={() => setError("")} />
      <Canvas
        draw={draw}
        width={size.width ?? 100}
        height={size.height ?? 100}
      />
      <div className="flex flex-col justify-evenly items-center min-h-screen m-auto px-5 select-none z-10 text-black dark:text-white">
        <div className="flex flex-row justify-between w-full max-w-3xl z-10">
          <button
            data-tour="lub-button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-white/90 dark:bg-gray-900/90 hover:bg-pink-100 dark:hover:bg-pink-900/50 shadow-sm transition-all duration-300 text-sm font-medium flex items-center gap-2"
          >
            <span>lub-u</span>
            <span className="text-pink-500">💕</span>
          </button>
          <WalletConnect />
        </div>
        <div data-tour="heart">
          <HeartCounter counter={totalCount} onHold={handleClick} size={250} />
        </div>
        <div className="flex flex-col justify-center items-center sm:flex-row sm:justify-between w-full max-w-3xl z-10">
          <UpdateText
            lastUpdated={lastUpdated}
            onRefresh={handleLastUpdatedRefresh}
            currentDateTime={currentDatetime}
          />
          <Footer />
        </div>
      </div>
      <LubModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        totalClicks={totalCount}
      />
      <OnboardingTour />
    </main>
  );
}
