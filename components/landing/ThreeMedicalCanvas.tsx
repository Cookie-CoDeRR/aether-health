"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeMedicalCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 28;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Dynamic Medical Node & Particle Network (Floating Helix / Web)
    const nodeCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(nodeCount * 3);
    const initialPositions: { x: number; y: number; z: number; speed: number }[] = [];

    const colors = new Float32Array(nodeCount * 3);
    const tealColor = new THREE.Color("#4F9D8C");
    const coralColor = new THREE.Color("#E8674A");
    const cyanColor = new THREE.Color("#00F0FF");

    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 45;
      const y = (Math.random() - 0.5) * 45;
      const z = (Math.random() - 0.5) * 25;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      initialPositions.push({
        x,
        y,
        z,
        speed: 0.5 + Math.random() * 1.5,
      });

      const rand = Math.random();
      const c = rand > 0.6 ? coralColor : rand > 0.3 ? tealColor : cyanColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Circular canvas texture for smooth particle spheres
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.8)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(32, 32, 32, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.65,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      depthTest: false,
      blending: THREE.NormalBlending, // Normal blending works on both dark & light mode!
    });

    const particleSystem = new THREE.Points(geometry, particleMaterial);
    scene.add(particleSystem);

    // 4. Floating 3D Geometric Medical Icosahedron Mesh
    const wireGeo = new THREE.IcosahedronGeometry(13, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x4f9d8c,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // Outer accent ring
    const ringGeo = new THREE.TorusGeometry(18, 0.08, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xe8674a,
      transparent: true,
      opacity: 0.25,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    scene.add(ringMesh);

    // 5. Interactive Mouse Parallax Tracking
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 6. Smooth Fluid Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotate particle network & mesh smoothly
      particleSystem.rotation.y = elapsedTime * 0.03 + mouseX * 0.1;
      particleSystem.rotation.x = elapsedTime * 0.015 + mouseY * 0.1;

      wireMesh.rotation.y = -elapsedTime * 0.04 + mouseX * 0.15;
      wireMesh.rotation.z = elapsedTime * 0.02;

      ringMesh.rotation.z = elapsedTime * 0.05;
      ringMesh.rotation.y = elapsedTime * 0.02 + mouseX * 0.2;

      // Animate individual nodes floating up/down in sinus waves
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < nodeCount; i++) {
        const init = initialPositions[i];
        posArray[i * 3 + 1] = init.y + Math.sin(elapsedTime * init.speed + i) * 1.2;
        posArray[i * 3] = init.x + Math.cos(elapsedTime * 0.5 + i) * 0.6;
      }
      posAttr.needsUpdate = true;

      // Smooth camera motion
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      particleMaterial.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-80 transition-opacity duration-500"
    />
  );
}
