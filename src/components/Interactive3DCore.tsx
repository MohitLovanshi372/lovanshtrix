import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp, RotateCcw, Box } from 'lucide-react';

export interface InnovationStageSpec {
  step: string;
  label: string;
  caption: string;
  architecture: string;
  angle: number;
  orbitRadius: number;
  elevation: number;
}

export const INNOVATION_STAGES: InnovationStageSpec[] = [
  {
    step: '01',
    label: 'Discover',
    caption: 'Clarify problem scope, target users, and practical constraints.',
    architecture: 'Requirements · User Journey Map · Feasibility Check',
    angle: 0,
    orbitRadius: 2.35,
    elevation: 0.35,
  },
  {
    step: '02',
    label: 'Plan',
    caption: 'Define data schemas, API boundaries, and iterative milestones.',
    architecture: 'System Blueprint · Database Schema · Sprint Plan',
    angle: Math.PI / 3,
    orbitRadius: 2.35,
    elevation: -0.25,
  },
  {
    step: '03',
    label: 'Design',
    caption: 'Craft accessible interfaces, responsive grids, and clear user flows.',
    architecture: 'Wireframes · Component Tokens · WCAG AA Contrast',
    angle: (2 * Math.PI) / 3,
    orbitRadius: 2.35,
    elevation: 0.3,
  },
  {
    step: '04',
    label: 'Develop',
    caption: 'Build clean TypeScript frontends, validated APIs, and AI integrations.',
    architecture: 'React + TypeScript · Node.js API · Server-Side AI',
    angle: Math.PI,
    orbitRadius: 2.35,
    elevation: -0.3,
  },
  {
    step: '05',
    label: 'Test',
    caption: 'Verify form validation, cross-device responsiveness, and edge states.',
    architecture: 'Input Validation · Device Audit · Error Handling',
    angle: (4 * Math.PI) / 3,
    orbitRadius: 2.35,
    elevation: 0.25,
  },
  {
    step: '06',
    label: 'Launch',
    caption: 'Deploy to cloud infrastructure with clean documentation and handover.',
    architecture: 'Cloud Deployment · SSL & SEO · Ongoing Support',
    angle: (5 * Math.PI) / 3,
    orbitRadius: 2.35,
    elevation: -0.2,
  },
];

type MaterialFinish = 'cobalt' | 'violet' | 'titanium';

const FINISH_PALETTES: Record<
  MaterialFinish,
  {
    label: string;
    coreHex: number;
    ringHex: number;
    accentHex: number;
    emissiveHex: number;
  }
> = {
  cobalt: {
    label: 'Obsidian Cobalt',
    coreHex: 0x1e3a8a,
    ringHex: 0x3b82f6,
    accentHex: 0x60a5fa,
    emissiveHex: 0x1d4ed8,
  },
  violet: {
    label: 'Quantum Violet',
    coreHex: 0x311068,
    ringHex: 0x7c3aed,
    accentHex: 0xa78bfa,
    emissiveHex: 0x5b21b6,
  },
  titanium: {
    label: 'Brushed Titanium',
    coreHex: 0x1e293b,
    ringHex: 0x94a3b8,
    accentHex: 0x38bdf8,
    emissiveHex: 0x0284c7,
  },
};

// Reusable math objects at module scope (zero GC in render loop)
const _mouse = new THREE.Vector2();
const _targetCameraPos = new THREE.Vector3();
const _dummyMatrix = new THREE.Matrix4();
const _dummyPos = new THREE.Vector3();
const _dummyQuat = new THREE.Quaternion();
const _dummyScale = new THREE.Vector3();
const _dummyColor = new THREE.Color();

interface Interactive3DCoreProps {
  isDark: boolean;
  compact?: boolean;
}

export const Interactive3DCore: React.FC<Interactive3DCoreProps> = ({ isDark, compact = false }) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(3);
  const [explodedFactor, setExplodedFactor] = useState<number>(0.15);
  const [finish, setFinish] = useState<MaterialFinish>('cobalt');
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  // Mutable refs for animation loop access without re-mounting WebGL
  const activeStageRef = useRef<number>(3);
  const explodedRef = useRef<number>(0.15);
  const finishRef = useRef<MaterialFinish>('cobalt');
  const resetCameraTriggerRef = useRef<boolean>(false);

  useEffect(() => {
    activeStageRef.current = activeStageIdx;
  }, [activeStageIdx]);

  useEffect(() => {
    explodedRef.current = explodedFactor;
  }, [explodedFactor]);

  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software-WebGL Guard (detect SwiftShader, llvmpipe, Basic Render from GPU renderer string)
    let isSoftwareGl = false;
    try {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      setWebglSupported(false);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 520;
    const height = container.clientHeight || 420;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bgHex = 0x060b19;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.085);

    // 2. Studio Environment Map (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // Camera & OrbitControls
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 2.1, 6.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3.6;
    controls.maxDistance = 10.5;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.target.set(0, 0, 0);

    // 3. Three-Point Studio Lighting Rig (Warm Key + Cool Hemisphere + Violet Rim)
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    keyLight.position.set(4.5, 6.5, 4.0);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.camera.left = -4;
      keyLight.shadow.camera.right = 4;
      keyLight.shadow.camera.top = 4;
      keyLight.shadow.camera.bottom = -4;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x8b5cf6, 1.8);
    rimLight.position.set(-5.0, 2.5, -4.5);
    scene.add(rimLight);

    // Contact Grounding Pedestal & Shadow Plane
    const pedestalGeo = new THREE.CylinderGeometry(2.8, 3.1, 0.12, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0b1329,
      metalness: 0.75,
      roughness: 0.35,
    });
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestalMesh.position.set(0, -1.65, 0);
    pedestalMesh.receiveShadow = true;
    scene.add(pedestalMesh);

    const ringDecalGeo = new THREE.RingGeometry(2.15, 2.22, 64);
    ringDecalGeo.rotateX(-Math.PI / 2);
    const ringDecalMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.4,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const ringDecal = new THREE.Mesh(ringDecalGeo, ringDecalMat);
    ringDecal.position.set(0, -1.58, 0);
    scene.add(ringDecal);

    // 4. Composite Multi-Part Procedural Model (THREE.Group: 10+ distinct parts)
    const rootAssembly = new THREE.Group();
    scene.add(rootAssembly);

    // Part 1: Central Beveled Hexagonal Prism Core (ExtrudeGeometry)
    const hexShape = new THREE.Shape();
    const hexRadius = 0.78;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const x = Math.cos(a) * hexRadius;
      const y = Math.sin(a) * hexRadius;
      if (i === 0) hexShape.moveTo(x, y);
      else hexShape.lineTo(x, y);
    }
    hexShape.closePath();

    const coreExtrudeGeo = new THREE.ExtrudeGeometry(hexShape, {
      depth: 0.7,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.12,
      bevelThickness: 0.12,
    });
    coreExtrudeGeo.center();

    const coreMat = new THREE.MeshPhysicalMaterial({
      color: FINISH_PALETTES.cobalt.coreHex,
      metalness: 0.88,
      roughness: 0.18,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
    });
    const coreMesh = new THREE.Mesh(coreExtrudeGeo, coreMat);
    coreMesh.castShadow = true;
    coreMesh.receiveShadow = true;
    rootAssembly.add(coreMesh);

    // Part 2 & 3: Upper & Lower Precision End-Caps on Core
    const capGeo = new THREE.CylinderGeometry(0.48, 0.58, 0.18, 6);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      metalness: 0.92,
      roughness: 0.42,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.35,
    });
    const topCap = new THREE.Mesh(capGeo, capMat);
    topCap.position.set(0, 0.56, 0);
    const bottomCap = new THREE.Mesh(capGeo, capMat);
    bottomCap.rotation.z = Math.PI;
    bottomCap.position.set(0, -0.56, 0);
    rootAssembly.add(topCap, bottomCap);

    // Part 4 & 5: Dual Counter-Rotating Gimbal Rings
    const innerGimbalGeo = new THREE.TorusGeometry(1.32, 0.038, 20, 72);
    const gimbalMat = new THREE.MeshStandardMaterial({
      color: FINISH_PALETTES.cobalt.ringHex,
      metalness: 0.9,
      roughness: 0.22,
    });
    const innerGimbal = new THREE.Mesh(innerGimbalGeo, gimbalMat);
    innerGimbal.rotation.x = Math.PI / 3;
    rootAssembly.add(innerGimbal);

    const outerGimbalGeo = new THREE.TorusGeometry(1.68, 0.028, 16, 84);
    const outerGimbalMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      metalness: 0.65,
      roughness: 0.48,
    });
    const outerGimbal = new THREE.Mesh(outerGimbalGeo, outerGimbalMat);
    outerGimbal.rotation.y = Math.PI / 4;
    outerGimbal.rotation.x = -Math.PI / 5;
    rootAssembly.add(outerGimbal);

    // Parts 6–11: 6 Interactive Orbital Stage Satellites (Raycastable Layer 1)
    const satellitesGroup = new THREE.Group();
    rootAssembly.add(satellitesGroup);

    const clickableProxies: THREE.Mesh[] = [];
    const satelliteNodes: {
      group: THREE.Group;
      coreMesh: THREE.Mesh;
      haloMesh: THREE.Mesh;
      spokeLine: THREE.Line;
      basePos: THREE.Vector3;
      mat: THREE.MeshStandardMaterial;
    }[] = [];

    const satCoreGeo = new THREE.OctahedronGeometry(0.24, 1);
    const satHaloGeo = new THREE.TorusGeometry(0.36, 0.018, 12, 36);
    const proxyGeo = new THREE.SphereGeometry(0.46, 12, 12);
    const proxyMat = new THREE.MeshBasicMaterial({ visible: false });

    INNOVATION_STAGES.forEach((stage, idx) => {
      const satGroup = new THREE.Group();
      const bx = Math.cos(stage.angle) * stage.orbitRadius;
      const bz = Math.sin(stage.angle) * stage.orbitRadius;
      const by = stage.elevation;
      const basePos = new THREE.Vector3(bx, by, bz);
      satGroup.position.copy(basePos);

      const satMat = new THREE.MeshStandardMaterial({
        color: idx === activeStageRef.current ? 0x60a5fa : 0x1e293b,
        metalness: 0.82,
        roughness: 0.24,
        emissive: idx === activeStageRef.current ? 0x2563eb : 0x0f172a,
        emissiveIntensity: idx === activeStageRef.current ? 0.65 : 0.15,
      });

      const satMesh = new THREE.Mesh(satCoreGeo, satMat);
      satMesh.castShadow = true;
      satGroup.add(satMesh);

      const haloMesh = new THREE.Mesh(
        satHaloGeo,
        new THREE.MeshBasicMaterial({
          color: idx === activeStageRef.current ? 0x93c5fd : 0x475569,
          transparent: true,
          opacity: 0.7,
        })
      );
      haloMesh.rotation.x = Math.PI / 2;
      satGroup.add(haloMesh);

      // Raycast collision proxy on Layer 1
      const proxyMesh = new THREE.Mesh(proxyGeo, proxyMat);
      proxyMesh.layers.set(1);
      proxyMesh.userData = { stageIndex: idx };
      satGroup.add(proxyMesh);
      clickableProxies.push(proxyMesh);

      // Connecting spoke line to center
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        basePos.clone(),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: idx === activeStageRef.current ? 0x60a5fa : 0x334155,
        transparent: true,
        opacity: 0.55,
      });
      const spokeLine = new THREE.Line(lineGeo, lineMat);
      satellitesGroup.add(spokeLine);
      satellitesGroup.add(satGroup);

      satelliteNodes.push({
        group: satGroup,
        coreMesh: satMesh,
        haloMesh,
        spokeLine,
        basePos,
        mat: satMat,
      });
    });

    // Part 12: InstancedMesh Lattice Micro-Satellites (36 nodes with varied scale & tint)
    const instanceCount = 36;
    const microGeo = new THREE.BoxGeometry(0.055, 0.055, 0.055);
    const microMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      metalness: 0.8,
      roughness: 0.25,
    });
    const instancedLattice = new THREE.InstancedMesh(microGeo, microMat, instanceCount);
    for (let i = 0; i < instanceCount; i++) {
      const theta = (i / instanceCount) * Math.PI * 2;
      const r = 2.85 + (i % 3) * 0.22;
      const y = Math.sin(theta * 3) * 0.55;
      _dummyPos.set(Math.cos(theta) * r, y, Math.sin(theta) * r);
      _dummyQuat.setFromEuler(new THREE.Euler(theta, theta * 0.5, 0));
      const s = 0.85 + (i % 4) * 0.1;
      _dummyScale.set(s, s, s);
      _dummyMatrix.compose(_dummyPos, _dummyQuat, _dummyScale);
      instancedLattice.setMatrixAt(i, _dummyMatrix);
      _dummyColor.setHex(i % 2 === 0 ? 0x60a5fa : 0xa78bfa);
      instancedLattice.setColorAt(i, _dummyColor);
    }
    instancedLattice.instanceMatrix.needsUpdate = true;
    if (instancedLattice.instanceColor) instancedLattice.instanceColor.needsUpdate = true;
    instancedLattice.computeBoundingSphere();
    rootAssembly.add(instancedLattice);

    // Pre-warm shaders on hardware GPUs
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting setup (restricted to Layer 1)
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);

    const handlePointerDown = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(_mouse, camera);
      const hits = raycaster.intersectObjects(clickableProxies, false);
      if (hits.length > 0) {
        const hitIdx = hits[0].object.userData?.stageIndex;
        if (typeof hitIdx === 'number') {
          setActiveStageIdx(hitIdx);
        }
      }
    };

    let lastHoverTime = 0;
    const handlePointerMove = (event: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverTime < 50) return;
      lastHoverTime = now;
      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(_mouse, camera);
      const hits = raycaster.intersectObjects(clickableProxies, false);
      renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 520;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Software-WebGL Paced Loop & Smooth Exponential Damping
    const clock = new THREE.Clock();
    let frameId = 0;
    let currentExploded = explodedRef.current;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function tick() {
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Smoothly damp exploded factor
      currentExploded = THREE.MathUtils.damp(currentExploded, explodedRef.current, 6, dt);

      // Update palette finish smoothly
      const palette = FINISH_PALETTES[finishRef.current];
      coreMat.color.setHex(palette.coreHex);
      gimbalMat.color.setHex(palette.ringHex);
      capMat.emissive.setHex(palette.emissiveHex);

      // Gentle core & gimbal rotation
      coreMesh.rotation.z += dt * 0.25;
      coreMesh.rotation.y += dt * 0.18;
      topCap.position.y = 0.56 + currentExploded * 0.65;
      bottomCap.position.y = -(0.56 + currentExploded * 0.65);

      innerGimbal.rotation.z -= dt * 0.32;
      innerGimbal.scale.setScalar(1 + currentExploded * 0.22);
      outerGimbal.rotation.x += dt * 0.2;
      outerGimbal.scale.setScalar(1 + currentExploded * 0.35);
      instancedLattice.rotation.y += dt * 0.08;

      // Update orbital satellites
      const selectedIdx = activeStageRef.current;
      satelliteNodes.forEach((sat, idx) => {
        const isSelected = idx === selectedIdx;
        const expansionMultiplier = 1 + currentExploded * 0.55;
        sat.group.position.set(
          sat.basePos.x * expansionMultiplier,
          sat.basePos.y + Math.sin(elapsed * 1.6 + idx) * 0.06,
          sat.basePos.z * expansionMultiplier
        );
        sat.coreMesh.rotation.y += dt * (isSelected ? 1.4 : 0.45);
        sat.coreMesh.rotation.x += dt * 0.3;

        const targetScale = isSelected ? 1.32 : 1.0;
        const dampedScale = THREE.MathUtils.damp(sat.group.scale.x, targetScale, 8, dt);
        sat.group.scale.setScalar(dampedScale);

        sat.mat.color.setHex(isSelected ? palette.accentHex : 0x1e293b);
        sat.mat.emissive.setHex(isSelected ? palette.emissiveHex : 0x0f172a);
        sat.mat.emissiveIntensity = isSelected ? 0.85 : 0.15;
      });

      // Camera reset animation if triggered
      if (resetCameraTriggerRef.current) {
        _targetCameraPos.set(0, 2.1, 6.2);
        camera.position.lerp(_targetCameraPos, 1 - Math.exp(-8 * dt));
        controls.target.lerp(new THREE.Vector3(0, 0, 0), 1 - Math.exp(-8 * dt));
        if (camera.position.distanceTo(_targetCameraPos) < 0.05) {
          resetCameraTriggerRef.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      controls.dispose();
      envTarget.dispose();
      renderer.dispose();
    };
  }, []);

  const currentStage = INNOVATION_STAGES[activeStageIdx] || INNOVATION_STAGES[0];

  return (
    <div
      className={`relative w-full rounded-2xl border overflow-hidden flex flex-col justify-between ${
        compact ? 'min-h-[380px]' : 'min-h-[470px] h-full'
      } ${
        isDark
          ? 'bg-[#060B19] border-slate-800/90 text-white'
          : 'bg-[#060B19] border-slate-800 text-white'
      }`}
    >
      {/* Minimal Top-Left Specification Header (Unobstructed 3D Center) */}
      <div className="relative z-10 flex items-center justify-between gap-4 px-5 py-3.5 bg-[#060B19]/90 border-b border-slate-800/80 pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <Box className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <p className="text-[11px] font-medium text-blue-400">
              Interactive 3D Spatial Architecture · Drag to Orbit · Click Nodes
            </p>
            <h3 className="font-display text-sm font-semibold text-white">
              {currentStage.step}. {currentStage.label} — {currentStage.architecture}
            </h3>
          </div>
        </div>
        <span className="text-xs font-mono text-slate-400 tabular-nums shrink-0">
          Stage {currentStage.step} / 06
        </span>
      </div>

      {/* Dedicated Empty WebGL Canvas Mount Container */}
      {webglSupported ? (
        <div
          ref={canvasMountRef}
          className="relative flex-1 w-full min-h-[280px]"
          aria-label="Interactive 3D Lovanstrix Innovation Core"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <p className="text-xs text-slate-300">
            Interactive 3D Innovation Core — {currentStage.label}: {currentStage.caption}
          </p>
        </div>
      )}

      {/* Unified Collapsible Bottom Control Dock (Zero Side-Panel Clutter, Zero Backdrop-Blur over WebGL) */}
      <div className="relative z-10 w-full px-4 pb-3 pt-1 flex flex-col items-center pointer-events-none">
        <button
          type="button"
          onClick={() => setDockCollapsed((prev) => !prev)}
          className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-[#0B1224] border border-b-0 border-slate-700/80 text-[11px] font-medium text-slate-300 hover:text-white transition-colors"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
              <span>Show 3D Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
              <span>Hide Controls</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="pointer-events-auto w-full max-w-[920px] rounded-xl bg-[#0B1224] border border-slate-700/80 p-3.5 space-y-3 shadow-lg">
            {/* Stage Caption & Quick Stage Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <p className="text-xs text-slate-300 leading-relaxed">{currentStage.caption}</p>
              <button
                type="button"
                onClick={() => {
                  resetCameraTriggerRef.current = true;
                  setExplodedFactor(0.15);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 whitespace-nowrap shrink-0 self-start sm:self-center"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset View</span>
              </button>
            </div>

            {/* Stage Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5" role="tablist">
              {INNOVATION_STAGES.map((node, idx) => (
                <button
                  key={node.step}
                  type="button"
                  onClick={() => setActiveStageIdx(idx)}
                  className={`py-1.5 px-2 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 truncate ${
                    idx === activeStageIdx
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#060B19] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {node.step}. {node.label}
                </button>
              ))}
            </div>

            {/* Exploded View Slider & Finish Presets */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-[11px]">
              <div className="flex items-center gap-2.5 flex-1 min-w-[180px]">
                <label htmlFor="exploded-slider" className="text-slate-400 whitespace-nowrap shrink-0">
                  Exploded Orbit:
                </label>
                <input
                  id="exploded-slider"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={explodedFactor}
                  onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 mr-1">Finish:</span>
                {(['cobalt', 'violet', 'titanium'] as MaterialFinish[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFinish(f)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                      finish === f
                        ? 'bg-blue-600/30 border border-blue-500 text-white'
                        : 'bg-[#060B19] border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {FINISH_PALETTES[f].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
