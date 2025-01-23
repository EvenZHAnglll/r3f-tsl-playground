'use client'
import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, MeshPhysicalNodeMaterial, WebGPURenderer } from 'three/webgpu'
import { distance, mix, modelWorldMatrix, positionLocal, sin, smoothstep, sub, time, uniform, uv, vec3, vec4 } from "three/tsl";
import { useControls } from "leva";

function createProceduralGeometry() {
  const geometry = new BufferGeometry();

  const positions = new Float32Array([
    0, 0, 0,
    0, 0, 1,
    1, 0, 0
  ]);
  const indices = new Uint16Array([0, 1, 2]);

  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('index', new BufferAttribute(indices, 1));

  return geometry;
}

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


    // fragment
    material.normalNode = vec3(elevation, 1.0, elevation).normalize();
    const color1 = vec3(uv(), sub(1, elevation));
    const color2 = vec3(sub(1, elevation), uv());
    material.colorNode = mix(color1, color2, 0.0);
    material.colorNode = vec3(elevation.add(0.5).mul(0.4))

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
          <boxGeometry args={[8, 0.5, 8, 512, 2, 512]} />
        </mesh>

        <mesh
          geometry={createProceduralGeometry()}
          material={customMaterial}
          position={[0, 1, 0]}
        />

        <OrbitControls makeDefault />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
