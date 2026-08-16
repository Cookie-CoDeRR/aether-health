"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface Leaf {
  id: number;
  stemX: number;
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
  swayOffset: number;
  swaySpeed: number;
  isCenterZone: boolean;
}

interface Apple {
  stemX: number;
  stemY: number;
  x: number;
  y: number;
  scale: number;
  isGrown: boolean;
  isFallen: boolean;
  isSplashed: boolean;
  vy: number;
  vx: number;
  rotation: number;
}

interface CursorSpore {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  maxOpacity: number;
}

interface Firefly {
  x: number;
  y: number;
  baseY: number;
  radius: number;
  pulseSpeed: number;
  pulseOffset: number;
  vx: number;
  vy: number;
  hue: number;
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
  rotation: number;
}

interface SplashDroplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  life: number;
  maxLife: number;
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
  swaySpeed: number;
}

interface Pebble {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rotation: number;
  opacity: number;
}

interface GrassBlade {
  x: number;
  height: number;
  curve: number;
  swaySpeed: number;
  swayOffset: number;
  opacity: number;
  width: number;
}

interface WindStreak {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  curve: number;
}

export const NatureBranchOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const leavesRef = useRef<Leaf[]>([]);
  const appleRef = useRef<Apple | null>(null);
  const cursorSporesRef = useRef<CursorSpore[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const splashDropletsRef = useRef<SplashDroplet[]>([]);
  const fishRef = useRef<JumpingFish>({
    active: false,
    startX: 0,
    targetX: 0,
    x: 0,
    y: 0,
    progress: 0,
    peakHeight: 120,
    scale: 1,
    rotation: 0,
  });
  const ripplesRef = useRef<FishRipple[]>([]);
  const sporesRef = useRef<AmbientSpore[]>([]);
  const pebblesRef = useRef<Pebble[]>([]);
  const grassRef = useRef<GrassBlade[]>([]);
  const windStreaksRef = useRef<WindStreak[]>([]);
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
      initInteractiveElements();
    };

    window.addEventListener("resize", handleResize);

    const initInteractiveElements = () => {
      const leaves: Leaf[] = [];
      const topOffset = window.innerWidth < 640 ? 44 : 64;
      const branchHeight = Math.min(height * 0.95, 720);

      // Rebalanced foliage: Increased along TOP CANOPY above title, reduced on side wings
      const branchTwigNodes = [
        // LEFT WING (Reduced by 2-3 leaves: now crisp 2-3 leaves per node)
        { nx: 0.05, ny: 0.28, angle: Math.PI * 0.45, sprouts: 2, scaleMod: 1.25 },
        { nx: 0.08, ny: 0.38, angle: Math.PI * 0.55, sprouts: 3, scaleMod: 1.3 },
        { nx: 0.12, ny: 0.48, angle: Math.PI * 0.42, sprouts: 3, scaleMod: 1.3 },
        { nx: 0.16, ny: 0.54, angle: Math.PI * 0.6, sprouts: 2, scaleMod: 1.25 },
        { nx: 0.2, ny: 0.48, angle: Math.PI * 0.48, sprouts: 2, scaleMod: 1.25 },
        { nx: 0.24, ny: 0.42, angle: Math.PI * 0.38, sprouts: 2, scaleMod: 1.2 },
        { nx: 0.15, ny: 0.16, angle: -Math.PI * 0.28, sprouts: 2, scaleMod: 1.2 },
        { nx: 0.22, ny: 0.14, angle: -Math.PI * 0.35, sprouts: 2, scaleMod: 1.2 },

        // TOP CANOPY ARCH (Above title: increased amount of leaves along the high upper branch)
        { nx: 0.3, ny: 0.08, angle: -Math.PI * 0.3, sprouts: 3, scaleMod: 1.15, isCenter: true },
        { nx: 0.38, ny: 0.06, angle: Math.PI * 0.22, sprouts: 3, scaleMod: 1.15, isCenter: true },
        { nx: 0.46, ny: 0.06, angle: -Math.PI * 0.25, sprouts: 3, scaleMod: 1.15, isCenter: true },
        { nx: 0.54, ny: 0.07, angle: Math.PI * 0.28, sprouts: 3, scaleMod: 1.15, isCenter: true },
        { nx: 0.62, ny: 0.09, angle: -Math.PI * 0.2, sprouts: 3, scaleMod: 1.15, isCenter: true },

        // RIGHT WING (Reduced by 2-3 leaves: now crisp 2-3 leaves per node)
        { nx: 0.7, ny: 0.13, angle: Math.PI * 0.35, sprouts: 3, scaleMod: 1.25 },
        { nx: 0.76, ny: 0.15, angle: -Math.PI * 0.32, sprouts: 3, scaleMod: 1.25 },
        { nx: 0.82, ny: 0.18, angle: Math.PI * 0.28, sprouts: 3, scaleMod: 1.3 },
        { nx: 0.88, ny: 0.22, angle: Math.PI * 0.38, sprouts: 2, scaleMod: 1.25 },
        { nx: 0.93, ny: 0.25, angle: -Math.PI * 0.22, sprouts: 2, scaleMod: 1.2 },
      ];

      let id = 0;
      branchTwigNodes.forEach((node) => {
        const count = node.sprouts || 2;
        const scaleBase = node.scaleMod || 1.2;
        for (let i = 0; i < count; i++) {
          const stemX = node.nx * width;
          const stemY = topOffset + node.ny * branchHeight;
          const stemLen = 20 + Math.random() * 14;
          const spread =
            (i === 0 ? 0 : 0.42 * (i % 2 === 0 ? 1 : -1) * Math.ceil(i / 2));
          const baseAngle = node.angle + spread;

          leaves.push({
            id: id++,
            stemX,
            stemY,
            stemLength: stemLen,
            x: stemX + Math.cos(baseAngle) * stemLen,
            y: stemY + Math.sin(baseAngle) * stemLen,
            scale: (1.05 + Math.random() * 0.35) * scaleBase,
            angle: baseAngle,
            baseAngle,
            isFallen: false,
            vx: 0,
            vy: 0,
            angularVelocity: (Math.random() - 0.5) * 0.07,
            swayOffset: Math.random() * Math.PI * 2,
            swaySpeed: 1.2 + Math.random() * 1.3,
            isCenterZone: Boolean(node.isCenter),
          });
        }
      });

      leavesRef.current = leaves;
      fallenCountRef.current = 0;

      // Position the Apple directly ABOVE the "g" in Intelligent with ample breathing space
      const appleStemX = 0.36 * width;
      const appleStemY = topOffset + 0.11 * branchHeight;
      appleRef.current = {
        stemX: appleStemX,
        stemY: appleStemY,
        x: appleStemX,
        y: appleStemY + 24,
        scale: 0,
        isGrown: false,
        isFallen: false,
        isSplashed: false,
        vy: 0,
        vx: 0,
        rotation: 0,
      };

      // Initialize Fireflies (Glowing Light Flies) near the bottom meadow
      const fireflies: Firefly[] = [];
      for (let i = 0; i < 18; i++) {
        const baseY = height - (30 + Math.random() * 95);
        fireflies.push({
          x: Math.random() * width,
          y: baseY,
          baseY,
          radius: 1.5 + Math.random() * 2.2,
          pulseSpeed: 1.8 + Math.random() * 2.4,
          pulseOffset: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.35,
          hue: 140 + Math.random() * 25,
        });
      }
      firefliesRef.current = fireflies;

      // Dense Floating Spores (85 particles)
      const spores: AmbientSpore[] = [];
      for (let i = 0; i < 85; i++) {
        spores.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 1.0 + Math.random() * 2.4,
          speedY: 0.18 + Math.random() * 0.4,
          speedX: (Math.random() - 0.5) * 0.45,
          opacity: 0.06 + Math.random() * 0.15,
          swayOffset: Math.random() * Math.PI * 2,
          swaySpeed: 0.8 + Math.random() * 1.4,
        });
      }
      sporesRef.current = spores;

      // Bottom Pebbles
      const pebbles: Pebble[] = [];
      const pebbleCount = Math.floor(width / 45);
      for (let i = 0; i < pebbleCount; i++) {
        pebbles.push({
          x: (i / pebbleCount) * width + (Math.random() - 0.5) * 35,
          y: height - (8 + Math.random() * 18),
          rx: 6 + Math.random() * 10,
          ry: 3.5 + Math.random() * 5.5,
          rotation: (Math.random() - 0.5) * 0.4,
          opacity: 0.12 + Math.random() * 0.14,
        });
      }
      pebblesRef.current = pebbles;

      // Prominent Bottom Grass Blades (38px - 85px)
      const grass: GrassBlade[] = [];
      const grassCount = Math.floor(width / 14);
      for (let i = 0; i < grassCount; i++) {
        grass.push({
          x: (i / grassCount) * width + (Math.random() - 0.5) * 12,
          height: 38 + Math.random() * 48,
          curve: (Math.random() - 0.5) * 18,
          swaySpeed: 0.9 + Math.random() * 1.1,
          swayOffset: Math.random() * Math.PI * 2,
          opacity: 0.14 + Math.random() * 0.18,
          width: 1.5 + Math.random() * 1.6,
        });
      }
      grassRef.current = grass;

      triggerAppleGrowth();
    };

    // Apple Growth Animation
    const triggerAppleGrowth = () => {
      if (!appleRef.current) return;
      appleRef.current.scale = 0;
      appleRef.current.isGrown = false;
      appleRef.current.isFallen = false;
      appleRef.current.isSplashed = false;
      appleRef.current.x = appleRef.current.stemX;
      appleRef.current.y = appleRef.current.stemY + 24;
      appleRef.current.vy = 0;
      appleRef.current.vx = 0;

      gsap.to(appleRef.current, {
        scale: 1.25,
        duration: 3.5,
        delay: 1.2,
        ease: "elastic.out(1, 0.6)",
        onComplete: () => {
          if (appleRef.current) appleRef.current.isGrown = true;
        },
      });
    };

    // Trigger Apple Splash and Vanish Effect at floor
    const triggerAppleSplash = (apple: Apple) => {
      apple.isSplashed = true;

      // 1. Water Ripple Rings
      ripplesRef.current.push({
        x: apple.x,
        y: height - 10,
        radius: 4,
        maxRadius: 42,
        opacity: 0.85,
      });
      ripplesRef.current.push({
        x: apple.x,
        y: height - 10,
        radius: 2,
        maxRadius: 28,
        opacity: 0.6,
      });

      // 2. Water Splash Droplets
      for (let i = 0; i < 14; i++) {
        splashDropletsRef.current.push({
          x: apple.x + (Math.random() - 0.5) * 8,
          y: height - 10,
          vx: (Math.random() - 0.5) * 4.5,
          vy: -2.5 - Math.random() * 4.0,
          radius: 1.2 + Math.random() * 2.2,
          opacity: 0.8,
          life: 0,
          maxLife: 28 + Math.floor(Math.random() * 15),
        });
      }

      // 3. Vanish Apple Smoothly
      gsap.to(apple, {
        scale: 0,
        duration: 0.35,
        ease: "power2.out",
        onComplete: () => {
          apple.isFallen = false;
          apple.isGrown = false;
          // Re-bud and regrow apple after 4 seconds
          setTimeout(triggerAppleGrowth, 4000);
        },
      });
    };

    // Random Fish Jump Routine
    const triggerFishJump = () => {
      if (fishRef.current.active) return;
      const startX = width * (0.15 + Math.random() * 0.7);
      const jumpDistance =
        (Math.random() - 0.5) * 160 + (Math.random() > 0.5 ? 90 : -90);
      const targetX = Math.max(40, Math.min(width - 40, startX + jumpDistance));
      const peak = 75 + Math.random() * 65;

      fishRef.current = {
        active: true,
        startX,
        targetX,
        x: startX,
        y: height - 5,
        progress: 0,
        peakHeight: peak,
        scale: 0.85 + Math.random() * 0.35,
        rotation: 0,
      };

      ripplesRef.current.push({
        x: startX,
        y: height - 6,
        radius: 3,
        maxRadius: 28,
        opacity: 0.6,
      });

      gsap.to(fishRef.current, {
        progress: 1,
        duration: 1.6,
        ease: "power2.inOut",
        onComplete: () => {
          ripplesRef.current.push({
            x: fishRef.current.targetX,
            y: height - 6,
            radius: 4,
            maxRadius: 36,
            opacity: 0.7,
          });
          fishRef.current.active = false;
        },
      });
    };

    initInteractiveElements();

    // Idle leaf drop every 10 seconds: ONLY from SIDE wings (never center zone above title)
    const ambientTimer = setInterval(() => {
      const activeSideLeaves = leavesRef.current.filter(
        (l) => !l.isFallen && !l.isCenterZone
      );
      if (activeSideLeaves.length > 6 && !isWindActiveRef.current) {
        const rand =
          activeSideLeaves[Math.floor(Math.random() * activeSideLeaves.length)];
        rand.isFallen = true;
        rand.vy = 0.9;
        rand.vx = (Math.random() - 0.5) * 1.3;
        fallenCountRef.current += 1;
        if (fallenCountRef.current >= RESET_THRESHOLD) triggerWindGust();
      }
    }, 10000);

    // Fish jump every 9 seconds
    const fishTimer = setInterval(() => {
      if (Math.random() > 0.25) {
        triggerFishJump();
      }
    }, 9000);

    // Wind sweep animation
    const triggerWindGust = () => {
      if (isWindActiveRef.current) return;
      isWindActiveRef.current = true;

      const streaks: WindStreak[] = [];
      for (let i = 0; i < 26; i++) {
        streaks.push({
          x: -120 - Math.random() * 220,
          y: Math.random() * height * 0.85,
          length: 80 + Math.random() * 180,
          speed: 18 + Math.random() * 14,
          opacity: 0.14 + Math.random() * 0.18,
          curve: (Math.random() - 0.5) * 30,
        });
      }
      windStreaksRef.current = streaks;

      leavesRef.current.forEach((leaf) => {
        if (leaf.isFallen) {
          const tx = leaf.stemX + Math.cos(leaf.baseAngle) * leaf.stemLength;
          const ty = leaf.stemY + Math.sin(leaf.baseAngle) * leaf.stemLength;
          gsap.to(leaf, {
            x: tx,
            y: ty,
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

      if (
        appleRef.current &&
        (appleRef.current.isFallen || appleRef.current.isSplashed)
      ) {
        setTimeout(triggerAppleGrowth, 1000);
      }

      setTimeout(() => {
        isWindActiveRef.current = false;
        windStreaksRef.current = [];
        fallenCountRef.current = 0;
      }, 2200);
    };

    // Draw Crisp Botanical Leaf
    const drawBotanicalLeaf = (leaf: Leaf) => {
      ctx.save();

      // Stem line
      if (!leaf.isFallen) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(6, 78, 59, 0.65)";
        ctx.lineWidth = 1.2;
        ctx.moveTo(leaf.stemX, leaf.stemY);
        ctx.lineTo(leaf.x, leaf.y);
        ctx.stroke();
      }

      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.angle);
      ctx.scale(leaf.scale, leaf.scale);

      // Slender Botanical Leaf shape
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(9, -9, 10, -22, 0, -30);
      ctx.bezierCurveTo(-10, -22, -9, -9, 0, 0);

      // Richer watercolor fill + crisp ink line
      ctx.fillStyle = leaf.isFallen
        ? "rgba(6, 78, 59, 0.75)"
        : "rgba(6, 78, 59, 0.48)";
      ctx.strokeStyle = "#064E3B";
      ctx.lineWidth = 1.3;
      ctx.fill();
      ctx.stroke();

      // Center vein
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -25);
      ctx.strokeStyle = "rgba(6, 78, 59, 0.65)";
      ctx.lineWidth = 0.9;
      ctx.stroke();

      ctx.restore();
    };

    // Draw Crisp Botanical Apple
    const drawBotanicalApple = () => {
      const apple = appleRef.current;
      if (!apple || apple.scale <= 0.02) return;

      ctx.save();
      if (!apple.isFallen) {
        ctx.beginPath();
        ctx.strokeStyle = "#064E3B";
        ctx.lineWidth = 1.5;
        ctx.moveTo(apple.stemX, apple.stemY);
        ctx.quadraticCurveTo(
          apple.stemX - 2,
          apple.stemY + 10,
          apple.x,
          apple.y - 10 * apple.scale
        );
        ctx.stroke();
      }

      ctx.translate(apple.x, apple.y);
      ctx.rotate(apple.rotation);
      ctx.scale(apple.scale, apple.scale);

      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.bezierCurveTo(15, -20, 24, 4, 14, 20);
      ctx.bezierCurveTo(4, 24, -4, 24, -14, 20);
      ctx.bezierCurveTo(-24, 4, -15, -20, 0, -12);
      ctx.fillStyle = "rgba(6, 78, 59, 0.88)";
      ctx.strokeStyle = "#064E3B";
      ctx.lineWidth = 1.6;
      ctx.fill();
      ctx.stroke();

      // Apple shine contour
      ctx.beginPath();
      ctx.arc(-5, -2, 5, 0.8 * Math.PI, 1.4 * Math.PI);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
      ctx.lineWidth = 1.3;
      ctx.stroke();

      ctx.restore();
    };

    // Draw Dynamic Cursor Spores (Sharper, subtle micro-particles)
    const drawCursorSpores = () => {
      ctx.save();
      const spores = cursorSporesRef.current;
      for (let i = spores.length - 1; i >= 0; i--) {
        const s = spores[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.008;

        const progress = s.life / s.maxLife;
        const currentOpacity = s.maxOpacity * (1 - progress);
        const currentRadius = s.maxRadius * (1 - progress * 0.5);

        if (s.life >= s.maxLife || currentOpacity <= 0) {
          spores.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(0.6, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 78, 59, ${currentOpacity * 0.75})`;
        ctx.fill();
      }
      ctx.restore();
    };

    // Draw Glowing Fireflies / Light Flies
    const drawFireflies = (time: number) => {
      ctx.save();
      firefliesRef.current.forEach((fly) => {
        fly.x += fly.vx + Math.sin(time * 1.5 + fly.pulseOffset) * 0.4;
        fly.y = fly.baseY + Math.cos(time * 1.2 + fly.pulseOffset) * 14;

        if (fly.x < -10) fly.x = width + 10;
        if (fly.x > width + 10) fly.x = -10;

        const pulse =
          0.3 +
          0.7 * Math.abs(Math.sin(time * fly.pulseSpeed + fly.pulseOffset));

        const gradient = ctx.createRadialGradient(
          fly.x,
          fly.y,
          0,
          fly.x,
          fly.y,
          fly.radius * 4
        );
        gradient.addColorStop(0, `rgba(167, 243, 208, ${0.45 * pulse})`);
        gradient.addColorStop(0.5, `rgba(52, 211, 153, ${0.2 * pulse})`);
        gradient.addColorStop(1, "rgba(6, 78, 59, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.radius * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * pulse})`;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    };

    // Draw Leaping Koi / Fish
    const drawFish = () => {
      const f = fishRef.current;
      if (!f.active) return;

      const p = f.progress;
      f.x = f.startX + (f.targetX - f.startX) * p;
      f.y = height - 6 - Math.sin(p * Math.PI) * f.peakHeight;

      const direction = f.targetX > f.startX ? 1 : -1;
      const angle = (p - 0.5) * Math.PI * 0.7 * direction;

      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(angle);
      ctx.scale(f.scale * direction, f.scale);

      ctx.fillStyle = "rgba(6, 78, 59, 0.85)";
      ctx.strokeStyle = "#064E3B";
      ctx.lineWidth = 1.3;

      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.bezierCurveTo(8, -7, -4, -6, -14, 0);
      ctx.bezierCurveTo(-4, 6, 8, 7, 14, 0);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(-22, -6);
      ctx.quadraticCurveTo(-19, 0, -22, 6);
      ctx.closePath();
      ctx.fillStyle = "rgba(6, 78, 59, 0.65)";
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(2, 2);
      ctx.lineTo(-3, 8);
      ctx.lineTo(6, 4);
      ctx.fillStyle = "rgba(6, 78, 59, 0.5)";
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(9, -2, 1.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Draw Water Splashes, Ripples & Apple Splash Droplets
    const drawRipplesAndSplashes = () => {
      ctx.save();

      // Ripples
      ripplesRef.current.forEach((r, idx) => {
        r.radius += 0.8;
        r.opacity *= 0.94;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(6, 78, 59, ${r.opacity})`;
        ctx.lineWidth = 1.2;
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();

        if (r.opacity < 0.02 || r.radius > r.maxRadius) {
          ripplesRef.current.splice(idx, 1);
        }
      });

      // Apple Water Splash Droplets
      const droplets = splashDropletsRef.current;
      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.life++;
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.16;
        const progress = d.life / d.maxLife;
        const currentOpacity = d.opacity * (1 - progress);

        if (d.life >= d.maxLife || currentOpacity <= 0) {
          droplets.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius * (1 - progress * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 78, 59, ${currentOpacity})`;
        ctx.fill();
      }

      ctx.restore();
    };

    // Draw Ambient Spores
    const drawSpores = (time: number) => {
      ctx.save();
      sporesRef.current.forEach((spore) => {
        spore.y -= spore.speedY;
        spore.x +=
          Math.sin(time * spore.swaySpeed + spore.swayOffset) * 0.5 +
          spore.speedX;

        if (spore.y < -10) spore.y = height + 10;
        if (spore.x < -10) spore.x = width + 10;
        if (spore.x > width + 10) spore.x = -10;

        ctx.beginPath();
        ctx.arc(spore.x, spore.y, spore.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 78, 59, ${spore.opacity})`;
        ctx.fill();
      });
      ctx.restore();
    };

    // Draw Bottom Pebbles
    const drawPebbles = () => {
      ctx.save();
      pebblesRef.current.forEach((peb) => {
        ctx.save();
        ctx.translate(peb.x, peb.y);
        ctx.rotate(peb.rotation);
        ctx.beginPath();
        ctx.ellipse(0, 0, peb.rx, peb.ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 78, 59, ${peb.opacity})`;
        ctx.strokeStyle = `rgba(6, 78, 59, ${peb.opacity + 0.08})`;
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
      ctx.restore();
    };

    // Draw Prominent Swaying Meadow Grass Blades
    const drawGrass = (time: number) => {
      ctx.save();
      ctx.lineCap = "round";

      grassRef.current.forEach((g) => {
        const sway =
          Math.sin(time * g.swaySpeed + g.swayOffset) * (g.height * 0.18);
        const midSway = sway * 0.45;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(6, 78, 59, ${g.opacity})`;
        ctx.lineWidth = g.width;
        ctx.moveTo(g.x, height);
        ctx.quadraticCurveTo(
          g.x + midSway + g.curve * 0.5,
          height - g.height * 0.55,
          g.x + sway + g.curve,
          height - g.height
        );
        ctx.stroke();
      });
      ctx.restore();
    };

    // Draw Wind Streamers
    const drawWind = () => {
      if (!isWindActiveRef.current) return;
      ctx.save();
      ctx.strokeStyle = "rgba(6, 78, 59, 0.6)";
      ctx.lineWidth = 1.3;

      windStreaksRef.current.forEach((p) => {
        p.x += p.speed;
        ctx.beginPath();
        ctx.globalAlpha = p.opacity;
        ctx.moveTo(p.x, p.y);
        ctx.bezierCurveTo(
          p.x + p.length * 0.4,
          p.y + p.curve,
          p.x + p.length * 0.8,
          p.y - p.curve,
          p.x + p.length,
          p.y
        );
        ctx.stroke();
      });

      ctx.restore();
    };

    // Mouse Move (Spore Trail Generation & Hover Detection)
    let lastSporeTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const now = performance.now();

      if (now - lastSporeTime > 40 && cursorSporesRef.current.length < 20) {
        lastSporeTime = now;
        cursorSporesRef.current.push({
          x: mouseX + (Math.random() - 0.5) * 6,
          y: mouseY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.4 - Math.random() * 0.5,
          radius: 1.0 + Math.random() * 1.2,
          maxRadius: 1.2 + Math.random() * 1.0,
          life: 0,
          maxLife: 22 + Math.floor(Math.random() * 12),
          maxOpacity: 0.5 + Math.random() * 0.25,
        });
      }

      let isHovering = false;

      // Check apple hover
      if (
        appleRef.current &&
        appleRef.current.isGrown &&
        !appleRef.current.isFallen &&
        !appleRef.current.isSplashed
      ) {
        if (
          Math.hypot(appleRef.current.x - mouseX, appleRef.current.y - mouseY) <
          40
        ) {
          isHovering = true;
        }
      }

      // Check leaf hover
      if (!isHovering) {
        for (const leaf of leavesRef.current) {
          if (!leaf.isFallen) {
            if (
              Math.hypot(leaf.x - mouseX, leaf.y - mouseY) <
              38 * leaf.scale
            ) {
              isHovering = true;
              break;
            }
          }
        }
      }

      canvas.style.cursor = isHovering ? "pointer" : "default";
    };

    // Click to pluck or splash
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Click near bottom to trigger fish jump splash
      if (clickY > height - 60 && !fishRef.current.active) {
        triggerFishJump();
      }

      // Apple click
      if (
        appleRef.current &&
        appleRef.current.isGrown &&
        !appleRef.current.isFallen &&
        !appleRef.current.isSplashed
      ) {
        if (
          Math.hypot(appleRef.current.x - clickX, appleRef.current.y - clickY) <
          40
        ) {
          appleRef.current.isFallen = true;
          appleRef.current.vy = 2.8;
          appleRef.current.vx = (Math.random() - 0.5) * 1.3;
          fallenCountRef.current += 2;
          if (fallenCountRef.current >= RESET_THRESHOLD)
            setTimeout(triggerWindGust, 500);
          return;
        }
      }

      // Leaf click
      for (const leaf of leavesRef.current) {
        if (!leaf.isFallen) {
          if (Math.hypot(leaf.x - clickX, leaf.y - clickY) < 38 * leaf.scale) {
            leaf.isFallen = true;
            leaf.vy = 1.3;
            leaf.vx = (Math.random() - 0.5) * 2.2;
            leaf.angularVelocity = (Math.random() - 0.5) * 0.08;
            fallenCountRef.current += 1;
            if (fallenCountRef.current >= RESET_THRESHOLD)
              setTimeout(triggerWindGust, 500);
            break;
          }
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    // Frame Loop
    let time = 0;
    const render = () => {
      time += 0.025;
      ctx.clearRect(0, 0, width, height);

      // Ambient Spores, Grass & Pebbles
      drawSpores(time);
      drawPebbles();
      drawGrass(time);
      drawFireflies(time);
      drawRipplesAndSplashes();
      drawFish();

      // Dynamic Cursor Spore Trail
      drawCursorSpores();

      drawWind();

      // Leaves Render & Physics
      leavesRef.current.forEach((leaf) => {
        if (!leaf.isFallen) {
          const sway =
            Math.sin(time * leaf.swaySpeed + leaf.swayOffset) * 0.12;
          leaf.angle = leaf.baseAngle + sway;
          leaf.x = leaf.stemX + Math.cos(leaf.angle) * leaf.stemLength;
          leaf.y = leaf.stemY + Math.sin(leaf.angle) * leaf.stemLength;
        } else if (leaf.y < height - 25) {
          leaf.vy = Math.min(leaf.vy + 0.035, 2.8);
          leaf.x += Math.sin(time * 2.4 + leaf.id) * 2.0 + leaf.vx;
          leaf.y += leaf.vy;
          leaf.angle += leaf.angularVelocity;
        }
        drawBotanicalLeaf(leaf);
      });

      // Apple Render & Physics (with bottom water splash & vanish)
      if (appleRef.current && appleRef.current.scale > 0.02) {
        const a = appleRef.current;
        if (!a.isFallen) {
          a.x = a.stemX + Math.sin(time * 1.1) * 1.5;
          a.y = a.stemY + 22 + Math.cos(time * 0.8) * 1.2;
          a.rotation = Math.sin(time * 1.1) * 0.05;
        } else if (!a.isSplashed) {
          a.vy += 0.14;
          a.y += a.vy;
          a.x += a.vx;
          a.rotation += 0.04;

          if (a.y >= height - 30) {
            triggerAppleSplash(a);
          }
        }
        drawBotanicalApple();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      clearInterval(ambientTimer);
      clearInterval(fishTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Faint Soft Botanical Branch Artwork (Faint watermark) */}
      <img
        src="/branch.png"
        alt="Botanical Branch"
        className="absolute top-12 sm:top-18 left-0 w-full sm:w-[98vw] lg:w-[95vw] max-h-[680px] lg:max-h-[760px] object-contain object-left-top opacity-16 mix-blend-multiply"
      />
      {/* 2. Interactive Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto cursor-default"
      />
    </div>
  );
};
