import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

let duration = 3 * 1000;
let skew = 1;

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function fire({ animationEnd }) {
  let timeLeft = animationEnd - Date.now();
  let ticks = Math.max(200, 500 * (timeLeft / duration));
  skew = Math.max(0.8, skew - 0.001);

  let colors = [
    "#26ccff",
    "#a25afd",
    "#ff5e7e",
    "#88ff5a",
    "#fcff42",
    "#ffa62d",
    "#ff36ff"
  ];

  let colorIndex = Math.round(randomInRange(0, colors.length));
  let color = colors[colorIndex];

  confetti({
    particleCount: 1,
    startVelocity: 0,
    ticks: ticks,
    origin: {
      x: Math.random(),
      y: Math.random() * skew - 0.2
    },
    colors: [color],
    shapes: ["circle"],
    gravity: randomInRange(0.4, 0.6),
    scalar: randomInRange(0.4, 1),
    drift: randomInRange(-0.4, 0.4),
    zIndex: "0"
  });

  if (timeLeft > 0) {
    requestAnimationFrame(() => fire({ animationEnd }));
  }
}

export const useConfetti = () => {
  let ran = useRef(false);
  useEffect(() => {
    let animationEnd = Date.now() + duration;

    if (!ran.current) {
      fire({ animationEnd });
    }

    ran.current = true;
  }, []);
};
