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

interface CursorDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  opacity: number;
}

export default function AmbientNatureOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const leavesRef = useRef<DriftingLeaf[]>([]);
  const pollenRef = useRef<AmbientPollen[]>([]);
  const cursorDustRef = useRef<CursorDust[]>([]);

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

    // Initialize subtle floating pollen
    const initScene = () => {
      const pollen: AmbientPollen[] = [];
      for (let i = 0; i < 22; i++) {
        pollen.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 0.8 + Math.random() * 1.6,
          speedY: 0.15 + Math.random() * 0.25,
          speedX: (Math.random() - 0.5) * 0.3,
          opacity: 0.05 + Math.random() * 0.12,
          swayOffset: Math.random() * Math.PI * 2,
        });
      }
      pollenRef.current = pollen;
    };

    initScene();

    // Spawn occasional drifting leaf blown by a wind gust (every 8-15 seconds)
    const spawnDriftingLeaf = () => {
      if (document.hidden) return;
      const startFromTop = Math.random() > 0.5;
      const startX = startFromTop
        ? Math.random() * width * 0.8
        : -40;
      const startY = startFromTop
        ? -30
        : Math.random() * (height * 0.6);

      const isMobile = window.innerWidth < 640;
      leavesRef.current.push({
        x: startX,
        y: startY,
        vx: 1.2 + Math.random() * 1.8,
        vy: 0.8 + Math.random() * 1.2,
        scale: (0.75 + Math.random() * 0.45) * (isMobile ? 0.65 : 1.0),
        rotation: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.06,
        swaySpeed: 1.4 + Math.random() * 1.6,
        swayOffset: Math.random() * Math.PI * 2,
        opacity: 0.45 + Math.random() * 0.35,
        life: 0,
        maxLife: 320 + Math.floor(Math.random() * 180),
      });
    };

    // Initial leaves
    spawnDriftingLeaf();
    const leafInterval = setInterval(() => {
      if (leavesRef.current.length < 5) {
        spawnDriftingLeaf();
      }
    }, 11000);

    // Subtle cursor dust emission on mousemove
    let lastMoveTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMoveTime > 50 && cursorDustRef.current.length < 16) {
        lastMoveTime = now;
        cursorDustRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.3 - Math.random() * 0.4,
          radius: 0.9 + Math.random() * 1.0,
          life: 0,
          maxLife: 20 + Math.floor(Math.random() * 10),
          opacity: 0.45 + Math.random() * 0.25,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Draw Corner Botanical Grass Tufts (Bottom-Left & Bottom-Right)
    const drawCornerGrass = (time: number) => {
      ctx.save();
      ctx.lineCap = "round";

      // 1. Bottom-Left Corner Grass Cluster
      const leftBlades = 10;
      for (let i = 0; i < leftBlades; i++) {
        const bladeX = (i / leftBlades) * 110;
        const bladeHeight = 24 + (i % 3) * 14 + Math.sin(i * 1.2) * 8;
        const sway = Math.sin(time * 1.2 + i * 0.4) * 6;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(6, 78, 59, ${0.12 + (i % 2) * 0.08})`;
        ctx.lineWidth = 1.3;
        ctx.moveTo(bladeX, height);
        ctx.quadraticCurveTo(
          bladeX + sway * 0.4,
          height - bladeHeight * 0.6,
          bladeX + sway - 6,
          height - bladeHeight
        );
        ctx.stroke();
      }

      // Small pebbles on bottom-left corner
      ctx.beginPath();
      ctx.ellipse(32, height - 6, 8, 4, 0.2, 0, Math.PI * 2);
      ctx.ellipse(68, height - 8, 11, 5, -0.15, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(6, 78, 59, 0.1)";
      ctx.fill();

      // 2. Bottom-Right Corner Grass Cluster
      const rightBlades = 9;
      for (let i = 0; i < rightBlades; i++) {
        const bladeX = width - ((i / rightBlades) * 100);
        const bladeHeight = 22 + (i % 3) * 12 + Math.cos(i * 1.4) * 7;
        const sway = Math.sin(time * 1.1 + i * 0.5) * 5;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(6, 78, 59, ${0.11 + (i % 2) * 0.07})`;
        ctx.lineWidth = 1.3;
        ctx.moveTo(bladeX, height);
        ctx.quadraticCurveTo(
          bladeX + sway * 0.4,
          height - bladeHeight * 0.6,
          bladeX + sway + 6,
          height - bladeHeight
        );
        ctx.stroke();
      }

      ctx.restore();
    };

    // Draw Top-Right Corner Branch & Leaves
    const drawTopCornerFoliage = (time: number) => {
      ctx.save();
      ctx.strokeStyle = "#064E3B";
      ctx.fillStyle = "#064E3B";
      ctx.lineCap = "round";

      // Top-right subtle twig
      ctx.beginPath();
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = 3.5;
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
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.12;
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
        const sway = Math.sin(time * 1.3 + idx) * 0.15;
        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.rotate(node.angle + sway);
        ctx.scale(0.85, 0.85);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(8, -7, 8, -18, 0, -24);
        ctx.bezierCurveTo(-8, -18, -8, -7, 0, 0);
        ctx.fillStyle = "rgba(6, 78, 59, 0.28)";
        ctx.strokeStyle = "#064E3B";
        ctx.lineWidth = 1.1;
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      });

      ctx.restore();
    };

    // Draw Drifting Leaves
    const drawDriftingLeaves = (time: number) => {
      ctx.save();
      const leaves = leavesRef.current;
      for (let i = leaves.length - 1; i >= 0; i--) {
        const l = leaves[i];
        l.life++;
        l.x += l.vx + Math.sin(time * l.swaySpeed + l.swayOffset) * 1.6;
        l.y += l.vy;
        l.rotation += l.angularVelocity + Math.sin(time * 2) * 0.02;

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
        ctx.bezierCurveTo(8, -8, 9, -20, 0, -26);
        ctx.bezierCurveTo(-9, -20, -8, -8, 0, 0);
        ctx.fillStyle = `rgba(6, 78, 59, ${currentOpacity * 0.85})`;
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

    // Draw Ambient Pollen
    const drawPollen = (time: number) => {
      ctx.save();
      pollenRef.current.forEach((p) => {
        p.y -= p.speedY;
        p.x += Math.sin(time * 0.8 + p.swayOffset) * 0.35 + p.speedX;

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 78, 59, ${p.opacity})`;
        ctx.fill();
      });
      ctx.restore();
    };

    // Draw Cursor Dust Trail
    const drawCursorDust = () => {
      ctx.save();
      const dust = cursorDustRef.current;
      for (let i = dust.length - 1; i >= 0; i--) {
        const d = dust[i];
        d.life++;
        d.x += d.vx;
        d.y += d.vy;

        const progress = d.life / d.maxLife;
        const currentOpacity = d.opacity * (1 - progress);

        if (d.life >= d.maxLife || currentOpacity <= 0) {
          dust.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius * (1 - progress * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 78, 59, ${currentOpacity * 0.7})`;
        ctx.fill();
      }
      ctx.restore();
    };

    // Animation Loop
    let time = 0;
    const render = () => {
      time += 0.025;
      ctx.clearRect(0, 0, width, height);

      drawCornerGrass(time);
      drawTopCornerFoliage(time);
      drawPollen(time);
      drawDriftingLeaves(time);
      drawCursorDust();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(leafInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 select-none opacity-90"
      aria-hidden="true"
    />
  );
}
