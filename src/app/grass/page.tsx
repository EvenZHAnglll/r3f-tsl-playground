'use client'
import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, MeshPhysicalNodeMaterial, WebGPURenderer } from 'three/webgpu'
import { attribute, cameraWorldMatrix, clamp, distance, div, mix, modelWorldMatrix, normalize, PI, positionLocal, sin, smoothstep, sub, time, uniform, uv, vec3, vec4 } from "three/tsl";
import { useControls } from "leva";

function createProceduralGeometry() {
    const geometry = new BufferGeometry();

    const posArray = [];
    const indArray = [];



    for (let index = 0; index < 1000; index++) {
        const x = (Math.random() - 0.5) * 10;
        const y = (Math.random() - 0.5) * 10;
        posArray.push(x, 0, y);
        posArray.push(x, 0, y);
        posArray.push(x, 0.5, y);
        indArray.push(index * 3, index * 3 + 1, index * 3 + 2);
    }

    const positions = new Float32Array(posArray);
    const indices = new Uint16Array(indArray);

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('index', new BufferAttribute(indices, 1));

    return geometry;
}


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
        // material.positionNode = positionLocal.add(vec3(0, elevation, 0));

        const cameraRight = normalize(vec3(cameraWorldMatrix[0].xyz)).mul(-1)
        const index = attribute('index', 'float').mod(3)
        const scale = sin(div(Math.PI, 1.5).mul(index.sub(2)))
        material.positionNode = modelPosition.add(cameraRight.mul(scale).mul(0.1))


        // fragment
        material.normalNode = vec3(elevation, 1.0, elevation).normalize();

        const color1 = vec3(0, 1, 0);
        const color2 = vec3(0.4, 1, 0);
        material.colorNode = mix(color1, color2, modelPosition.y.mul(2));


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
                    geometry={createProceduralGeometry()}
                    material={customMaterial}
                />

                <OrbitControls makeDefault />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
