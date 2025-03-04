// SolarSystem.jsx
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Stars, Line } from '@react-three/drei';

const Planet = ({ distance, size, color, speed, setPlanetPositions, index, frozen, stoppedTime }) => {
  const planetRef = useRef();
  const [offsetTime, setOffsetTime] = useState(0);

  useFrame(({ clock }) => {
    const currentTime = clock.getElapsedTime();

    if (frozen) {
      if (stoppedTime !== null && offsetTime === 0) {
        setOffsetTime(stoppedTime); // Store the time when the planet was stopped
      }
      return; // Stop movement if planet is frozen
    } else if (offsetTime !== 0) {
      setOffsetTime(0); // Reset offset time when unfrozen
    }

    // Calculate position based on adjusted time
    const elapsed = currentTime - offsetTime;
    const x = Math.cos(elapsed * speed) * distance;
    const y = Math.sin(elapsed * speed) * distance;
    planetRef.current.position.set(x, y, 0);
    planetRef.current.rotation.y += 0.01;

    // Save current position for distance calculation
    setPlanetPositions((prev) => {
      const newPositions = [...prev];
      newPositions[index] = { x, y, z: 0 };
      return newPositions;
    });
  });

  return (
    <Sphere ref={planetRef} args={[size, 32, 32]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        metalness={0.5}
        roughness={0.2}
      />
    </Sphere>
  );
};

const OrbitRing = ({ distance }) => {
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push([Math.cos(angle) * distance, Math.sin(angle) * distance, 0]);
  }

  return (
    <line>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array(points.flat())}
          count={points.length}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="gray" />
    </line>
  );
};

const Sun = ({ onClick }) => {
  const sunRef = useRef();

  useFrame(() => {
    sunRef.current.rotation.y += 0.005;
  });

  return (
    <Sphere
      ref={sunRef}
      args={[2, 64, 64]}
      onClick={onClick}
    >
      <MeshDistortMaterial
        color="orange"
        attach="material"
        distort={0.2}
        speed={2}
        emissive="orange"
        emissiveIntensity={1}
      />
    </Sphere>
  );
};

const ConnectingLine = ({ start, end }) => {
  if (!start || !end) return null;
  const points = [
    [start.x, start.y, start.z],
    [end.x, end.y, end.z],
  ];
  return <Line points={points} color="yellow" lineWidth={2} />;
};

const SolarSystem = () => {
  const [planetPositions, setPlanetPositions] = useState(Array(4).fill(null));
  const [lineEndpoints, setLineEndpoints] = useState({ start: null, end: null });
  const [frozenPlanetIndex, setFrozenPlanetIndex] = useState(null);
  const [lineActive, setLineActive] = useState(false);
  const [stoppedTimes, setStoppedTimes] = useState(Array(4).fill(null));

  const handleSunClick = (event) => {
    const currentTime = event.timeStamp / 1000; // Get current time in seconds

    if (lineActive) {
      // Remove line and unfreeze planet
      setLineEndpoints({ start: null, end: null });
      setStoppedTimes((prev) => {
        const newTimes = [...prev];
        newTimes[frozenPlanetIndex] = currentTime; // Store the time when unfrozen
        return newTimes;
      });
      setFrozenPlanetIndex(null);
      setLineActive(false);
    } else {
      // Find nearest planet and connect
      if (planetPositions.some((pos) => pos === null)) return;

      const sunPosition = { x: 0, y: 0, z: 0 };
      let nearestPlanet = null;
      let shortestDistance = Infinity;
      let nearestIndex = -1;

      planetPositions.forEach((planetPos, index) => {
        const distance = Math.sqrt(
          Math.pow(planetPos.x - sunPosition.x, 2) +
          Math.pow(planetPos.y - sunPosition.y, 2)
        );

        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestPlanet = planetPos;
          nearestIndex = index;
        }
      });

      setLineEndpoints({ start: sunPosition, end: nearestPlanet });
      setFrozenPlanetIndex(nearestIndex);
      setStoppedTimes((prev) => {
        const newTimes = [...prev];
        newTimes[nearestIndex] = currentTime; // Store the time when frozen
        return newTimes;
      });
      setLineActive(true);
    }
  };

  return (
    <Canvas camera={{ position: [0, 0, 30], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={2.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} fade />

      <Sun onClick={handleSunClick} />

      {/* Orbits */}
      <OrbitRing distance={5} />
      <OrbitRing distance={8} />
      <OrbitRing distance={12} />
      <OrbitRing distance={16} />

      {/* Planets */}
      {[5, 8, 12, 16].map((distance, index) => (
        <Planet
          key={index}
          distance={distance}
          size={index * 0.3 + 0.5}
          color={["blue", "red", "green", "purple"][index]}
          speed={[0.5, 0.3, 0.2, 0.15][index]}
          setPlanetPositions={setPlanetPositions}
          index={index}
          frozen={frozenPlanetIndex === index}
          stoppedTime={stoppedTimes[index]}
        />
      ))}

      {/* Connecting Line */}
      <ConnectingLine start={lineEndpoints.start} end={lineEndpoints.end} />

      <OrbitControls enableZoom={true} enableRotate={false} />
    </Canvas>
  );
};

export default SolarSystem;
