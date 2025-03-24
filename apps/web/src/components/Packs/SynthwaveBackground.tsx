"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function SynthwaveBackground() {
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x180b28, 5, 20);

        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 1, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(
            mountRef.current.clientWidth,
            mountRef.current.clientHeight
        );
        mountRef.current.appendChild(renderer.domElement);

        const directionalLight1 = new THREE.DirectionalLight(0x00aaff, 0.8);
        directionalLight1.position.set(0, 5, 5);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xff77ff, 0.4);
        directionalLight2.position.set(-5, 5, -5);
        scene.add(directionalLight2);

        const ambientLight = new THREE.AmbientLight(0xffaaff, 0.3);
        scene.add(ambientLight);

        const planeGeometry = new THREE.PlaneGeometry(50, 50, 50, 50);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0xff66cc,
            wireframe: true,
            opacity: 0.3,
            transparent: true,
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -1;
        scene.add(plane);

        const positions = planeGeometry.attributes.position.array;
        const originalPositions = new Float32Array(positions.length);
        for (let i = 0; i < positions.length; i++) {
            originalPositions[i] = positions[i];
        }

        let req: number;
        const animate = () => {
            req = requestAnimationFrame(animate);
            const time = performance.now() * 0.001;

            const cycleDuration = 300;
            const t = (time % cycleDuration) / cycleDuration;
            camera.position.z = 5 - 17.5 * (1 - Math.cos(2 * Math.PI * t));

            const amplitude = 0.2;
            const frequency = 1;
            const speed = 0.5;
            for (let i = 0; i < positions.length; i += 3) {
                const x = originalPositions[i];
                const y = originalPositions[i + 1];
                positions[i + 2] = amplitude * Math.sin(frequency * (x + y) + time * speed);
            }
            planeGeometry.attributes.position.needsUpdate = true;

            const neonBlue = new THREE.Color(0x00aaff);
            const neonPink = new THREE.Color(0xff66cc);
            const colorFactor = (Math.sin(time * 0.5) + 1) / 2;
            planeMaterial.color.lerpColors(neonBlue, neonPink, colorFactor);

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(req);
            renderer.dispose();
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                overflow: "hidden",
                zIndex: -1,
            }}
        />
    );
}
