'use client';
import React, { useEffect, useRef, useState } from 'react';

import * as THREE from 'three';

export function SynthwaveBackground() {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        // Clear any previous state
        while (mount.firstChild) {
            mount.removeChild(mount.firstChild);
        }

        // Setup scene
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x180b28, 5, 20);

        const camera = new THREE.PerspectiveCamera(
            75,
            mount.clientWidth / mount.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 1, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);

        // Force component to recognize initialization is complete
        setHasInitialized(true);

        // Setup lights
        const directionalLight1 = new THREE.DirectionalLight(0x00aaff, 0.8);
        directionalLight1.position.set(0, 5, 5);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xff77ff, 0.4);
        directionalLight2.position.set(-5, 5, -5);
        scene.add(directionalLight2);

        const ambientLight = new THREE.AmbientLight(0xffaaff, 0.3);
        scene.add(ambientLight);

        // Grid plane
        const planeGeometry = new THREE.PlaneGeometry(50, 50, 50, 50);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0xff66cc,
            wireframe: true,
            opacity: 0.3,
            transparent: true
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -1;
        scene.add(plane);

        // Store original positions for animation
        const positions = planeGeometry.attributes.position.array;
        const originalPositions = new Float32Array(positions.length);
        for (let i = 0; i < positions.length; i++) {
            originalPositions[i] = positions[i];
        }

        // Force initial render before animation starts
        renderer.render(scene, camera);

        // Animation loop
        let req: number;
        let lastTime = performance.now();

        const animate = () => {
            req = requestAnimationFrame(animate);
            const time = performance.now() * 0.001;
            const deltaTime = time - lastTime;
            lastTime = time;

            const cycleDuration = 300;
            const t = (time % cycleDuration) / cycleDuration;
            camera.position.z = 5 - 17.5 * (1 - Math.cos(2 * Math.PI * t));

            const amplitude = 0.2;
            const frequency = 1;
            const speed = 0.5;
            for (let i = 0; i < positions.length; i += 3) {
                const x = originalPositions[i] ?? 0;
                const y = originalPositions[i + 1] ?? 0;
                positions[i + 2] =
                    amplitude * Math.sin(frequency * (x + y) + time * speed);
            }
            planeGeometry.attributes.position.needsUpdate = true;

            const neonBlue = new THREE.Color(0x00aaff);
            const neonPink = new THREE.Color(0xff66cc);
            const colorFactor = (Math.sin(time * 0.5) + 1) / 2;
            planeMaterial.color.lerpColors(neonBlue, neonPink, colorFactor);

            renderer.render(scene, camera);
        };

        // Start animation immediately
        animate();

        // Ensure resize is handled
        const handleResize = () => {
            if (!mountRef.current) return;
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        // Clean up
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(req);
            renderer.dispose();
            mount.removeChild(renderer.domElement);
        };
    }, []); // Empty dependency array to run once on mount

    return (
        <div
            ref={mountRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                overflow: 'hidden',
                zIndex: -1
            }}
        />
    );
}
