'use client'
import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import { MeshPhysicalNodeMaterial, WebGPURenderer } from 'three/webgpu'
import { cos, distance, float, mix, modelWorldMatrix, positionLocal, sin, smoothstep, sub, time, uniform, uv, vec3, vec4 } from "three/tsl";
import { useControls } from "leva";



// inspired by https://stackblitz.com/edit/tiny-tsl-example-mlxh7s?file=src%2FApp.tsx
export default function Home() {
  const uniforms = useMemo(
    () => ({
      frequencyX: uniform(10),
      frequencyY: uniform(10),
    }),
    []
  );

  const customMaterial = useMemo(() => {
    const material = new MeshPhysicalNodeMaterial();

    // vertex
    const modelPosition = modelWorldMatrix.mul(vec4(positionLocal, 1));
    const elevation = sin(modelPosition.x.mul(uniforms.frequencyX).sub(time))
      .mul(0.2)
      .add(sin(modelPosition.z.mul(uniforms.frequencyY).sub(time)).mul(0.2))
      .mul(sub(1, smoothstep(0, 4, distance(modelPosition.xz, vec3(0, 0, 0)))));
    material.positionNode = positionLocal.add(vec3(0, elevation, 0));

    const norX = cos(modelPosition.x.mul(uniforms.frequencyX).sub(time))
      .mul(0.2)
      .mul(sub(1, smoothstep(0, 4, distance(modelPosition.xz, vec3(0, 0, 0)))))
    const norY = cos(modelPosition.z.mul(uniforms.frequencyY).sub(time))
      .mul(0.2)
      .mul(sub(1, smoothstep(0, 4, distance(modelPosition.xz, vec3(0, 0, 0)))))


    // fragment
    material.normalNode = vec3(norX, 1.0, norY).normalize();
    const color1 = vec3(uv(), sub(1, elevation));
    const color2 = vec3(sub(1, elevation), uv());
    material.colorNode = mix(color1, color2, 0.0);
    material.colorNode = vec3(elevation.add(0.5).mul(0.4))
    material.roughnessNode = float(1)

    return material;
  }, [uniforms]);

  useControls({
    frequency: {
      value: [5, 5],
      onChange: (value) => {
        uniforms.frequencyX.value = value[0];
        uniforms.frequencyY.value = value[1];
      },
    },
  });

  return (
    <div className="bg-gray-800 w-full h-full" >
      <Canvas
        camera={{ position: [6, 5, 10], fov: 40 }}
        gl={(canvas) => {
          const renderer = new WebGPURenderer({
            canvas: canvas as HTMLCanvasElement,
          });
          return renderer;
        }}
      >
        <color attach="background" args={['#fef4ef']} />
        <ambientLight />
        <directionalLight castShadow intensity={1.6} position={[0, 1000, 1000]} />

        <mesh
          material={customMaterial}
        >
          <boxGeometry args={[8, 0.01, 8, 512, 2, 512]} />
        </mesh>

        <OrbitControls makeDefault />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
