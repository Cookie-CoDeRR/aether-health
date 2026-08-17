"use client";

import React, { useEffect, useRef } from "react";

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

interface AmbientPollen {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  opacity: number;
  swayOffset: number;
}

export default function AmbientNatureOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const leavesRef = useRef<DriftingLeaf[]>([]);
  const pollenRef = useRef<AmbientPollen[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initScene();
    };

    window.addEventListener("resize", handleResize);

    // Initialize subtle floating pollen (reduced on mobile for buttery 60fps)
    const initScene = () => {
      const isMobile = width < 768;
      const pollenCount = isMobile ? 8 : 20;
      const pollen: AmbientPollen[] = [];
      for (let i = 0; i < pollenCount; i++) {
        pollen.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 0.8 + Math.random() * 1.4,
          speedY: 0.15 + Math.random() * 0.25,
          speedX: (Math.random() - 0.5) * 0.3,
          opacity: 0.05 + Math.random() * 0.12,
          swayOffset: Math.random() * Math.PI * 2,
        });
      }
      pollenRef.current = pollen;
    };

    initScene();

    // Spawn occasional drifting leaf blown by a wind gust (every 10-15 seconds)
    const spawnDriftingLeaf = () => {
      if (document.hidden) return;
      const isMobile = window.innerWidth < 768;
      if (leavesRef.current.length >= (isMobile ? 2 : 4)) return;

      const startFromTop = Math.random() > 0.5;
      const startX = startFromTop
        ? Math.random() * width * 0.8
        : -40;
      const startY = startFromTop
        ? -30
        : Math.random() * (height * 0.6);

      leavesRef.current.push({
        x: startX,
        y: startY,
        vx: 1.1 + Math.random() * 1.6,
        vy: 0.7 + Math.random() * 1.1,
        scale: (0.75 + Math.random() * 0.45) * (isMobile ? 0.6 : 1.0),
        rotation: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.05,
        swaySpeed: 1.2 + Math.random() * 1.4,
        swayOffset: Math.random() * Math.PI * 2,
        opacity: 0.45 + Math.random() * 0.35,
        life: 0,
        maxLife: isMobile ? 240 : 360,
      });
    };

    // Initial leaves
    spawnDriftingLeaf();
    const leafInterval = setInterval(spawnDriftingLeaf, 12000);

    // Draw Corner Botanical Grass Tufts (Bottom-Left & Bottom-Right)
    const drawCornerGrass = (time: number, isDark: boolean) => {
      ctx.save();
      ctx.lineCap = "round";
      const isMobile = width < 768;

      // 1. Bottom-Left Corner Grass Cluster
      const leftBlades = isMobile ? 6 : 12;
      for (let i = 0; i < leftBlades; i++) {
        const bladeX = (i / leftBlades) * (isMobile ? 80 : 130);
        const bladeHeight = (isMobile ? 22 : 28) + (i % 3) * (isMobile ? 10 : 16) + Math.sin(i * 1.2) * 8;
        const sway = Math.sin(time * 1.2 + i * 0.4) * (isMobile ? 5 : 8);

        ctx.beginPath();
        ctx.strokeStyle = isDark
          ? `rgba(167, 243, 208, ${0.55 + (i % 2) * 0.3})`
          : `rgba(6, 78, 59, ${0.22 + (i % 2) * 0.15})`;
        ctx.lineWidth = isDark ? 1.5 : 1.4;
        ctx.moveTo(bladeX, height);
        ctx.quadraticCurveTo(
          bladeX + sway * 0.4,
          height - bladeHeight * 0.6,
          bladeX + sway - (isMobile ? 4 : 6),
          height - bladeHeight
        );
        ctx.stroke();
      }

      if (!isMobile) {
        // Small pebbles on bottom-left corner (desktop only for performance)
        ctx.beginPath();
        ctx.ellipse(32, height - 6, 8, 4, 0.2, 0, Math.PI * 2);
        ctx.ellipse(68, height - 8, 11, 5, -0.15, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "rgba(167, 243, 208, 0.4)" : "rgba(6, 78, 59, 0.18)";
        ctx.fill();
      }

      // 2. Bottom-Right Corner Grass Cluster
      const rightBlades = isMobile ? 5 : 11;
      for (let i = 0; i < rightBlades; i++) {
        const bladeX = width - ((i / rightBlades) * (isMobile ? 75 : 120));
        const bladeHeight = (isMobile ? 20 : 26) + (i % 3) * (isMobile ? 9 : 14) + Math.cos(i * 1.4) * 7;
        const sway = Math.sin(time * 1.1 + i * 0.5) * (isMobile ? 4 : 7);

        ctx.beginPath();
        ctx.strokeStyle = isDark
          ? `rgba(167, 243, 208, ${0.52 + (i % 2) * 0.28})`
          : `rgba(6, 78, 59, ${0.2 + (i % 2) * 0.14})`;
        ctx.lineWidth = isDark ? 1.5 : 1.4;
        ctx.moveTo(bladeX, height);
        ctx.quadraticCurveTo(
          bladeX + sway * 0.4,
          height - bladeHeight * 0.6,
          bladeX + sway + (isMobile ? 4 : 6),
          height - bladeHeight
        );
        ctx.stroke();
      }

      ctx.restore();
    };

    // Draw Top-Right Corner Branch & Leaves
    const drawTopCornerFoliage = (time: number, isDark: boolean) => {
      ctx.save();
      ctx.strokeStyle = isDark ? "#6EE7B7" : "#064E3B";
      ctx.fillStyle = isDark ? "#6EE7B7" : "#064E3B";
      ctx.lineCap = "round";

      // Top-right subtle twig
      ctx.beginPath();
      ctx.globalAlpha = isDark ? 0.75 : 0.28;
      ctx.lineWidth = 3.8;
      ctx.moveTo(width + 10, -5);
      ctx.bezierCurveTo(
        width - 40,
        25,
        width - 90,
        35,
        width - 135,
        28
      );
      ctx.stroke();

      // Sub-twig fork
      ctx.beginPath();
      ctx.lineWidth = 2.4;
      ctx.globalAlpha = isDark ? 0.65 : 0.22;
      ctx.moveTo(width - 65, 30);
      ctx.quadraticCurveTo(width - 95, 55, width - 110, 65);
      ctx.stroke();

      // Top-right swaying leaves
      const leafNodes = [
        { x: width - 135, y: 28, angle: Math.PI * 0.8 },
        { x: width - 90, y: 35, angle: Math.PI * 0.6 },
        { x: width - 110, y: 65, angle: Math.PI * 0.45 },
        { x: width - 50, y: 22, angle: Math.PI * 0.7 },
      ];

      leafNodes.forEach((node, idx) => {
        const sway = Math.sin(time * 1.3 + idx) * 0.18;
        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.rotate(node.angle + sway);
        ctx.scale(0.95, 0.95);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(9, -8, 9, -20, 0, -26);
        ctx.bezierCurveTo(-9, -20, -9, -8, 0, 0);
        ctx.fillStyle = isDark ? "rgba(167, 243, 208, 0.65)" : "rgba(6, 78, 59, 0.45)";
        ctx.strokeStyle = isDark ? "#D1FAE5" : "#064E3B";
        ctx.lineWidth = 1.4;
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      });

      ctx.restore();
    };

    // Draw Drifting Leaves
    const drawDriftingLeaves = (time: number, isDark: boolean) => {
      ctx.save();
      const leaves = leavesRef.current;
      for (let i = leaves.length - 1; i >= 0; i--) {
        const l = leaves[i];
        l.life++;
        l.x += l.vx + Math.sin(time * l.swaySpeed + l.swayOffset) * 1.8;
        l.y += l.vy;
        l.rotation += l.angularVelocity + Math.sin(time * 2) * 0.03;

        const progress = l.life / l.maxLife;
        const currentOpacity = l.opacity * (progress > 0.8 ? (1 - progress) * 5 : 1);

        if (l.life >= l.maxLife || l.x > width + 50 || l.y > height + 50) {
          leaves.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rotation);
        ctx.scale(l.scale, l.scale);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(9, -9, 10, -22, 0, -28);
        ctx.bezierCurveTo(-10, -22, -9, -9, 0, 0);
        ctx.fillStyle = isDark
          ? `rgba(167, 243, 208, ${currentOpacity * 0.85})`
          : `rgba(6, 78, 59, ${currentOpacity * 0.85})`;
        ctx.strokeStyle = isDark
          ? `rgba(209, 250, 229, ${currentOpacity * 0.95})`
          : `rgba(6, 78, 59, ${currentOpacity})`;
        ctx.lineWidth = 1.4;
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -24);
        ctx.strokeStyle = isDark
          ? `rgba(255, 255, 255, ${currentOpacity * 0.9})`
          : `rgba(6, 78, 59, ${currentOpacity * 0.7})`;
        ctx.lineWidth = 1.0;
        ctx.stroke();

        ctx.restore();
      }
      ctx.restore();
    };

    // Draw Ambient Pollen / Spores
    const drawPollen = (time: number, isDark: boolean) => {
      ctx.save();

      pollenRef.current.forEach((p) => {
        p.y -= p.speedY;
        p.x += Math.sin(time * 0.8 + p.swayOffset) * 0.45 + p.speedX;

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, isDark ? p.radius * 1.1 : p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(167, 243, 208, ${Math.min(0.7, p.opacity * 2.2)})`
          : `rgba(6, 78, 59, ${Math.min(1, p.opacity * 2.2)})`;
        ctx.fill();
      });
      ctx.restore();
    };

    // Animation Loop
    let time = 0;
    const render = () => {
      time += 0.025;
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains("dark");

      drawCornerGrass(time, isDark);
      drawTopCornerFoliage(time, isDark);
      drawPollen(time, isDark);
      drawDriftingLeaves(time, isDark);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(leafInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30 select-none opacity-95 dark:opacity-90 transition-opacity duration-300"
      aria-hidden="true"
    />
  );
}
