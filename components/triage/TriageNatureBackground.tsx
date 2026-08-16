"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface DriftingLeaf {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  rotation: number;
  angularVelocity: number;
  swaySpeed: number;
  swayOffset: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface WindBreeze {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  curve: number;
}

interface JumpingFish {
  active: boolean;
  startX: number;
  targetX: number;
  x: number;
  y: number;
  progress: number;
  peakHeight: number;
  scale: number;
}

interface FishRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

interface AmbientSpore {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  opacity: number;
  swayOffset: number;
}

export default function TriageNatureBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leavesRef = useRef<DriftingLeaf[]>([]);
  const windRef = useRef<WindBreeze[]>([]);
  const ripplesRef = useRef<FishRipple[]>([]);
  const sporesRef = useRef<AmbientSpore[]>([]);
  const fishRef = useRef<JumpingFish>({
    active: false,
    startX: 0,
    targetX: 0,
    x: 0,
    y: 0,
    progress: 0,
    peakHeight: 70,
    scale: 0.9,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = container.clientWidth || window.innerWidth);
    let height = (canvas.height = container.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !container) return;
      width = canvas.width = container.clientWidth || window.innerWidth;
      height = canvas.height = container.clientHeight || window.innerHeight;
      initSpores();
    };

    window.addEventListener("resize", handleResize);

    const initSpores = () => {
      const spores: AmbientSpore[] = [];
      for (let i = 0; i < 24; i++) {
        spores.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 0.8 + Math.random() * 1.5,
          speedY: 0.15 + Math.random() * 0.25,
          speedX: (Math.random() - 0.5) * 0.3,
          opacity: 0.05 + Math.random() * 0.12,
          swayOffset: Math.random() * Math.PI * 2,
        });
      }
      sporesRef.current = spores;
    };

    initSpores();

    // Occasional leaf falling with a small gust of wind (every 10-14 seconds)
    const triggerWindAndLeaf = () => {
      if (document.hidden) return;

      // 1. Small soft wind gust streaks
      const startY = 40 + Math.random() * (height * 0.6);
      for (let i = 0; i < 5; i++) {
        windRef.current.push({
          x: -60 - i * 40,
          y: startY + (Math.random() - 0.5) * 50,
          length: 50 + Math.random() * 90,
          speed: 12 + Math.random() * 8,
          opacity: 0.18 + Math.random() * 0.15,
          curve: (Math.random() - 0.5) * 18,
        });
      }

      // 2. Stray falling leaf from anywhere top/left
      const isMobile = window.innerWidth < 640;
      leavesRef.current.push({
        x: Math.random() * (width * 0.65),
        y: -20,
        vx: 1.1 + Math.random() * 1.5,
        vy: 0.75 + Math.random() * 1.0,
        scale: (0.8 + Math.random() * 0.4) * (isMobile ? 0.65 : 1.0),
        rotation: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.05,
        swaySpeed: 1.3 + Math.random() * 1.4,
        swayOffset: Math.random() * Math.PI * 2,
        opacity: 0.55 + Math.random() * 0.35,
        life: 0,
        maxLife: 360 + Math.floor(Math.random() * 160),
      });
    };

    // Initial leaf and recurring timer
    triggerWindAndLeaf();
    const leafTimer = setInterval(triggerWindAndLeaf, 11000);

    // Random Fish Jump Routine (Every 8-12 seconds)
    const triggerFishJump = () => {
      if (fishRef.current.active || document.hidden) return;
      const isMobile = window.innerWidth < 640;
      const startX = width * (0.15 + Math.random() * 0.7);
      const jumpDistance =
        (Math.random() - 0.5) * (isMobile ? 80 : 130) + (Math.random() > 0.5 ? 50 : -50);
      const targetX = Math.max(20, Math.min(width - 20, startX + jumpDistance));
      const peak = (60 + Math.random() * 55) * (isMobile ? 0.65 : 1.0);

      fishRef.current = {
        active: true,
        startX,
        targetX,
        x: startX,
        y: height - 4,
        progress: 0,
        peakHeight: peak,
        scale: (0.75 + Math.random() * 0.3) * (isMobile ? 0.75 : 1.0),
      };

      ripplesRef.current.push({
        x: startX,
        y: height - 5,
        radius: 3,
        maxRadius: 26,
        opacity: 0.55,
      });

      gsap.to(fishRef.current, {
        progress: 1,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          ripplesRef.current.push({
            x: fishRef.current.targetX,
            y: height - 5,
            radius: 4,
            maxRadius: 32,
            opacity: 0.65,
          });
          fishRef.current.active = false;
        },
      });
    };

    const fishTimer = setInterval(() => {
      if (Math.random() > 0.2) {
        triggerFishJump();
      }
    }, 9500);

    // Click near bottom to trigger fish jump
    const handleClick = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      if (clickY > height - 65 && !fishRef.current.active) {
        triggerFishJump();
      }
    };

    window.addEventListener("click", handleClick);

    // Draw Bottom Meadow Grass Blades & Pebbles
    const drawGrassAndPebbles = (time: number) => {
      ctx.save();
      ctx.lineCap = "round";

      // 1. Subtle River Pebbles along bottom
      const pebbleCount = Math.floor(width / 55);
      for (let i = 0; i < pebbleCount; i++) {
        const px = (i / pebbleCount) * width + 20;
        ctx.beginPath();
        ctx.ellipse(px, height - 5, 7, 3, 0.1, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(6, 78, 59, 0.08)";
        ctx.fill();
      }

      // 2. Gentle Grass Blades
      const bladeCount = Math.floor(width / 18);
      for (let i = 0; i < bladeCount; i++) {
        const x = (i / bladeCount) * width + Math.sin(i * 1.6) * 6;
        const bladeH = 18 + (i % 4) * 10 + Math.cos(i * 1.5) * 6;
        const sway = Math.sin(time * 1.1 + i * 0.45) * 5;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(6, 78, 59, ${0.11 + (i % 2) * 0.07})`;
        ctx.lineWidth = 1.3;
        ctx.moveTo(x, height);
        ctx.quadraticCurveTo(
          x + sway * 0.4,
          height - bladeH * 0.6,
          x + sway,
          height - bladeH
        );
        ctx.stroke();
      }

      ctx.restore();
    };

    // Draw Leaping Ink Fish
    const drawFish = () => {
      const f = fishRef.current;
      if (!f.active) return;

      const p = f.progress;
      f.x = f.startX + (f.targetX - f.startX) * p;
      f.y = height - 5 - Math.sin(p * Math.PI) * f.peakHeight;

      const direction = f.targetX > f.startX ? 1 : -1;
      const angle = (p - 0.5) * Math.PI * 0.7 * direction;

      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(angle);
      ctx.scale(f.scale * direction, f.scale);

      ctx.fillStyle = "rgba(6, 78, 59, 0.85)";
      ctx.strokeStyle = "#064E3B";
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.moveTo(13, 0);
      ctx.bezierCurveTo(7, -6, -4, -5, -13, 0);
      ctx.bezierCurveTo(-4, 5, 7, 6, 13, 0);
      ctx.fill();
      ctx.stroke();

      // Tail fin
      ctx.beginPath();
      ctx.moveTo(-13, 0);
      ctx.lineTo(-20, -5);
      ctx.quadraticCurveTo(-17, 0, -20, 5);
      ctx.closePath();
      ctx.fillStyle = "rgba(6, 78, 59, 0.65)";
      ctx.fill();
      ctx.stroke();

      // Eye
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(8, -1.8, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Draw Water Ripples
    const drawRipples = () => {
      ctx.save();
      ripplesRef.current.forEach((r, idx) => {
        r.radius += 0.7;
        r.opacity *= 0.94;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(6, 78, 59, ${r.opacity})`;
        ctx.lineWidth = 1.1;
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();

        if (r.opacity < 0.02 || r.radius > r.maxRadius) {
          ripplesRef.current.splice(idx, 1);
        }
      });
      ctx.restore();
    };

    // Draw Small Wind Gust Streaks
    const drawWind = () => {
      ctx.save();
      ctx.strokeStyle = "rgba(6, 78, 59, 0.35)";
      ctx.lineWidth = 1.1;

      for (let i = windRef.current.length - 1; i >= 0; i--) {
        const w = windRef.current[i];
        w.x += w.speed;
        w.opacity *= 0.985;

        if (w.opacity < 0.02 || w.x > width + 100) {
          windRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.globalAlpha = w.opacity;
        ctx.moveTo(w.x, w.y);
        ctx.bezierCurveTo(
          w.x + w.length * 0.4,
          w.y + w.curve,
          w.x + w.length * 0.8,
          w.y - w.curve,
          w.x + w.length,
          w.y
        );
        ctx.stroke();
      }
      ctx.restore();
    };

    // Draw Drifting Leaves
    const drawLeaves = (time: number) => {
      ctx.save();
      const leaves = leavesRef.current;
      for (let i = leaves.length - 1; i >= 0; i--) {
        const l = leaves[i];
        l.life++;
        l.x += l.vx + Math.sin(time * l.swaySpeed + l.swayOffset) * 1.5;
        l.y += l.vy;
        l.rotation += l.angularVelocity;

        const progress = l.life / l.maxLife;
        const currentOpacity =
          l.opacity * (progress > 0.75 ? (1 - progress) * 4 : 1);

        if (l.life >= l.maxLife || l.x > width + 40 || l.y > height + 40) {
          leaves.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rotation);
        ctx.scale(l.scale, l.scale);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(8, -8, 9, -20, 0, -26);
        ctx.bezierCurveTo(-9, -20, -8, -8, 0, 0);
        ctx.fillStyle = `rgba(6, 78, 59, ${currentOpacity * 0.75})`;
        ctx.strokeStyle = `rgba(6, 78, 59, ${currentOpacity})`;
        ctx.lineWidth = 1.2;
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -22);
        ctx.strokeStyle = `rgba(6, 78, 59, ${currentOpacity * 0.6})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      }
      ctx.restore();
    };

    // Animation Loop
    let time = 0;
    const render = () => {
      time += 0.025;
      ctx.clearRect(0, 0, width, height);

      // 1. Spores
      sporesRef.current.forEach((spore) => {
        spore.y -= spore.speedY;
        spore.x += Math.sin(time * 0.8 + spore.swayOffset) * 0.35 + spore.speedX;
        if (spore.y < -10) spore.y = height + 10;
        if (spore.x < -10) spore.x = width + 10;
        if (spore.x > width + 10) spore.x = -10;

        ctx.beginPath();
        ctx.arc(spore.x, spore.y, spore.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 78, 59, ${spore.opacity})`;
        ctx.fill();
      });

      drawGrassAndPebbles(time);
      drawRipples();
      drawFish();
      drawWind();
      drawLeaves(time);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", handleClick);
      clearInterval(leafTimer);
      clearInterval(fishTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto cursor-default"
      />
    </div>
  );
}
