import React, { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

function Light({ position = [0, 0, 0], color = "white" ,emissive = 'white' }) {
  const lightRef = useRef();

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.rotation.y = Math.sin(performance.now() * 0.0005) * 0.3;
    }
  });

  return (
    <group position={position}>
      <rectAreaLight
        ref={lightRef}
        width={1.5}
        height={7}
        color={"white"}
        intensity={100}
        position={[0, 0, -0.1]}
        lookAt={[0, 0, 1]}
      />
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[1.5, 7]} />
        <meshPhysicalMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}




export default function Plane({}) {
  return (
    <>
      {/* 3 vertical glowing lights */}
      <group>
        <Light position={[-2.5, 0, -1.5]} color="white" emissive="white" />
        <Light position={[0, 0, -1.5]} color="white" emissive="white" />
        <Light position={[2.5, 0, -1.5]} color="white" emissive="white" />
      </group>

      {/* 🔥 Bloom effect right here */}
      <EffectComposer>
        <Bloom
          intensity={0.002} // glow strength
          luminanceThreshold={1.} // how bright before it glows
          luminanceSmoothing={1.} // smooth transition
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}
