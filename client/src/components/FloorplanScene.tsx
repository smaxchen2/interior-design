/**
 * FloorplanScene - Three.js 3D 場景組件
 * 精確還原平面圖的牆體、地板、門洞、家具
 * 設計風格：現代簡約 + 北歐風
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';
import {
  walls, rooms, doors, originalFurniture, optimizedFurniture,
  FLOOR_WIDTH, FLOOR_DEPTH,
  colorScheme, roomCameraPresets,
  type Wall as WallType, type Furniture as FurnitureType, type Door as DoorType
} from '@/lib/floorplanData';

// 毫米轉 Three.js 單位（1:100）
const S = 0.01;

/* ─── Wall with door cutouts ─── */
function WallMesh({ wall }: { wall: WallType }) {
  const dx = wall.end[0] - wall.start[0];
  const dz = wall.end[1] - wall.start[1];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);
  const cx = (wall.start[0] + wall.end[0]) / 2 * S;
  const cz = (wall.start[1] + wall.end[1]) / 2 * S;
  const h = wall.height * S;
  const t = wall.thickness * S;

  // Check if any door intersects this wall
  const wallDoors = doors.filter(door => {
    const px = door.position[0];
    const pz = door.position[1];
    // Check if door position is on this wall segment
    if (wall.start[0] === wall.end[0]) {
      // Vertical wall
      return Math.abs(px - wall.start[0]) < 200 &&
        pz >= Math.min(wall.start[1], wall.end[1]) &&
        pz <= Math.max(wall.start[1], wall.end[1]);
    } else if (wall.start[1] === wall.end[1]) {
      // Horizontal wall
      return Math.abs(pz - wall.start[1]) < 200 &&
        px >= Math.min(wall.start[0], wall.end[0]) &&
        px <= Math.max(wall.start[0], wall.end[0]);
    }
    return false;
  });

  if (wall.hasWindow) {
    const sill = (wall.windowSill || 900) * S;
    const wh = (wall.windowHeight || 1500) * S;
    const lS = length * S;
    return (
      <group position={[cx, 0, cz]} rotation={[0, -angle, 0]}>
        {/* Below window */}
        <mesh position={[0, sill / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[lS, sill, t]} />
          <meshStandardMaterial color={colorScheme.wall} roughness={0.85} />
        </mesh>
        {/* Above window */}
        <mesh position={[0, sill + wh + (h - sill - wh) / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[lS, h - sill - wh, t]} />
          <meshStandardMaterial color={colorScheme.wall} roughness={0.85} />
        </mesh>
        {/* Window glass */}
        <mesh position={[0, sill + wh / 2, 0]}>
          <boxGeometry args={[lS * 0.85, wh * 0.9, 0.03]} />
          <meshPhysicalMaterial color="#c8dce8" transparent opacity={0.25} roughness={0.05} metalness={0.1} />
        </mesh>
        {/* Window frame */}
        <mesh position={[0, sill + wh / 2, 0]}>
          <boxGeometry args={[lS * 0.88, wh * 0.93, 0.06]} />
          <meshStandardMaterial color="#d8d8d8" roughness={0.3} metalness={0.4} wireframe={false} />
        </mesh>
      </group>
    );
  }

  // Wall with door cutouts
  if (wallDoors.length > 0) {
    const doorHeight = 2100 * S;
    const segments: React.ReactNode[] = [];

    // Sort doors by position along wall
    const isHorizontal = wall.start[1] === wall.end[1];
    const wallStart = isHorizontal ? Math.min(wall.start[0], wall.end[0]) : Math.min(wall.start[1], wall.end[1]);

    wallDoors.forEach((door, idx) => {
      const doorPos = isHorizontal ? door.position[0] : door.position[1];
      const doorHalfW = door.width / 2;
      const doorStartLocal = (doorPos - doorHalfW - wallStart) * S;
      const doorEndLocal = (doorPos + doorHalfW - wallStart) * S;
      const lS = length * S;

      // Left segment of wall (before door)
      if (doorStartLocal > 0.01) {
        const segLen = doorStartLocal;
        segments.push(
          <mesh key={`left-${idx}`} position={[(-lS / 2 + segLen / 2), h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[segLen, h, t]} />
            <meshStandardMaterial color={colorScheme.wall} roughness={0.85} />
          </mesh>
        );
      }

      // Above door
      if (h > doorHeight) {
        const segLen = (doorEndLocal - doorStartLocal);
        segments.push(
          <mesh key={`above-${idx}`} position={[(-lS / 2 + (doorStartLocal + doorEndLocal) / 2), doorHeight + (h - doorHeight) / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[segLen, h - doorHeight, t]} />
            <meshStandardMaterial color={colorScheme.wall} roughness={0.85} />
          </mesh>
        );
      }

      // Right segment (after door to end or next door)
      if (idx === wallDoors.length - 1 && doorEndLocal < lS - 0.01) {
        const segLen = lS - doorEndLocal;
        segments.push(
          <mesh key={`right-${idx}`} position={[(-lS / 2 + doorEndLocal + segLen / 2), h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[segLen, h, t]} />
            <meshStandardMaterial color={colorScheme.wall} roughness={0.85} />
          </mesh>
        );
      }
    });

    return (
      <group position={[cx, 0, cz]} rotation={[0, -angle, 0]}>
        {segments}
      </group>
    );
  }

  return (
    <mesh position={[cx, h / 2, cz]} rotation={[0, -angle, 0]} castShadow receiveShadow>
      <boxGeometry args={[length * S, h, t]} />
      <meshStandardMaterial color={colorScheme.wall} roughness={0.85} />
    </mesh>
  );
}

/* ─── Door Frame ─── */
function DoorMesh({ door }: { door: DoorType }) {
  const x = door.position[0] * S;
  const z = door.position[1] * S;
  const w = door.width * S;
  const doorH = 2100 * S;
  const frameT = 0.04;

  return (
    <group position={[x, 0, z]}>
      {/* Door frame top */}
      <mesh position={[0, doorH, 0]}>
        <boxGeometry args={[w + 0.1, frameT, frameT]} />
        <meshStandardMaterial color="#c0b8a8" roughness={0.5} />
      </mesh>
      {/* Door frame left */}
      <mesh position={[-w / 2, doorH / 2, 0]}>
        <boxGeometry args={[frameT, doorH, frameT]} />
        <meshStandardMaterial color="#c0b8a8" roughness={0.5} />
      </mesh>
      {/* Door frame right */}
      <mesh position={[w / 2, doorH / 2, 0]}>
        <boxGeometry args={[frameT, doorH, frameT]} />
        <meshStandardMaterial color="#c0b8a8" roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ─── Room Floor Panels ─── */
function RoomFloors() {
  const floorPanels = [
    // 主臥 104 - 淺木色
    { pos: [3900, 0.005, 1400], size: [3800, 2600], color: '#d9c4a0' },
    // 客廳 102 - 暖木色
    { pos: [2000, 0.005, 4000], size: [3600, 2200], color: '#d4b896' },
    // 餐廚 103 - 稍淺
    { pos: [4800, 0.005, 4000], size: [2200, 2200], color: '#dcc8a8' },
    // 次臥 105 - 暖木色
    { pos: [1800, 0.005, 6000], size: [3400, 1400], color: '#d4b896' },
    // 陽台 106 - 灰色
    { pos: [7600, 0.005, 4000], size: [3000, 2200], color: '#c8c0b4' },
    // 玄關 101 - 深色
    { pos: [600, 0.005, 4800], size: [1000, 1000], color: '#c0b8a0' },
    // 衛浴 - 白色
    { pos: [900, 0.005, 400], size: [1600, 600], color: '#e8e4e0' },
  ];

  return (
    <>
      {floorPanels.map((panel, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[panel.pos[0] * S, panel.pos[1], panel.pos[2] * S]} receiveShadow>
          <planeGeometry args={[panel.size[0] * S, panel.size[1] * S]} />
          <meshStandardMaterial color={panel.color} roughness={0.75} />
        </mesh>
      ))}
    </>
  );
}

/* ─── Furniture ─── */
function FurnitureMesh({ item, showLabel }: { item: FurnitureType; showLabel: boolean }) {
  const [hovered, setHovered] = useState(false);
  const x = item.position[0] * S;
  const z = item.position[1] * S;
  const w = item.size[0] * S;
  const d = item.size[1] * S;
  const h = item.height * S;

  // Determine material properties based on furniture type
  const isBed = item.name.includes('Bed');
  const isWardrobe = item.name.includes('Wardrobe');
  const isTV = item.name.includes('TV') && !item.name.includes('Cabinet');
  const isRug = item.name.includes('Rug');

  const getMaterial = () => {
    if (isRug) return { color: hovered ? '#d0c8b8' : item.color, roughness: 0.95, metalness: 0 };
    if (isTV) return { color: hovered ? '#333' : item.color, roughness: 0.1, metalness: 0.8 };
    if (isBed) return { color: hovered ? '#e8e0d8' : item.color, roughness: 0.9, metalness: 0 };
    if (isWardrobe) return { color: hovered ? '#d8d0c4' : item.color, roughness: 0.6, metalness: 0.05 };
    return { color: hovered ? '#a8c4d8' : item.color, roughness: 0.7, metalness: 0.05 };
  };

  const mat = getMaterial();

  return (
    <group position={[x, 0, z]}>
      {/* Main body */}
      <mesh
        position={[0, h / 2, 0]}
        castShadow
        receiveShadow
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          {...mat}
          emissive={item.isOptimized ? '#1a4a1a' : '#000000'}
          emissiveIntensity={item.isOptimized ? 0.12 : 0}
        />
      </mesh>

      {/* Bed pillow detail */}
      {isBed && (
        <mesh position={[0, h + 0.3, -d / 2 + 2]} castShadow>
          <boxGeometry args={[w * 0.85, 0.6, 3]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
      )}

      {/* Label */}
      {(showLabel || hovered) && (
        <Html
          position={[0, h + 1, 0]}
          center
          occlude style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
        >
          <div style={{
            background: item.isOptimized ? 'rgba(34,120,34,0.9)' : 'rgba(60,60,60,0.88)',
            color: '#fff',
            padding: '3px 10px',
            borderRadius: '5px',
            fontSize: '11px',
            fontFamily: "'Noto Sans TC', sans-serif",
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            {item.nameCN}
          </div>
        </Html>
      )}

      {/* Optimized highlight ring */}
      {item.isOptimized && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(w, d) / 2 + 0.3, Math.max(w, d) / 2 + 0.5, 32]} />
          <meshStandardMaterial color="#4a9a4a" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/* ─── Base Floor ─── */
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[FLOOR_WIDTH / 2 * S, -0.02, FLOOR_DEPTH / 2 * S]} receiveShadow>
      <planeGeometry args={[FLOOR_WIDTH * S + 2, FLOOR_DEPTH * S + 2]} />
      <meshStandardMaterial color="#e8e0d4" roughness={0.9} />
    </mesh>
  );
}

/* ─── Room Labels ─── */
function RoomLabels() {
  return (
    <>
      {rooms.map(room => (
        <Html
          key={room.id}
          position={[room.center[0] * S, 0.3, room.center[1] * S]}
          center
          occlude style={{ pointerEvents: 'none' }}
        >
          <div style={{
            color: '#777',
            fontSize: '13px',
            fontFamily: "'Noto Sans TC', sans-serif",
            fontWeight: 600,
            textShadow: '0 0 6px rgba(255,255,255,0.9)',
            letterSpacing: '0.5px',
          }}>
            {room.nameCN}
          </div>
        </Html>
      ))}
    </>
  );
}

/* ─── Camera Controller ─── */
function CameraController({ activeRoom }: { activeRoom: string }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const preset = roomCameraPresets[activeRoom] || roomCameraPresets.overview;

  useEffect(() => {
    const pos = preset.position.map(v => v * S);
    const tgt = preset.target.map(v => v * S);
    camera.position.set(pos[0], pos[1], pos[2]);
    camera.lookAt(tgt[0], tgt[1], tgt[2]);
    if (controlsRef.current) {
      controlsRef.current.target.set(tgt[0], tgt[1], tgt[2]);
      controlsRef.current.update();
    }
  }, [activeRoom, camera, preset]);

  return (
  <OrbitControls
    ref={controlsRef}
    enableDamping
    dampingFactor={0.05}
    minDistance={3}
    maxDistance={150}
    enableRotate={true}
    enableZoom={true}
    enablePan={true}
    rotateSpeed={0.8}
    zoomSpeed={1.2}
    panSpeed={0.8}
    maxPolarAngle={Math.PI / 1.8}
    minPolarAngle={0.1}
    />
  );
}

/* ─── Ceiling Grid (subtle) ─── */
function Ceiling() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[FLOOR_WIDTH / 2 * S, 27 * S, FLOOR_DEPTH / 2 * S]}>
      <planeGeometry args={[FLOOR_WIDTH * S, FLOOR_DEPTH * S]} />
      <meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.4} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ─── Main Scene ─── */
function Scene({ showOptimized, showLabels, activeRoom }: { showOptimized: boolean; showLabels: boolean; activeRoom: string }) {
  const furniture = showOptimized ? optimizedFurniture : originalFurniture;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[40, 60, 30]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <directionalLight position={[-20, 30, -15]} intensity={0.25} />
      <hemisphereLight args={['#e8e4f0', '#d4b896', 0.35]} />

      {/* Ground & Floors */}
      <Floor />
      <RoomFloors />

      {/* Walls */}
      {walls.map(wall => (
        <WallMesh key={wall.id} wall={wall} />
      ))}

      {/* Doors */}
      {doors.map(door => (
        <DoorMesh key={door.id} door={door} />
      ))}

      {/* Furniture */}
      {furniture.map(item => (
        <FurnitureMesh key={item.id} item={item} showLabel={showLabels} />
      ))}

      {/* Labels */}
      {showLabels && <RoomLabels />}

      {/* Ceiling (subtle) */}
      <Ceiling />

      {/* Camera */}
      <CameraController activeRoom={activeRoom} />
    </>
  );
}

/* ─── Main Component ─── */
interface FloorplanSceneProps {
  showOptimized: boolean;
  showLabels: boolean;
  activeRoom: string;
}

export default function FloorplanScene({ showOptimized, showLabels, activeRoom }: FloorplanSceneProps) {
  const preset = roomCameraPresets[activeRoom] || roomCameraPresets.overview;

  return (
    <div
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
        <Canvas
          shadows
          camera={{
            position: preset.position.map(v => v * S) as unknown as THREE.Vector3Tuple,
            fov: 50,
            near: 0.1,
            far: 500,
          }}
          style={{
            background: 'linear-gradient(180deg, #e8e4e0 0%, #f5f3f0 100%)',
            width: '100%',
            height: '100%',
            touchAction: 'none',
          }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        >
          <Scene showOptimized={showOptimized} showLabels={showLabels} activeRoom={activeRoom} />
        </Canvas>
    </div>
  );
}
