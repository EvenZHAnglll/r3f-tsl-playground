'use client'
import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo, useState } from "react";
import { extend, type ThreeElement } from '@react-three/fiber'
import { MeshBasicNodeMaterial, WebGPURenderer } from 'three/webgpu'
import { mix, modelWorldMatrix, positionLocal, sin, timerLocal, uv, vec3, vec4 } from "three/tsl";

extend({ MeshBasicNodeMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshBasicNodeMaterial: ThreeElement<typeof MeshBasicNodeMaterial>
  }
}
export default function Home() {
  const [frameloop, setFrameloop] = useState<'never' | 'always'>('never')

  const customMaterial = useMemo(() => {
    const material = new MeshBasicNodeMaterial();
    const time = timerLocal(1);

    // vertex
    const modelPosition = modelWorldMatrix.mul(vec4(positionLocal, 1));
    const elevation = sin(modelPosition.x.mul(1).sub(time))
      .mul(0.1)
      .add(sin(modelPosition.z.mul(1).sub(time)).mul(0.1));
    material.positionNode = positionLocal.add(vec3(0, 0, elevation));

    // fragment
    const color1 = vec3(uv(), 1.0);
    const color2 = vec3(1.0, uv());
    material.colorNode = mix(color1, color2, sin(time).mul(0.5).add(0.5));

    return material;
  }, []);

  return (
    <div className="bg-gray-800 w-full h-full" >
      <Canvas
        orthographic
        camera={{ position: [6, 5, 10], zoom: 60 }}
        frameloop={frameloop}
        flat
        gl={(canvas) => {
          const renderer = new WebGPURenderer({
            // @ts-expect-error whatever
            canvas,
            powerPreference: 'high-performance',
            antialias: true,
            alpha: true,
          })
          renderer.init().then(() => setFrameloop('always'))

          return renderer
        }}
      >
        <color attach="background" args={['#fef4ef']} />
        <ambientLight />
        <directionalLight castShadow intensity={0.6} position={[0, 1000, 1000]} />
        <mesh
          material={customMaterial}
          rotation-x={-Math.PI * 0.5}>
          <planeGeometry args={[10, 10, 512, 512]} />
        </mesh>
        <OrbitControls makeDefault />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
