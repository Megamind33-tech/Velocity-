import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AudioController } from '../lib/audio';
import { Song } from '../lib/songs';

interface GameStats {
  perfectGates: number;
  maxCombo: number;
  accuracyPercentage: number;
  totalTimeSpent: number;
}

interface FlightSimulator3DProps {
  audioController: AudioController;
  onGameOver: (score: number, win?: boolean, stats?: GameStats) => void;
  onCheckpointReached?: (checkpoint: { score: number, currentLyricIndex: number, obstaclesPassed: number }) => void;
  difficulty: 'easy' | 'medium' | 'hard';
  song?: Song | null;
  level: number;
  isPaused: boolean;
  initialCheckpoint?: { score: number, currentLyricIndex: number, obstaclesPassed: number } | null;
  selectedPlaneId?: string;
}

const DIFFICULTY_PARAMS = {
  easy: { spawnRate: 200, gapSize: 220, baseWidth: 80, forgiveness: 1.8, scoreMultiplier: 0.7, speedMultiplier: 0.8 },
  medium: { spawnRate: 140, gapSize: 180, baseWidth: 60, forgiveness: 1.2, scoreMultiplier: 1.0, speedMultiplier: 1.0 },
  hard: { spawnRate: 90, gapSize: 130, baseWidth: 40, forgiveness: 0.6, scoreMultiplier: 1.8, speedMultiplier: 1.3 },
};

export const FlightSimulator3D: React.FC<FlightSimulator3DProps> = ({
  audioController,
  onGameOver,
  onCheckpointReached,
  difficulty,
  song,
  level,
  isPaused,
  initialCheckpoint,
  selectedPlaneId = 'default',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const planeRef = useRef<THREE.Group | null>(null);
  const ringsRef = useRef<THREE.Group[]>([]);
  const frameIdRef = useRef<number>(0);

  // Game state
  const [score, setScore] = useState(initialCheckpoint?.score || 0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(initialCheckpoint?.currentLyricIndex || 0);
  const [isCockpitView, setIsCockpitView] = useState(false);

  // Use refs for values needed in the animation loop to avoid dependency issues
  const scoreRef = useRef(score);
  const comboRef = useRef(combo);
  const maxComboRef = useRef(maxCombo);
  const currentLyricIndexRef = useRef(currentLyricIndex);
  const isCockpitViewRef = useRef(isCockpitView);

  useEffect(() => {
    scoreRef.current = score;
    comboRef.current = combo;
    maxComboRef.current = maxCombo;
    currentLyricIndexRef.current = currentLyricIndex;
    isCockpitViewRef.current = isCockpitView;
  }, [score, combo, maxCombo, currentLyricIndex, isCockpitView]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.002);
    sceneRef.current = scene;

    // 2. Setup Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.set(0, 5, 20);
    cameraRef.current = camera;

    // 3. Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // 5. Ground & Environment
    const gridHelper = new THREE.GridHelper(10000, 200, 0x3b82f6, 0x1e293b);
    gridHelper.position.y = -50;
    scene.add(gridHelper);

    // Add some "buildings" or pillars for depth
    for (let i = 0; i < 150; i++) {
      const h = 20 + Math.random() * 150;
      const geom = new THREE.BoxGeometry(15, h, 15);
      const mat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b,
        emissive: 0x3b82f6,
        emissiveIntensity: 0.1
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 800,
        h / 2 - 50,
        -Math.random() * 4000
      );
      scene.add(mesh);
    }

    // 6. Plane (Dynamic based on selection)
    const planeGroup = new THREE.Group();
    
    const PLANE_CONFIGS: Record<string, { color: number, wingColor: number, wingWidth: number, bodyLength: number, engineColor: number }> = {
      'default': { color: 0x3b82f6, wingColor: 0x1e40af, wingWidth: 6, bodyLength: 4, engineColor: 0x00ffff },
      'speedster': { color: 0xef4444, wingColor: 0x991b1b, wingWidth: 4, bodyLength: 5, engineColor: 0xff4400 },
      'stealth': { color: 0x334155, wingColor: 0x0f172a, wingWidth: 8, bodyLength: 3.5, engineColor: 0x444444 },
      'gold': { color: 0xf59e0b, wingColor: 0xb45309, wingWidth: 7, bodyLength: 4.5, engineColor: 0xffaa00 },
    };

    const config = PLANE_CONFIGS[selectedPlaneId] || PLANE_CONFIGS.default;

    // Body
    const bodyGeom = new THREE.CylinderGeometry(0.5, 0.8, config.bodyLength, 8);
    bodyGeom.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: config.color, metalness: 0.8, roughness: 0.2 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    planeGroup.add(body);

    // Wings
    const wingGeom = new THREE.BoxGeometry(config.wingWidth, 0.1, 1.5);
    const wingMat = new THREE.MeshStandardMaterial({ color: config.wingColor, metalness: 0.9, roughness: 0.1 });
    const wings = new THREE.Mesh(wingGeom, wingMat);
    wings.position.z = 0.5;
    planeGroup.add(wings);

    // Cockpit
    const cockpitGeom = new THREE.SphereGeometry(0.4, 16, 16);
    const cockpitMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 });
    const cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
    cockpit.position.set(0, 0.4, -0.5);
    cockpit.scale.set(1, 0.5, 1.5);
    planeGroup.add(cockpit);

    // Engine Glow
    const engineGeom = new THREE.CircleGeometry(0.4, 16);
    const engineMat = new THREE.MeshBasicMaterial({ color: config.engineColor });
    const engine = new THREE.Mesh(engineGeom, engineMat);
    engine.position.z = config.bodyLength / 2;
    planeGroup.add(engine);

    // Add some extra details for specific planes
    if (selectedPlaneId === 'stealth') {
      const tailGeom = new THREE.BoxGeometry(0.1, 2, 1);
      const tail = new THREE.Mesh(tailGeom, wingMat);
      tail.position.set(0, 1, 1.5);
      planeGroup.add(tail);
    }

    if (selectedPlaneId === 'gold') {
      const glowGeom = new THREE.SphereGeometry(1, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.1 });
      const glow = new THREE.Mesh(glowGeom, glowMat);
      planeGroup.add(glow);
    }

    scene.add(planeGroup);
    planeRef.current = planeGroup;

    // 7. Animation Loop
    let frameCount = 0;
    let gameSpeed = DIFFICULTY_PARAMS[difficulty].speedMultiplier * 2.0;
    let nextSpawnZ = -100;
    const startTime = Date.now();

    const spawnRing = (z: number, y: number, type: 'ring' | 'gate' = 'ring') => {
      const group = new THREE.Group();
      if (type === 'ring') {
        const ringGeom = new THREE.TorusGeometry(5, 0.4, 16, 100);
        const ringMat = new THREE.MeshStandardMaterial({ 
          color: 0x00ffff, 
          emissive: 0x00ffff, 
          emissiveIntensity: 1.5,
          transparent: true,
          opacity: 0.8
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        group.add(ring);
      } else {
        // Gate
        const gateGeom = new THREE.BoxGeometry(15, 1.5, 0.5);
        const gateMat = new THREE.MeshStandardMaterial({ color: 0xff00ff, emissive: 0xff00ff, emissiveIntensity: 1 });
        const top = new THREE.Mesh(gateGeom, gateMat);
        top.position.y = 8;
        const bottom = new THREE.Mesh(gateGeom, gateMat);
        bottom.position.y = -8;
        group.add(top, bottom);
      }
      group.position.set(0, y, z);
      scene.add(group);
      ringsRef.current.push(group as any);
    };

    const animate = () => {
      if (isPaused) {
        frameIdRef.current = requestAnimationFrame(animate);
        return;
      }

      frameCount++;

      // Update song progression
      if (song) {
        const currentTime = (Date.now() - startTime) / 1000;
        const currentLyric = song.sequence[currentLyricIndexRef.current];
        if (currentLyric && currentTime > currentLyric.time + currentLyric.duration) {
          setCurrentLyricIndex(prev => {
            const next = Math.min(song.sequence.length - 1, prev + 1);
            currentLyricIndexRef.current = next;
            return next;
          });
        }
        
        // Check for song end
        if (currentLyricIndexRef.current >= song.sequence.length - 1 && currentTime > song.sequence[song.sequence.length - 1].time + 3) {
          onGameOver(scoreRef.current, true, {
            perfectGates: Math.floor(scoreRef.current / 100),
            maxCombo: maxComboRef.current,
            accuracyPercentage: 92, // Placeholder
            totalTimeSpent: currentTime
          });
          return;
        }
      }

      // Update plane altitude based on pitch
      if (audioController.isSinging && audioController.pitch > 0) {
        const minNote = 48; // C3
        const maxNote = 72; // C5
        const noteRange = maxNote - minNote;
        const normalizedPitch = Math.max(0, Math.min(1, (audioController.pitch - minNote) / noteRange));
        const targetY = (normalizedPitch - 0.5) * 80; // Range from -40 to 40
        
        const dy = targetY - planeGroup.position.y;
        planeGroup.position.y += dy * 0.08;
        
        // Banking and tilting
        planeGroup.rotation.x = -dy * 0.015;
        planeGroup.rotation.z = -dy * 0.01;
      } else {
        // Gravity effect
        planeGroup.position.y -= 0.15;
        planeGroup.rotation.x = 0.1;
        planeGroup.rotation.z *= 0.95;
      }

      // Move forward
      planeGroup.position.z -= gameSpeed;
      
      // Camera follows plane
      if (isCockpitViewRef.current) {
        camera.position.copy(planeGroup.position);
        camera.position.y += 0.8;
        camera.position.z -= 0.5;
        camera.lookAt(planeGroup.position.x, planeGroup.position.y, planeGroup.position.z - 100);
      } else {
        const targetCamZ = planeGroup.position.z + 25;
        const targetCamY = planeGroup.position.y + 10;
        camera.position.z += (targetCamZ - camera.position.z) * 0.1;
        camera.position.y += (targetCamY - camera.position.y) * 0.1;
        camera.lookAt(planeGroup.position.x, planeGroup.position.y, planeGroup.position.z - 30);
      }

      // Spawn rings
      if (planeGroup.position.z < nextSpawnZ) {
        let spawnY = (Math.random() - 0.5) * 60;
        
        // If song is active, try to align with notes
        if (song) {
          const nextLyric = song.sequence[currentLyricIndexRef.current + 1];
          if (nextLyric) {
            const minNote = 48;
            const maxNote = 72;
            const noteRange = maxNote - minNote;
            const normalizedPitch = Math.max(0, Math.min(1, (nextLyric.note - minNote) / noteRange));
            spawnY = (normalizedPitch - 0.5) * 80;
          }
        }

        spawnRing(nextSpawnZ - 200, spawnY, Math.random() > 0.4 ? 'ring' : 'gate');
        nextSpawnZ -= 200;
      }

      // Check collisions and passing
      for (let i = ringsRef.current.length - 1; i >= 0; i--) {
        const ring = ringsRef.current[i];
        
        // Check if passed
        if (ring.position.z > planeGroup.position.z + 5) {
          const dist = Math.abs(ring.position.y - planeGroup.position.y);
          if (dist < 8) {
            // Success!
            setScore(s => {
              const newScore = s + 100;
              scoreRef.current = newScore;
              return newScore;
            });
            setCombo(c => {
              const newCombo = c + 1;
              comboRef.current = newCombo;
              if (newCombo > maxComboRef.current) {
                setMaxCombo(newCombo);
                maxComboRef.current = newCombo;
              }
              return newCombo;
            });
          } else {
            // Missed
            setCombo(0);
            comboRef.current = 0;
          }
          scene.remove(ring);
          ringsRef.current.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [audioController, difficulty, isPaused, song, onGameOver]);

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
        {/* Top HUD */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-3">
            <div className="bg-black/80 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl min-w-[160px] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <div className="text-blue-500 text-[9px] font-mono font-black tracking-[0.3em] uppercase mb-1 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Altitude
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-4xl font-mono font-bold tracking-tighter">{(planeRef.current?.position.y || 0 + 50).toFixed(0)}</span>
                <span className="text-slate-500 text-[10px] font-mono font-bold">FT</span>
              </div>
              <div className="mt-2 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500/40 transition-all duration-300" style={{ width: `${Math.min(100, ((planeRef.current?.position.y || 0) + 50) / 100 * 100)}%` }} />
              </div>
            </div>

            <div className="bg-black/80 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl min-w-[160px] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400" />
              <div className="text-cyan-400 text-[9px] font-mono font-black tracking-[0.3em] uppercase mb-1 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Airspeed
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-4xl font-mono font-bold tracking-tighter">{(DIFFICULTY_PARAMS[difficulty].speedMultiplier * 240).toFixed(0)}</span>
                <span className="text-slate-500 text-[10px] font-mono font-bold">KTS</span>
              </div>
              <div className="mt-2 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400/40 transition-all duration-300" style={{ width: '65%' }} />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="bg-black/80 backdrop-blur-xl px-10 py-5 rounded-[32px] border border-white/10 shadow-2xl flex flex-col items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
              <div className="text-white text-5xl font-mono font-black tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {Math.floor(score).toString().padStart(6, '0')}
              </div>
              <div className="text-blue-500 text-[9px] font-mono font-black tracking-[0.4em] uppercase mt-1">Credits_Earned</div>
            </div>
            {combo > 1 && (
              <div className="bg-amber-500 text-black px-6 py-2 rounded-full font-black text-xs uppercase tracking-[0.2em] animate-bounce shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                {combo}X MULTIPLIER
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-3 items-end">
            <div className="bg-black/80 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl text-right min-w-[160px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-blue-500" />
              <div className="text-blue-500 text-[9px] font-mono font-black tracking-[0.3em] uppercase mb-1">Heading_Vector</div>
              <div className="flex items-baseline justify-end gap-2">
                <span className="text-white text-4xl font-mono font-bold tracking-tighter">352°</span>
                <span className="text-slate-500 text-[10px] font-mono font-bold">NW</span>
              </div>
            </div>
            <button 
              onClick={() => setIsCockpitView(!isCockpitView)}
              className="pointer-events-auto bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl border border-white/10 flex items-center gap-3 group"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:bg-white animate-pulse" />
              {isCockpitView ? 'EXTERIOR_VIEW' : 'COCKPIT_CAM'}
            </button>
          </div>
        </div>

        {/* Center HUD (Artificial Horizon) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none">
          <div className="relative w-full h-full border border-white/5 rounded-full flex items-center justify-center">
            {/* Horizon Line */}
            <div 
              className="absolute w-full h-px bg-blue-500/30 transition-transform duration-100 flex items-center justify-center"
              style={{ transform: `rotate(${planeRef.current?.rotation.z || 0}rad) translateY(${(planeRef.current?.rotation.x || 0) * 150}px)` }}
            >
              <div className="w-4 h-4 border-t border-blue-500 absolute -top-2" />
            </div>
            
            {/* Pitch Ladder */}
            <div className="flex flex-col gap-8 opacity-20">
              {[20, 10, 0, -10, -20].map(val => (
                <div key={val} className="flex items-center gap-4">
                  <span className="text-[8px] font-mono text-white w-4">{val}</span>
                  <div className="w-12 h-px bg-white" />
                  <span className="text-[8px] font-mono text-white w-4">{val}</span>
                </div>
              ))}
            </div>

            {/* Center Reticle */}
            <div className="absolute flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-cyan-400/50 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-cyan-400 rounded-full" />
              </div>
              <div className="absolute w-32 h-px bg-cyan-400/30" />
              <div className="absolute h-32 w-px bg-cyan-400/10" />
            </div>
          </div>
        </div>

        {/* Bottom HUD */}
        <div className="flex flex-col items-center gap-8">
          {/* Lyrics Display */}
          <div className="bg-black/60 backdrop-blur-2xl px-16 py-8 rounded-[40px] border border-white/10 shadow-2xl text-center max-w-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5" />
            {song && (
              <div className="space-y-3 relative z-10">
                <div className="text-blue-500 text-[9px] font-mono font-black tracking-[0.5em] uppercase opacity-60">Vocal_Command_Input</div>
                <div className="text-white text-5xl font-black tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] italic">
                  {song.sequence[currentLyricIndex]?.word.toUpperCase() || "AWAITING_SIGNAL..."}
                </div>
                <div className="text-blue-400/40 text-xs font-mono tracking-widest">
                  NEXT: {song.sequence[currentLyricIndex + 1]?.word.toUpperCase() || "END_OF_PATH"}
                </div>
              </div>
            )}
          </div>

          {/* Pitch & Volume Meters */}
          <div className="flex items-center gap-10 bg-black/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <div className="text-[9px] font-mono font-black text-blue-500 uppercase tracking-widest">Signal_Power</div>
                <div className="text-[9px] font-mono text-slate-500">{(audioController.volume * 100).toFixed(1)}%</div>
              </div>
              <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-100 rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, (audioController.volume * 800)))}%` }}
                />
              </div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <div className="text-[9px] font-mono font-black text-cyan-400 uppercase tracking-widest">Pitch_Freq</div>
                <div className="text-[9px] font-mono text-slate-500">{(audioController.pitch || 0).toFixed(1)} HZ</div>
              </div>
              <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.6)] transition-all duration-100 rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, ((audioController.pitch - 48) / 24) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
