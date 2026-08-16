"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface Leaf {
  id: number;
  stemX: number; // Anchor point directly on the wood
  stemY: number;
  stemLength: number;
  x: number;
  y: number;
  scale: number;
  angle: number;
  baseAngle: number;
  isFallen: boolean;
  vx: number;
  vy: number;
  angularVelocity: number;
  oscillationOffset: number;
  swaySpeed: number;
}

interface Apple {
  stemX: number;
  stemY: number;
  x: number;
  y: number;
  scale: number;
  isGrown: boolean;
  isFallen: boolean;
  vy: number;
  vx: number;
  rotation: number;
}

interface WindParticle {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  curve: number;
}

export const NatureInteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const leavesRef = useRef<Leaf[]>([]);
  const appleRef = useRef<Apple | null>(null);
  const windParticlesRef = useRef<WindParticle[]>([]);
  const isWindActiveRef = useRef<boolean>(false);
  const fallenCountRef = useRef<number>(0);
  const RESET_THRESHOLD = 6;

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

    // Initialize anchor branch nodes & realistic leaf stems
    const initScene = () => {
      const leaves: Leaf[] = [];

      // Exact attachment points along the arching bough
      const stemAnchors = [
        // Main bough body
        { x: width * 0.04, y: height * 0.12, angle: Math.PI * 0.3 },
        { x: width * 0.09, y: height * 0.1, angle: -Math.PI * 0.2 },
        { x: width * 0.14, y: height * 0.08, angle: Math.PI * 0.4 },
        { x: width * 0.18, y: height * 0.07, angle: -Math.PI * 0.35 },
        { x: width * 0.24, y: height * 0.06, angle: Math.PI * 0.25 },
        { x: width * 0.3, y: height * 0.05, angle: -Math.PI * 0.2 },
        { x: width * 0.36, y: height * 0.06, angle: Math.PI * 0.45 },
        { x: width * 0.42, y: height * 0.07, angle: -Math.PI * 0.15 },
        { x: width * 0.48, y: height * 0.08, angle: Math.PI * 0.3 },
        { x: width * 0.54, y: height * 0.1, angle: -Math.PI * 0.4 },
        // Secondary sub-branch twigs
        { x: width * 0.12, y: height * 0.14, angle: Math.PI * 0.6 },
        { x: width * 0.16, y: height * 0.16, angle: Math.PI * 0.5 },
        { x: width * 0.22, y: height * 0.12, angle: Math.PI * 0.55 },
        { x: width * 0.28, y: height * 0.11, angle: Math.PI * 0.4 },
        { x: width * 0.34, y: height * 0.12, angle: Math.PI * 0.6 },
      ];

      let leafId = 0;
      stemAnchors.forEach((anchor) => {
        // 1 to 2 leaves sprouting from each petiole node
        const sproutCount = Math.random() > 0.4 ? 2 : 1;
        for (let i = 0; i < sproutCount; i++) {
          const stemLen = 14 + Math.random() * 8;
          const spread =
            (i === 0 ? 0 : 0.45) * (Math.random() > 0.5 ? 1 : -1);
          const baseAngle = anchor.angle + spread;
          const leafX = anchor.x + Math.cos(baseAngle) * stemLen;
          const leafY = anchor.y + Math.sin(baseAngle) * stemLen;

          leaves.push({
            id: leafId++,
            stemX: anchor.x,
            stemY: anchor.y,
            stemLength: stemLen,
            x: leafX,
            y: leafY,
            scale: 0.8 + Math.random() * 0.4,
            angle: baseAngle,
            baseAngle: baseAngle,
            isFallen: false,
            vx: 0,
            vy: 0,
            angularVelocity: (Math.random() - 0.5) * 0.07,
            oscillationOffset: Math.random() * Math.PI * 2,
            swaySpeed: 1.4 + Math.random() * 1.2,
          });
        }
      });

      leavesRef.current = leaves;
      fallenCountRef.current = 0;

      // Single Apple hanging from lower fork node
      appleRef.current = {
        stemX: width * 0.2,
        stemY: height * 0.11,
        x: width * 0.2,
        y: height * 0.11 + 22,
        scale: 0,
        isGrown: false,
        isFallen: false,
        vy: 0,
        vx: 0,
        rotation: 0,
      };

      triggerAppleGrowth();
    };

    // Rapid Apple Growth Routine
    const triggerAppleGrowth = () => {
      if (!appleRef.current) return;
      appleRef.current.scale = 0;
      appleRef.current.isGrown = false;
      appleRef.current.isFallen = false;

      // Swells smoothly to full ripeness in 4.5s
      gsap.to(appleRef.current, {
        scale: 1,
        duration: 4.5,
        delay: 2.0,
        ease: "elastic.out(1, 0.6)",
        onComplete: () => {
          if (appleRef.current) appleRef.current.isGrown = true;
        },
      });
    };

    initScene();

    // Occasional gentle ambient leaf detach (every 12s)
    const ambientFallTimer = setInterval(() => {
      const attached = leavesRef.current.filter((l) => !l.isFallen);
      if (attached.length > 4 && !isWindActiveRef.current) {
        const randomLeaf =
          attached[Math.floor(Math.random() * attached.length)];
        randomLeaf.isFallen = true;
        randomLeaf.vy = 0.9;
        randomLeaf.vx = (Math.random() - 0.5) * 1.4;
        fallenCountRef.current += 1;

        if (fallenCountRef.current >= RESET_THRESHOLD) {
          triggerWindSweep();
        }
      }
    }, 12000);

    // Wind Gust Animation Reset
    const triggerWindSweep = () => {
      if (isWindActiveRef.current) return;
      isWindActiveRef.current = true;

      // Wind streak curves
      const particles: WindParticle[] = [];
      for (let i = 0; i < 24; i++) {
        particles.push({
          x: -120 - Math.random() * 250,
          y: Math.random() * height * 0.85,
          length: 70 + Math.random() * 150,
          speed: 15 + Math.random() * 12,
          opacity: 0.16 + Math.random() * 0.2,
          curve: (Math.random() - 0.5) * 30,
        });
      }
      windParticlesRef.current = particles;

      // Swoop fallen leaves back onto exact branch stem positions
      leavesRef.current.forEach((leaf) => {
        if (leaf.isFallen) {
          const targetX =
            leaf.stemX + Math.cos(leaf.baseAngle) * leaf.stemLength;
          const targetY =
            leaf.stemY + Math.sin(leaf.baseAngle) * leaf.stemLength;

          gsap.to(leaf, {
            x: targetX,
            y: targetY,
            angle: leaf.baseAngle,
            duration: 1.6 + Math.random() * 0.5,
            ease: "power3.inOut",
            onComplete: () => {
              leaf.isFallen = false;
              leaf.vx = 0;
              leaf.vy = 0;
            },
          });
        }
      });

      // Respawn apple if plucked
      if (appleRef.current && appleRef.current.isFallen) {
        setTimeout(triggerAppleGrowth, 1000);
      }

      setTimeout(() => {
        isWindActiveRef.current = false;
        windParticlesRef.current = [];
        fallenCountRef.current = 0;
      }, 2200);
    };

    // Draw Hand-drawn Style Organic Bough (Reference Style)
    const drawBranch = () => {
      ctx.save();
      ctx.strokeStyle = "#064E3B";
      ctx.fillStyle = "#064E3B";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 1. Main Outcropping Limb emerging from top-left
      ctx.beginPath();
      ctx.globalAlpha = 0.22;
      ctx.lineWidth = 14;
      ctx.moveTo(-10, -10);
      ctx.bezierCurveTo(
        width * 0.06,
        height * 0.08,
        width * 0.18,
        height * 0.08,
        width * 0.32,
        height * 0.05
      );
      ctx.stroke();

      // Tapered limb continuation
      ctx.beginPath();
      ctx.globalAlpha = 0.18;
      ctx.lineWidth = 8;
      ctx.moveTo(width * 0.32, height * 0.05);
      ctx.bezierCurveTo(
        width * 0.42,
        height * 0.04,
        width * 0.52,
        height * 0.07,
        width * 0.58,
        height * 0.1
      );
      ctx.stroke();

      // 2. Lower Natural Fork / Sub-branch
      ctx.beginPath();
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = 5.5;
      ctx.moveTo(width * 0.1, height * 0.09);
      ctx.bezierCurveTo(
        width * 0.16,
        height * 0.16,
        width * 0.26,
        height * 0.14,
        width * 0.36,
        height * 0.12
      );
      ctx.stroke();

      // Delicate Twig Extensions
      ctx.beginPath();
      ctx.globalAlpha = 0.12;
      ctx.lineWidth = 2.5;
      ctx.moveTo(width * 0.22, height * 0.13);
      ctx.lineTo(width * 0.25, height * 0.17);
      ctx.moveTo(width * 0.44, height * 0.06);
      ctx.lineTo(width * 0.48, height * 0.03);
      ctx.stroke();

      // Organic Bark hatching contours
      ctx.beginPath();
      ctx.globalAlpha = 0.08;
      ctx.lineWidth = 1.5;
      ctx.moveTo(width * 0.02, height * 0.04);
      ctx.quadraticCurveTo(
        width * 0.08,
        height * 0.07,
        width * 0.15,
        height * 0.06
      );
      ctx.stroke();

      ctx.restore();
    };

    // Draw Single Leaf & Petiole Stem Connection
    const drawLeaf = (leaf: Leaf) => {
      ctx.save();

      // 1. Draw physical stem connecting to branch if attached
      if (!leaf.isFallen) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(6, 78, 59, 0.45)";
        ctx.lineWidth = 1.2;
        ctx.moveTo(leaf.stemX, leaf.stemY);
        ctx.lineTo(leaf.x, leaf.y);
        ctx.stroke();
      }

      // 2. Draw Leaf Body
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.angle);
      ctx.scale(leaf.scale, leaf.scale);

      ctx.fillStyle = leaf.isFallen
        ? "rgba(6, 78, 59, 0.42)"
        : "rgba(6, 78, 59, 0.22)";
      ctx.strokeStyle = "#064E3B";
      ctx.lineWidth = 1.3;

      ctx.beginPath();
      ctx.moveTo(0, 0); // Anchored at stem base
      ctx.bezierCurveTo(12, -8, 14, -20, 0, -26);
      ctx.bezierCurveTo(-14, -20, -12, -8, 0, 0);
      ctx.fill();
      ctx.stroke();

      // Central Vein
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -22);
      ctx.strokeStyle = "rgba(6, 78, 59, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    };

    // Draw Hanging Apple with Stem
    const drawApple = () => {
      const apple = appleRef.current;
      if (!apple || apple.scale <= 0.02) return;

      ctx.save();

      // Hanging Stem attached to branch
      if (!apple.isFallen) {
        ctx.beginPath();
        ctx.strokeStyle = "#064E3B";
        ctx.lineWidth = 1.6;
        ctx.moveTo(apple.stemX, apple.stemY);
        ctx.quadraticCurveTo(
          apple.stemX - 3,
          apple.stemY + 10,
          apple.x,
          apple.y - 12 * apple.scale
        );
        ctx.stroke();
      }

      ctx.translate(apple.x, apple.y);
      ctx.rotate(apple.rotation);
      ctx.scale(apple.scale, apple.scale);

      // Apple Body
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.bezierCurveTo(15, -18, 22, 4, 12, 18);
      ctx.bezierCurveTo(4, 22, -4, 22, -12, 18);
      ctx.bezierCurveTo(-22, 4, -15, -18, 0, -12);
      ctx.fillStyle = "rgba(6, 78, 59, 0.85)";
      ctx.strokeStyle = "#064E3B";
      ctx.lineWidth = 1.6;
      ctx.fill();
      ctx.stroke();

      // Highlight Arc
      ctx.beginPath();
      ctx.arc(-5, -1, 5, 0.8 * Math.PI, 1.4 * Math.PI);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.restore();
    };

    // Draw Wind Gust Streamers
    const drawWind = () => {
      if (!isWindActiveRef.current) return;
      ctx.save();
      ctx.strokeStyle = "#064E3B";
      ctx.lineWidth = 1.5;

      windParticlesRef.current.forEach((p) => {
        p.x += p.speed;
        p.y += Math.sin(p.x * 0.015) * 1.8;

        ctx.beginPath();
        ctx.globalAlpha = p.opacity;
        ctx.moveTo(p.x, p.y);
        ctx.bezierCurveTo(
          p.x + p.length * 0.4,
          p.y + p.curve,
          p.x + p.length * 0.7,
          p.y - p.curve,
          p.x + p.length,
          p.y
        );
        ctx.stroke();
      });

      ctx.restore();
    };

    // Hover cursor detection
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      let isHovering = false;

      // 1. Apple hover
      if (
        appleRef.current &&
        appleRef.current.isGrown &&
        !appleRef.current.isFallen
      ) {
        const dist = Math.hypot(
          appleRef.current.x - clickX,
          appleRef.current.y - clickY
        );
        if (dist < 35) isHovering = true;
      }

      // 2. Leaf hover
      if (!isHovering) {
        for (const leaf of leavesRef.current) {
          if (!leaf.isFallen) {
            const dist = Math.hypot(leaf.x - clickX, leaf.y - clickY);
            if (dist < 34 * leaf.scale) {
              isHovering = true;
              break;
            }
          }
        }
      }

      canvas.style.cursor = isHovering ? "pointer" : "default";
    };

    // Click / Pluck Interaction Handler
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // 1. Apple click
      if (
        appleRef.current &&
        appleRef.current.isGrown &&
        !appleRef.current.isFallen
      ) {
        const dist = Math.hypot(
          appleRef.current.x - clickX,
          appleRef.current.y - clickY
        );
        if (dist < 35) {
          appleRef.current.isFallen = true;
          appleRef.current.vy = 2.4;
          appleRef.current.vx = (Math.random() - 0.5) * 1.2;
          fallenCountRef.current += 2;
          if (fallenCountRef.current >= RESET_THRESHOLD) {
            setTimeout(triggerWindSweep, 500);
          }
          return;
        }
      }

      // 2. Leaf click
      for (const leaf of leavesRef.current) {
        if (!leaf.isFallen) {
          const dist = Math.hypot(leaf.x - clickX, leaf.y - clickY);
          if (dist < 34 * leaf.scale) {
            leaf.isFallen = true;
            leaf.vy = 1.2 + Math.random() * 1.2;
            leaf.vx = (Math.random() - 0.5) * 2.2;
            leaf.angularVelocity = (Math.random() - 0.5) * 0.08;
            fallenCountRef.current += 1;

            if (fallenCountRef.current >= RESET_THRESHOLD) {
              setTimeout(triggerWindSweep, 500);
            }
            break;
          }
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    // Continuous Frame Loop
    let time = 0;
    const render = () => {
      time += 0.025;
      ctx.clearRect(0, 0, width, height);

      drawBranch();
      drawWind();

      // Leaves Render & Physics
      leavesRef.current.forEach((leaf) => {
        if (!leaf.isFallen) {
          // Pivot around its stem anchor point with gentle breeze sway
          const sway =
            Math.sin(time * leaf.swaySpeed + leaf.oscillationOffset) * 0.12;
          leaf.angle = leaf.baseAngle + sway;
          leaf.x = leaf.stemX + Math.cos(leaf.angle) * leaf.stemLength;
          leaf.y = leaf.stemY + Math.sin(leaf.angle) * leaf.stemLength;
        } else if (leaf.y < height - 25) {
          // Falling with horizontal drift & tumble
          leaf.vy = Math.min(leaf.vy + 0.04, 2.8);
          leaf.x += Math.sin(time * 2.6 + leaf.id) * 2.0 + leaf.vx;
          leaf.y += leaf.vy;
          leaf.angle += leaf.angularVelocity;
        }
        drawLeaf(leaf);
      });

      // Apple Render & Physics
      if (appleRef.current && appleRef.current.scale > 0.02) {
        const apple = appleRef.current;
        if (!apple.isFallen) {
          apple.x = apple.stemX + Math.sin(time * 1.2) * 2;
          apple.y = apple.stemY + 22 + Math.cos(time * 0.8) * 1.5;
          apple.rotation = Math.sin(time * 1.2) * 0.06;
        } else if (apple.y < height - 30) {
          apple.vy += 0.12;
          apple.y += apple.vy;
          apple.x += apple.vx;
          apple.rotation += 0.03;
        }
        drawApple();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      clearInterval(ambientFallTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-auto z-0 select-none"
      style={{ cursor: "default" }}
    />
  );
};
