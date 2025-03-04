import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import './index.css';

// Function to generate evenly spaced points on a sphere using Fibonacci Sphere method
function generateFibonacciSphere(count, radius) {
  const positions = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  for (let i = 0; i < count; i++) {
    const theta = (2 * Math.PI * i) / goldenRatio;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    positions.push([x, y, z]);
  }

  return positions;
}

// Particle names
const particleNames = [
  "AI", "Robotics", "Spatial Intelligence", "Computer Vision",
  "Drones IoT", "Security", "Cultural Heritage", "Safe School", "ION", "MIT MST"
];

function GlowingParticle({ position, name, onClick, isConnected }) {
  const auraRef = useRef();

  useFrame(({ clock }) => {
    if (auraRef.current) {
      const opacity = 0.15 + 0.1 * Math.sin(clock.getElapsedTime() * 1.5);
      auraRef.current.material.opacity = opacity;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      {/* Core Sphere */}
      <mesh>
        <sphereGeometry args={[0.12, 64, 64]} />
        <meshStandardMaterial 
          color={isConnected ? "#00ffff" : "#004444"}  
          emissive={isConnected ? "#00ffff" : "#002222"}  
          emissiveIntensity={isConnected ? 1.2 : 0.3} 
          roughness={0.05}    
          metalness={0.5}          
        />
      </mesh>

      {/* Blended Aura Effect */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[0.25, 64, 64]} />
        <meshStandardMaterial 
          color="#00ffff" 
          transparent={true} 
          opacity={0.15}  
          depthWrite={false}      
          emissive={isConnected ? "#00ffff" : "#002222"}
          emissiveIntensity={isConnected ? 1.0 : 0.3} 
        />
      </mesh>

      {/* Label */}
      <Html position={[0, 0.22, 0]} center>
        <div style={{
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '20px',
          textAlign: 'center'
        }}>
          {name}
        </div>
      </Html>
    </group>
  );
}

function BlueParticles({ onPositionSave, onParticleClick, connectedParticles }) {
  const count = 10;
  const radius = 2.5;
  const positions = useMemo(() => generateFibonacciSphere(count, radius), [count, radius]);

  return (
    <>
      {positions.map((pos, index) => {
        const name = particleNames[index];
        if (onPositionSave) onPositionSave(name, pos);
        return (
          <GlowingParticle 
            key={index} 
            position={pos} 
            name={name} 
            onClick={() => onParticleClick(name)} 
            isConnected={connectedParticles.has(name)} 
          />
        );
      })}
    </>
  );
}

function RedCenterParticle({ onClick }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (ref.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
      ref.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]} onClick={onClick}>
      <sphereGeometry args={[0.2, 64, 64]} />
      <meshBasicMaterial color="#ff0000" />
      <Html position={[0, 0.3, 0]} center>
        <div style={{
          color: 'white',
          padding: '2px 4px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          DT
        </div>
      </Html>
    </mesh>
  );
}

function ConnectingLine({ start, end }) {
  const [progress, setProgress] = useState(0); // Track drawing progress

  useFrame(() => {
    if (progress < 1) {
      setProgress((prev) => Math.min(prev + 0.02, 1)); // Smooth interpolation
    }
  });

  const points = useMemo(() => {
    if (!start || !end) return [];
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const interpolatedVec = new THREE.Vector3().lerpVectors(startVec, endVec, progress);
    return [startVec, interpolatedVec];
  }, [start, end, progress]);

  if (points.length === 0) return null;

  return (
    <Line
      points={points}
      color="white"
      lineWidth={2}
      transparent={true}
    />
  );
}


function App() {
  const [positions, setPositions] = useState({});
  const [lines, setLines] = useState([]);
  const [connectedParticles, setConnectedParticles] = useState(new Set()); 

  const savePosition = (name, pos) => {
    setPositions((prev) => ({ ...prev, [name]: pos }));
  };

  const handleDTClick = () => {
    if (positions["AI"]) {
      setLines((prev) => [...prev, { start: [0, 0, 0], end: positions["AI"] }]);
      setConnectedParticles(new Set(["DT", "AI"])); 
    }
  };

  const handleParticleClick = (name) => {
    let newConnections = new Set(connectedParticles);
    
    if (name === "AI" && positions["Spatial Intelligence"]) {
      setLines((prev) => [
        ...prev,
        { start: positions["AI"], end: positions["Spatial Intelligence"] }
      ]);
      newConnections.add("AI");
      newConnections.add("Spatial Intelligence");
    } else if (name === "Spatial Intelligence" && positions["ION"]) {
      setLines((prev) => [
        ...prev,
        { start: positions["Spatial Intelligence"], end: positions["ION"] }
      ]);
      newConnections.add("Spatial Intelligence");
      newConnections.add("ION");
    }

    setConnectedParticles(newConnections);
  };

  return (
    <div className="bkgd">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }} style={{ height: "100vh" }}>
        <ambientLight intensity={0.5} />
        <OrbitControls enableZoom={true} />
        <RedCenterParticle onClick={handleDTClick} />
        <BlueParticles 
          onPositionSave={savePosition} 
          onParticleClick={handleParticleClick} 
          connectedParticles={connectedParticles} 
        />
        {lines.map((line, index) => (
          <ConnectingLine key={index} start={line.start} end={line.end} />
        ))}
      </Canvas>      
    </div>
  );
}

export default App;
