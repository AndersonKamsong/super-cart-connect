import * as THREE from "three";
import { GLTFLoader } from "../../../node_modules/three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "../../../node_modules/three/examples/jsm/controls/OrbitControls.js";
// import { OrbitControls } from "../../../node_modules";

import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

export default function GltfViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelSize, setModelSize] = useState<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (!id) return;

    // Initialize scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current!.clientWidth / mountRef.current!.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: true
    });
    
    renderer.setSize(mountRef.current!.clientWidth, mountRef.current!.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current!.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI;
    controls.minDistance = 0.5;
    controls.maxDistance = 10;

    // Load model - IMPORTANT: Use correct path
    const loader = new GLTFLoader();
    const modelPath = `../../../public/A23D_Palm-Plant_GLTF-1K.gltf`;
    
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        console.log("model")
        console.log(model)
        
        // Calculate model dimensions
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        setModelSize(size);
        console.log(box)
        // Center model
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        
        // Auto-position camera
        camera.position.z = size.length() * 1.5;
        controls.target.copy(center);
        controls.update();
        
        setLoading(false);
      },
      (xhr) => {
        // Progress callback
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error("Error loading model:", error);
        setError(`Failed to load 3D model. Please ensure the file exists at: ${modelPath}`);
        setLoading(false);
      }
    );

    // Handle window resize
    const handleResize = () => {
      camera.aspect = mountRef.current!.clientWidth / mountRef.current!.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current!.clientWidth, mountRef.current!.clientHeight);
    };
    
    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      controls.dispose();
      renderer.dispose();
    };
  }, [id]);

  const handleTakeScreenshot = () => {
    if (!mountRef.current) return;
    
    const canvas = mountRef.current.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `product-${id}-3d-view.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="relative w-full h-[80vh]">
      {/* Back button */}
      <Button
        variant="outline"
        className="absolute top-4 left-4 z-10"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Product
      </Button>
      
      {/* Model info overlay */}
      {modelSize && (
        <div className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-md text-sm">
          <p>Dimensions: {modelSize.x.toFixed(2)} × {modelSize.y.toFixed(2)} × {modelSize.z.toFixed(2)}</p>
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
      
      {/* Main viewer */}
      <div 
        ref={mountRef} 
        className="w-full h-full bg-gray-100"
      />
      
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>Loading 3D model...</p>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
          <div className="text-center p-4">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}