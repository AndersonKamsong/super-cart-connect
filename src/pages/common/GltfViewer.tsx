import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function GltfViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const models = location.state?.models || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelSize, setModelSize] = useState<THREE.Vector3 | null>(null);

  const mountRef = useRef<HTMLDivElement>(null);

  const loadModel = useCallback(
    (scene: THREE.Scene, camera: THREE.PerspectiveCamera, controls: OrbitControls, renderer: THREE.WebGLRenderer) => {
      if (!models.length) return;

      const loader = new GLTFLoader();
      const modelPath = `${API_BASE_URL}/../uploads/products/models3d/${models[currentIndex].url}`;

      setLoading(true);
      setError(null);

      loader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;
          scene.clear(); // clear old objects before adding new one
          
          // Re-add lights
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
          const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
          directionalLight1.position.set(1, 1, 1);
          const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
          directionalLight2.position.set(-1, -1, -1);
          scene.add(ambientLight, directionalLight1, directionalLight2);

          scene.add(model);

          // Fit camera to model
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          setModelSize(size);

          model.position.sub(center);
          camera.position.z = size.length() * 1.5;
          controls.target.copy(center);
          controls.update();

          setLoading(false);
        },
        undefined,
        (err) => {
          console.error("Error loading model:", err);
          setError(`Failed to load model: ${modelPath}`);
          setLoading(false);
        }
      );
    },
    [models, currentIndex]
  );

  useEffect(() => {
    if (!id || !mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });

    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI;
    controls.minDistance = 0.5;
    controls.maxDistance = 10;

    // Load first model
    loadModel(scene, camera, controls, renderer);

    // Handle resize
    const handleResize = () => {
      camera.aspect = mountRef.current!.clientWidth / mountRef.current!.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current!.clientWidth, mountRef.current!.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Render loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      controls.dispose();
      renderer.dispose();
    };
  }, [id, loadModel]);

  // Reload model when index changes
  useEffect(() => {
    if (!mountRef.current) return;
    const canvas = mountRef.current.querySelector("canvas");
    if (!canvas) return; // not initialized yet
  }, [currentIndex, loadModel]);

  const handleTakeScreenshot = () => {
    const canvas = mountRef.current?.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = `product-${id}-model-${currentIndex}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className="relative w-full h-[80vh]">
      {/* Back button */}
      <Button
        variant="outline"
        className="absolute top-4 left-4 z-10"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Product
      </Button>

      {/* Model info */}
      {modelSize && (
        <div className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-md text-sm">
          <p>
            Dimensions: {modelSize.x.toFixed(2)} × {modelSize.y.toFixed(2)} ×{" "}
            {modelSize.z.toFixed(2)}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {models[currentIndex]?.name}
          </p>
        </div>
      )}

      {/* Navigation between models */}
      {models.length > 1 && (
        <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 z-10">
          <Button
            onClick={() =>
              setCurrentIndex((prev) => (prev === 0 ? models.length - 1 : prev - 1))
            }
            variant="secondary"
          >
            ⬅ Prev
          </Button>
          <Button
            onClick={() =>
              setCurrentIndex((prev) => (prev === models.length - 1 ? 0 : prev + 1))
            }
            variant="secondary"
          >
            Next ➡
          </Button>
        </div>
      )}

      {/* Screenshot button */}
      <Button
        variant="default"
        className="absolute bottom-4 right-4 z-10"
        onClick={handleTakeScreenshot}
      >
        Take Screenshot
      </Button>

      {/* Controls help */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/80 p-2 rounded-md text-sm">
        <p>Mouse: Rotate | Scroll: Zoom | Right-click: Pan</p>
      </div>

      {/* Viewer */}
      <div ref={mountRef} className="w-full h-full bg-gray-100" />

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>Loading 3D model...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
          <div className="text-center p-4">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => setError(null)}>Retry</Button>
          </div>
        </div>
      )}
    </div>
  );
}
