"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";

interface Step {
  target: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
}

const steps: Step[] = [
  {
    target: "[data-tour='heart']",
    content: "Every click is someone spreading lub 💕",
    position: "bottom",
  },
  {
    target: "[data-tour='lub-button']",
    content: "social experiment ✨",
    position: "bottom",
  },
  {
    target: "[data-tour='built-by']",
    content:
      "Forked open source MIT license code. Any rewards voluntarily split with the originator, onchain via GitSplits on sOptimism 🌱",
    position: "top",
  },
];

export default function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeen = localStorage.getItem("hasSeenTour");
    if (!hasSeen) {
      // Delay the start slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("hasSeenTour", "true");
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  if (!isVisible) return null;

  const currentTarget = document.querySelector(steps[currentStep].target);
  if (!currentTarget) return null;

  const { top, left, width, height } = currentTarget.getBoundingClientRect();

  // Calculate tooltip position
  const getTooltipPosition = () => {
    const position = steps[currentStep].position;
    const spacing = 12; // Space between target and tooltip

    switch (position) {
      case "top":
        return {
          top: top - spacing,
          left: left + width / 2,
          transform: "translate(-50%, -100%)",
        };
      case "bottom":
        return {
          top: top + height + spacing,
          left: left + width / 2,
          transform: "translate(-50%, 0)",
        };
      case "left":
        return {
          top: top + height / 2,
          left: left - spacing,
          transform: "translate(-100%, -50%)",
        };
      case "right":
        return {
          top: top + height / 2,
          left: left + width + spacing,
          transform: "translate(0, -50%)",
        };
    }
  };

  const tooltipPosition = getTooltipPosition();

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Semi-transparent overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
      />

      {/* Highlight current element */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute"
        style={{
          top,
          left,
          width,
          height,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.1)",
          borderRadius: "inherit",
        }}
      />

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="absolute pointer-events-auto bg-white dark:bg-gray-900 rounded-xl shadow-xl p-4 max-w-xs"
        style={tooltipPosition}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <IoClose size={20} />
        </button>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {steps[currentStep].content}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  index === currentStep
                    ? "bg-pink-500"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="text-sm text-pink-500 hover:text-pink-600 font-medium"
          >
            {currentStep < steps.length - 1 ? "Next" : "Got it"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
