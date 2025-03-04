import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Line, Html, TextureLoader } from "@react-three/drei";
import * as THREE from "three";

// Function to generate evenly spaced points on a sphere using Fibonacci Sphere method
function generateFibonacciSphere(count, radius) {
  const positions = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  for (let i = 0; i < count; i++) {
    const theta = 2 * Math.PI * i / goldenRatio;
    const phi = Math.acos(1 - 2 * (i + 0.5) / count);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    positions.push([x, y, z]);
  }

  return positions;
}

// Updated names for blue particles
const particleNames = [
  "AI", "Robotics", "Spatial Intelligence", "Computer Vision",
  "Drones IoT", "Security", "Cultural Heritage", "Safe School", "ION", "MIT MST"
];

// Create a radial gradient texture for blended aura
function createRadialGradientTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  const gradient = context.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

const auraTexture = createRadialGradientTexture();

function BlueParticles({ onPositionSave, onParticleClick }) {
  const count = 10;  // 10 blue particles
  const radius = 2;   // Radius for particle distribution

  const positions = useMemo(() => generateFibonacciSphere(count, radius), [count, radius]);

  return (
    <>
      {positions.map((pos, index) => {
        const name = particleNames[index];
        if (onPositionSave) onPositionSave(name, pos);  // Save particle positions
        return (
          <GlowingParticle 
            key={index} 
            position={pos} 
            name={name}  
            onClick={() => onParticleClick(name)}
          />
        );
      })}
    </>
  );
}

function GlowingParticle({ position, name, onClick }) {
  return (
    <group position={position} onClick={onClick}>
      <mesh>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial 
          color="#00ffff"               
          emissive="#00ffff"            
          emissiveIntensity={0.7}       
          roughness={0.1}               
          metalness={0.3}             
        />
      </mesh>

      {/* Blended Aura Effect */}
      <mesh>
        <sphereGeometry args={[0.2, 10, 10]} />  {/* Larger for aura */}
        <meshStandardMaterial 
          color="#00ffff" 
          transparent={true} 
          opacity={0.5}               // Start with half opacity
          alphaMap={auraTexture}      // Use gradient texture for smooth blending
          depthWrite={false}          // Prevent z-fighting
        />
      </mesh>

      <Html position={[0, 0.2, 0]} center>
        <div style={{
          color: 'white',
          // backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '2px 4px',
          borderRadius: '4px',
          fontSize: '10px',
          textAlign: 'center'
        }}>
          {name}
        </div>
      </Html>
    </group>
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
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshBasicMaterial color="#ff0000" />
      <Html position={[0, 0.3, 0]} center>
        <div style={{
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
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

// Connecting Line with 5px Thickness
function ConnectingLine({ start, end }) {
  const [progress, setProgress] = useState(0);

  useFrame(() => {
    if (progress < 1) {
      setProgress(progress + 0.01);
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
      points={points}    // Define start and end points
      color="white"       // Line color
      lineWidth={5}       // Line width increased to 5px
      transparent={true}
    />
  );
}

function App() {
  const [positions, setPositions] = useState({});
  const [lines, setLines] = useState([]);

  const savePosition = (name, pos) => {
    setPositions((prev) => ({ ...prev, [name]: pos }));
  };

  const handleDTClick = () => {
    if (positions["AI"]) {
      setLines((prev) => [...prev, { start: [0, 0, 0], end: positions["AI"] }]);
    }
  };

  const handleParticleClick = (name) => {
    if (name === "AI" && positions["Spatial Intelligence"]) {
      setLines((prev) => [
        ...prev,
        { start: positions["AI"], end: positions["Spatial Intelligence"] }
      ]);
    } else if (name === "Spatial Intelligence" && positions["ION"]) {
      setLines((prev) => [
        ...prev,
        { start: positions["Spatial Intelligence"], end: positions["ION"] }
      ]);
    }
  };

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      style={{ height: "100vh", background: "black" }}
    >
      <ambientLight intensity={0.5} />
      <OrbitControls enableZoom={true} />
      <RedCenterParticle onClick={handleDTClick} />
      <BlueParticles onPositionSave={savePosition} onParticleClick={handleParticleClick} />
      {lines.map((line, index) => (
        <ConnectingLine key={index} start={line.start} end={line.end} />
      ))}
    </Canvas>
  );
}

export default App;
