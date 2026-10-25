import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { ChevronDown, ChevronUp, RotateCcw, Layers, Eye } from "lucide-react";
const CAMERA_TARGETS = {
  isometric: [4.2, 2.9, 4.6],
  top: [0.01, 6.4, 0.8],
  front: [0, 1.1, 6.1]
};
const Interactive3DCore = ({
  isDark = false,
  compact = false
}) => {
  const canvasMountRef = useRef(null);
  const [cameraPreset, setCameraPreset] = useState("isometric");
  const [coreMode, setCoreMode] = useState("unified");
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [selectedLayerLabel, setSelectedLayerLabel] = useState(
    "Web \xB7 Apps \xB7 AI Technology Core"
  );
  const targetExplosionRef = useRef(0);
  const cameraTargetPosRef = useRef(null);
  const requestRenderRef = useRef(null);
  useEffect(() => {
    targetExplosionRef.current = coreMode === "exploded" ? 1 : 0;
    requestRenderRef.current?.();
  }, [coreMode]);
  useEffect(() => {
    const coords = CAMERA_TARGETS[cameraPreset];
    cameraTargetPosRef.current = new THREE.Vector3(coords[0], coords[1], coords[2]);
    requestRenderRef.current?.();
  }, [cameraPreset]);
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;
    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement("canvas");
        const gl = probeCanvas.getContext("webgl2") || probeCanvas.getContext("webgl");
        if (!gl) return true;
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();
    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, compact ? 390 : 460);
    const scene = new THREE.Scene();
    const bgHex = isDark ? 527126 : 725803;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.065);
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    camera.position.set(...CAMERA_TARGETS.isometric);
    camera.lookAt(0, 0.2, 0);
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: "high-performance"
      });
    } catch {
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();
    const hemiLight = new THREE.HemisphereLight(9684477, 1973067, 0.85);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);
    const keyLight = new THREE.DirectionalLight(16775149, 2.4);
    keyLight.position.set(5.5, 7.5, 5);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 20;
      const d = 4.5;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -5e-4;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(3900150, 1.35);
    fillLight.position.set(-5, 3.2, -3.5);
    scene.add(fillLight);
    const rimLight = new THREE.PointLight(8141549, 2.1, 14, 1.8);
    rimLight.position.set(0, 2.8, -4.2);
    scene.add(rimLight);
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(0, -1.35, 0);
    scene.add(pedestalGroup);
    const basePlinthGeo = new THREE.CylinderGeometry(2.35, 2.55, 0.16, 48);
    const basePlinthMat = new THREE.MeshStandardMaterial({
      color: 988970,
      metalness: 0.75,
      roughness: 0.32
    });
    const basePlinth = new THREE.Mesh(basePlinthGeo, basePlinthMat);
    basePlinth.position.y = -0.08;
    basePlinth.receiveShadow = true;
    pedestalGroup.add(basePlinth);
    const trimRingGeo = new THREE.TorusGeometry(2.22, 0.022, 16, 72);
    const trimRingMat = new THREE.MeshStandardMaterial({
      color: 3900150,
      metalness: 0.85,
      roughness: 0.18,
      emissive: 1920728,
      emissiveIntensity: 0.35
    });
    const trimRing = new THREE.Mesh(trimRingGeo, trimRingMat);
    trimRing.rotation.x = Math.PI / 2;
    trimRing.position.y = 0.02;
    pedestalGroup.add(trimRing);
    const coreAssembly = new THREE.Group();
    coreAssembly.position.set(0, 0.15, 0);
    scene.add(coreAssembly);
    const nucleusGeo = new THREE.OctahedronGeometry(0.68, 2);
    const nucleusMat = new THREE.MeshPhysicalMaterial({
      color: 2450411,
      metalness: 0.92,
      roughness: 0.16,
      clearcoat: 0.8,
      emissive: 1981066,
      emissiveIntensity: 0.28
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    nucleusMesh.castShadow = true;
    nucleusMesh.userData = { label: "01 \xB7 Core Logic & API Engine" };
    coreAssembly.add(nucleusMesh);
    const glassShellGeo = new THREE.BoxGeometry(1.48, 1.48, 1.48);
    const glassShellMat = new THREE.MeshPhysicalMaterial({
      color: 9684477,
      metalness: 0.08,
      roughness: 0.08,
      transmission: isSoftwareGl ? 0 : 0.9,
      transparent: true,
      opacity: isSoftwareGl ? 0.32 : 1,
      ior: 1.52,
      thickness: 1.2,
      clearcoat: 1,
      depthWrite: false
    });
    const glassShellMesh = new THREE.Mesh(glassShellGeo, glassShellMat);
    glassShellMesh.renderOrder = 2;
    glassShellMesh.userData = { label: "02 \xB7 Responsive UI/UX Interface Layer" };
    coreAssembly.add(glassShellMesh);
    const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.52, 1.52, 1.52));
    const edgeMat = new THREE.LineBasicMaterial({
      color: 6333946,
      transparent: true,
      opacity: 0.65
    });
    const edgeFrame = new THREE.LineSegments(edgeGeo, edgeMat);
    coreAssembly.add(edgeFrame);
    const orbitOneGeo = new THREE.TorusGeometry(1.58, 0.038, 20, 84);
    const orbitOneMat = new THREE.MeshStandardMaterial({
      color: 6333946,
      metalness: 0.88,
      roughness: 0.22
    });
    const orbitOneMesh = new THREE.Mesh(orbitOneGeo, orbitOneMat);
    orbitOneMesh.rotation.set(Math.PI / 2.8, 0.35, 0);
    orbitOneMesh.castShadow = true;
    orbitOneMesh.userData = { label: "03 \xB7 Full-Stack Web Application Pipeline" };
    coreAssembly.add(orbitOneMesh);
    const orbitTwoGeo = new THREE.TorusGeometry(1.92, 0.03, 18, 84);
    const orbitTwoMat = new THREE.MeshStandardMaterial({
      color: 9133302,
      metalness: 0.82,
      roughness: 0.28
    });
    const orbitTwoMesh = new THREE.Mesh(orbitTwoGeo, orbitTwoMat);
    orbitTwoMesh.rotation.set(-Math.PI / 3.1, -0.45, 0.2);
    orbitTwoMesh.userData = { label: "04 \xB7 Applied AI & Automation Workflows" };
    coreAssembly.add(orbitTwoMesh);
    const capGeo = new THREE.CylinderGeometry(0.62, 0.78, 0.14, 6);
    const capMat = new THREE.MeshStandardMaterial({
      color: 1976635,
      metalness: 0.85,
      roughness: 0.25
    });
    const topCap = new THREE.Mesh(capGeo, capMat);
    topCap.position.set(0, 0.96, 0);
    topCap.userData = { label: "05 \xB7 Cloud Deployment & Security Shield" };
    coreAssembly.add(topCap);
    const bottomCap = new THREE.Mesh(capGeo, capMat);
    bottomCap.rotation.x = Math.PI;
    bottomCap.position.set(0, -0.96, 0);
    bottomCap.userData = { label: "06 \xB7 Database & Persistent Storage Foundation" };
    coreAssembly.add(bottomCap);
    const nodeCount = 24;
    const nodeGeo = new THREE.OctahedronGeometry(0.065, 0);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 9684477,
      metalness: 0.7,
      roughness: 0.2
    });
    const instancedNodes = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
    const dummy = new THREE.Object3D();
    const nodeColor = new THREE.Color();
    for (let i = 0; i < nodeCount; i++) {
      const angle = i / nodeCount * Math.PI * 2;
      const radius = i % 2 === 0 ? 1.58 : 1.92;
      const yOffset = Math.sin(angle * 2) * 0.42;
      dummy.position.set(
        Math.cos(angle) * radius,
        yOffset,
        Math.sin(angle) * radius
      );
      const scale = 0.85 + i % 3 * 0.12;
      dummy.scale.setScalar(scale);
      dummy.rotation.set(angle, angle * 0.5, 0);
      dummy.updateMatrix();
      instancedNodes.setMatrixAt(i, dummy.matrix);
      nodeColor.setHex(i % 2 === 0 ? 6333946 : 10980346);
      instancedNodes.setColorAt(i, nodeColor);
    }
    instancedNodes.instanceMatrix.needsUpdate = true;
    if (instancedNodes.instanceColor) instancedNodes.instanceColor.needsUpdate = true;
    instancedNodes.computeBoundingSphere();
    coreAssembly.add(instancedNodes);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.1, 0);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 8.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    const cancelCameraTransition = () => {
      cameraTargetPosRef.current = null;
    };
    controls.addEventListener("start", cancelCameraTransition);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const inspectableMeshes = [
      nucleusMesh,
      glassShellMesh,
      orbitOneMesh,
      orbitTwoMesh,
      topCap,
      bottomCap
    ];
    const handlePointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(inspectableMeshes, false);
      if (hits.length > 0 && hits[0].object.userData?.label) {
        setSelectedLayerLabel(String(hits[0].object.userData.label));
      }
    };
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    let currentExplosion = 0;
    let frameId = 0;
    let isDisposed = false;
    const clock = new THREE.Clock();
    function afterDraw(cb) {
      const gl = renderer.getContext();
      if (gl && typeof gl.fenceSync === "function") {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) return;
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
      if (isDisposed) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      currentExplosion = THREE.MathUtils.damp(
        currentExplosion,
        targetExplosionRef.current,
        5.5,
        dt
      );
      topCap.position.y = 0.96 + currentExplosion * 0.52;
      bottomCap.position.y = -0.96 - currentExplosion * 0.52;
      const shellScale = 1 + currentExplosion * 0.16;
      glassShellMesh.scale.setScalar(shellScale);
      edgeFrame.scale.setScalar(shellScale);
      nucleusMesh.rotation.y = elapsed * 0.45;
      nucleusMesh.rotation.x = Math.sin(elapsed * 0.6) * 0.22;
      glassShellMesh.rotation.y = -elapsed * 0.18;
      edgeFrame.rotation.y = -elapsed * 0.18;
      orbitOneMesh.rotation.z = elapsed * 0.32;
      orbitTwoMesh.rotation.z = -elapsed * 0.26;
      instancedNodes.rotation.y = elapsed * 0.15;
      if (cameraTargetPosRef.current) {
        camera.position.x = THREE.MathUtils.damp(
          camera.position.x,
          cameraTargetPosRef.current.x,
          5,
          dt
        );
        camera.position.y = THREE.MathUtils.damp(
          camera.position.y,
          cameraTargetPosRef.current.y,
          5,
          dt
        );
        camera.position.z = THREE.MathUtils.damp(
          camera.position.z,
          cameraTargetPosRef.current.z,
          5,
          dt
        );
        if (camera.position.distanceTo(cameraTargetPosRef.current) < 0.03) {
          cameraTargetPosRef.current = null;
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
    requestRenderRef.current = () => {
    };
    tick();
    const handleResize = () => {
      if (!container || isDisposed) return;
      const newW = Math.max(container.clientWidth, 300);
      const newH = Math.max(container.clientHeight, compact ? 390 : 460);
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener("resize", handleResize);
      controls.removeEventListener("start", cancelCameraTransition);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      controls.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) {
          obj.geometry.dispose();
        }
        const mat = obj.material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => m.dispose());
        } else if (mat) {
          mat.dispose();
        }
      });
      envTarget.dispose();
      renderer.dispose();
    };
  }, [compact, isDark]);
  return <div className="relative w-full h-full min-h-[390px] select-none overflow-hidden rounded-[26px] sm:rounded-[32px]">
      {
    /* Dedicated WebGL Mount Container */
  }
      <div
    ref={canvasMountRef}
    className="w-full h-full min-h-[390px] cursor-grab active:cursor-grabbing"
    aria-label="Interactive 3D Lovanstrix Technology Core"
  />

      {
    /* Minimal Top-Left Specification Badge */
  }
      <div className="pointer-events-none absolute top-3.5 left-4 z-10 inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-[#0b132b]/90 px-3 py-1.5 text-[11px] font-medium text-slate-200">
        <span className="font-mono text-blue-400">3D CORE</span>
        <span className="text-slate-500">·</span>
        <span className="truncate max-w-[230px] sm:max-w-[300px]">{selectedLayerLabel}</span>
      </div>

      {
    /* Collapsible Unified Bottom Control Dock */
  }
      <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 w-[92%] max-w-[460px] flex flex-col items-center">
        <button
    type="button"
    onClick={() => setDockCollapsed((prev) => !prev)}
    className="mb-1 inline-flex items-center gap-1 rounded-t-md border border-b-0 border-slate-700/80 bg-[#0b132b] px-2.5 py-1 text-[10px] font-medium text-slate-300 hover:text-white transition-colors"
    aria-expanded={!dockCollapsed}
  >
          {dockCollapsed ? <>
              <ChevronUp className="h-3 w-3 text-blue-400" />
              <span>Show 3D Controls</span>
            </> : <>
              <ChevronDown className="h-3 w-3 text-blue-400" />
              <span>Hide Controls</span>
            </>}
        </button>

        {!dockCollapsed && <div className="w-full rounded-xl border border-slate-700/90 bg-[#0b132b]/95 px-3 py-2 shadow-lg flex flex-wrap items-center justify-between gap-2 text-[11px]">
            {
    /* Exploded View Toggle */
  }
            <button
    type="button"
    onClick={() => setCoreMode((prev) => prev === "unified" ? "exploded" : "unified")}
    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold transition-colors ${coreMode === "exploded" ? "bg-blue-600 text-white" : "bg-slate-800/90 text-slate-200 hover:bg-slate-700"}`}
  >
              <Layers className="h-3.5 w-3.5" />
              <span>{coreMode === "exploded" ? "Unified Core" : "Explode Layers"}</span>
            </button>

            {
    /* Camera Angle Presets */
  }
            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-900/90 p-1 border border-slate-800">
              <Eye className="h-3 w-3 text-slate-400 ml-1 mr-0.5" />
              {["isometric", "front", "top"].map((preset) => <button
    key={preset}
    type="button"
    onClick={() => setCameraPreset(preset)}
    className={`rounded px-2 py-1 text-[10px] font-medium capitalize transition-colors ${cameraPreset === preset ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white"}`}
  >
                  {preset}
                </button>)}
            </div>

            {
    /* Reset View */
  }
            <button
    type="button"
    onClick={() => {
      setCoreMode("unified");
      setCameraPreset("isometric");
      setSelectedLayerLabel("Web \xB7 Apps \xB7 AI Technology Core");
    }}
    className="inline-flex items-center gap-1 rounded-lg bg-slate-800/90 px-2.5 py-1.5 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
    title="Reset 3D view"
  >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>}
      </div>
    </div>;
};
var stdin_default = Interactive3DCore;
export {
  Interactive3DCore,
  stdin_default as default
};
