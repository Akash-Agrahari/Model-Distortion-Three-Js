import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import { Mesh, MeshPhysicalMaterial } from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import * as THREE from "three";
import vertex from "../shaders/vertex.glsl";
import gsap from "gsap";

function Marble() {
  const { scene, nodes } = useGLTF("/marble.glb");
  const { raycaster, camera } = useThree();
  const mouse = useRef(new THREE.Vector3());
  const meshRef = useRef();

  const [mouseMove, setMouseMove] = useState(false);

  // 🔹 uniforms should be inside component + memoized
  const uniforms = useMemo(
    () => ({
      uMouse: { value: new THREE.Vector3(999, 999, 999) },
      uRadius: { value: 0.3 },
      uStrength: { value: 1 }, // fixed typo
      uLerp: { value: 0.0 },
    }),
    []
  );

  // 🔹 build outer geometry only once
  const model = useMemo(() => {
    const meshNode = Object.values(nodes).find((n) => n instanceof Mesh);
    if (!meshNode) return null;

    const geo = meshNode.geometry.toNonIndexed();
    const pos = geo.attributes.position;
    const faceCount = pos.count / 3;
    const centers = new Float32Array(pos.count * 3);

    const clusterIds = new Float32Array(pos.count);

    for (let i = 0; i < faceCount; i++) {
      const cluster = Math.floor(i / 1000);
      for (let j = 0; j < 3; j++) {
        clusterIds[i * 3 + j] = cluster;
      }
    }

    for (let i = 0; i < faceCount; i++) {
      const v1 = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 0);
      const v2 = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 1);
      const v3 = new THREE.Vector3().fromBufferAttribute(pos, i * 3 + 2);

      const center = new THREE.Vector3()
        .add(v1)
        .add(v2)
        .add(v3)
        .divideScalar(3);

      for (let j = 0; j < 3; j++) {
        centers[(i * 3 + j) * 3 + 0] = center.x;
        centers[(i * 3 + j) * 3 + 1] = center.y;
        centers[(i * 3 + j) * 3 + 2] = center.z;
      }
    }

    geo.setAttribute("aCenter", new THREE.BufferAttribute(centers, 3));
    geo.setAttribute("aCluster", new THREE.BufferAttribute(clusterIds, 1));

    return geo;
  }, [nodes]);

  // 🔹 mouse move listener
  useEffect(() => {
    const handleMouseMove = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      setMouseMove(true);
    };
    window.addEventListener("pointermove", handleMouseMove);
    return () => window.removeEventListener("pointermove", handleMouseMove);
  }, []);

  // 🔹 per-frame intersection
  useFrame(() => {
    if (!mouseMove || !meshRef.current) return;

    raycaster.setFromCamera(mouse.current, camera);
    const intersect = raycaster.intersectObject(meshRef.current);

    if (intersect.length > 0) {
      const point = intersect[0].point.clone();
      meshRef.current.worldToLocal(point);

      uniforms.uMouse.value.copy(point);

      // smooth show
      gsap.to(uniforms.uLerp, {
        value: 1.0,
        duration: 0.5,
        ease: "sine.out",
      });
    } else {
      // smooth hide
      gsap.to(uniforms.uLerp, {
        value: 0.0,
        duration: 0.5,
        ease: "sine.out",
      });
    }
  });

  // 🔹 apply gold to inside model
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = new MeshPhysicalMaterial({
          color: "#FFD700",
          metalness: 1,
          roughness: 0.4,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
        });
      }
    });
    scene.position.set(0, -0.5, 0);
  }, [scene]);

  return (
    <group>
      {/* Inside = original model */}
      <primitive object={scene} />

      {/* Outside = duplicate shell */}
      {model && (
        <mesh
          geometry={model}
          scale={1.0}
          ref={meshRef}
          position={[0, -0.5, 0]}
        >
          <CustomShaderMaterial
            baseMaterial={THREE.MeshPhysicalMaterial}
            vertexShader={vertex}
            uniforms={uniforms}
            color={"black"}
            metalness={1.0}
            // wireframe
            roughness={0.25}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            polygonOffset={true}
            polygonOffsetFactor={-1}
            flatShading={true}
          />
        </mesh>
      )}
    </group>
  );
}


useGLTF.preload("/marble.glb");

function App() {
  return (
    <Canvas
      style={{ height: "100vh", width: "100vw", backgroundColor: "black" }}
      camera={{ position: [1, 0.4, 1.3] }}
    >
      <Environment preset="city" />
      <OrbitControls />
      <Marble />
    </Canvas>
  );
}

export default App;
