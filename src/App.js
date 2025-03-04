import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import './index.css';

// Function to generate Fibonacci Sphere positions
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
      {/* Core Sphere with Shadows */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.12, 64, 64]} />
        <meshStandardMaterial 
          color={isConnected ? "#10adad" : "#004444"}  
          emissive={isConnected ? "#10adad" : "#002222"}  
          emissiveIntensity={isConnected ? 1.2 : 1.5} 
          roughness={0.3}    
          metalness={0.8}          
        />
      </mesh>

      {/* Aura Effect */}
      <mesh ref={auraRef} receiveShadow>
        <sphereGeometry args={[0.25, 64, 64]} />
        <meshStandardMaterial 
          color="#10adad" 
          transparent={true} 
          opacity={0.55}  
          depthWrite={false}      
          emissive={isConnected ? "#10adad" : "#002222"}
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
          textAlign: 'center',
          transform: 'translateY(-25px)'
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
      <meshStandardMaterial 
          color={ "#004444"}  
          emissive={ "#2352a8"}  
          emissiveIntensity={1.5} 
          roughness={0.3}    
          metalness={0.8}          
        />
      <Html position={[0, 0.3, 0]} center>
        <div style={{
          color: 'white',
          padding: '2px 4px',
          borderRadius: '4px',
          fontSize: '12px',
          transform: 'translateY(-25px)'
        }}>
          DT
        </div>
      </Html>
    </mesh>
  );
}

function ConnectingLine({ start, end }) {
  const [progress, setProgress] = useState(0); 

  useFrame(() => {
    if (progress < 1) {
      setProgress((prev) => Math.min(prev + 0.02, 1)); 
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

function RotatingScene({ children }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0008; // Slow rotation
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

function App() {
  const [positions, setPositions] = useState({});
  const [lines, setLines] = useState([]);
  const [connectedParticles, setConnectedParticles] = useState(new Set());
  const [message, setMessage] = useState(""); 
  const [activeMessage, setActiveMessage] = useState(null); // Message field tracking

  const savePosition = (name, pos) => {
    setPositions((prev) => ({ ...prev, [name]: pos }));
  };

  const handleDTClick = () => {
    if (positions["AI"]) {
      setLines((prev) => [...prev, { start: [0, 0, 0], end: positions["AI"] }]);
      setConnectedParticles(new Set(["DT", "AI"]));
      setActiveMessage({ name: "AI", position: positions["AI"] }); // Show message on AI
    }
  };

  const handleParticleClick = (name) => {
    let newConnections = new Set(connectedParticles);
    let nextParticle = null;

    if (name === "AI" && positions["Spatial Intelligence"]) {
      nextParticle = "Spatial Intelligence";
      setLines((prev) => [
        ...prev,
        { start: positions["AI"], end: positions[nextParticle] }
      ]);
    } else if (name === "Spatial Intelligence" && positions["ION"]) {
      nextParticle = "ION";
      setLines((prev) => [
        ...prev,
        { start: positions["Spatial Intelligence"], end: positions[nextParticle] }
      ]);
    }

    if (nextParticle) {
      newConnections.add(name);
      newConnections.add(nextParticle);
      setActiveMessage({ name: nextParticle, position: positions[nextParticle] }); // Show message on the next particle
    }

    setConnectedParticles(newConnections);
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    console.log(`Message for ${activeMessage.name}:`, message);
    setMessage(""); 
    setActiveMessage(null);
  };

  return (
    <div className="bkgd">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }} style={{ height: "100vh" }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 3, 4]} intensity={1} castShadow />
        <OrbitControls enableZoom={true} />

        <RotatingScene>
          <RedCenterParticle onClick={handleDTClick} />

          <BlueParticles 
            onPositionSave={savePosition} 
            onParticleClick={handleParticleClick} 
            connectedParticles={connectedParticles} 
          />

          {lines.map((line, index) => (
            <ConnectingLine key={index} start={line.start} end={line.end} />
          ))}

{activeMessage && (
  <Html 
    key={activeMessage.name}  // 🔥 Forces re-render on each new message
    position={[
      activeMessage.position[0], 
      activeMessage.position[1] + 0.3, 
      activeMessage.position[2]
    ]} 
    center
  >
    <div 
      style={{
        width: "200px",
        background: "rgba(0, 0, 0, 0.7)",
        padding: "8px",
        borderRadius: "5px",
        color: "white",
        textAlign: "center",
        fontSize: "14px",
        maxWidth: "200px",
        opacity: 0,  // Start hidden
        animation: "fadeIn 0.6s ease-in-out forwards"  // 🔥 Smooth fade-in animation
      }}
    >
      <p>Lorem ipsum blah blah blah blah blah blah blah blah blah</p>
      <a href="http://www.google.com" style={{
        color: "#00ffff",
        textDecoration: "underline",
        cursor: "pointer",
        fontWeight: "bold"
      }}>
        Link
      </a>
    </div>
  </Html>
)}



        </RotatingScene>
      </Canvas>      
    </div>
  );
}
// http://www.google.com


export default App;



// http://www.google.com
