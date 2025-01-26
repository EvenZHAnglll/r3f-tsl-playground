'use client'
import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo, useState } from "react";
import { BufferAttribute, BufferGeometry, Color, MeshPhysicalNodeMaterial, WebGPURenderer } from 'three/webgpu'
import {
    attribute,
    cameraWorldMatrix,
    div,
    mix,
    modelWorldMatrix,
    normalize,
    positionLocal,
    sin,
    uniform,
    vec3,
    vec4
} from "three/tsl";
import { useControls } from "leva";


// inspired by https://stackblitz.com/edit/tiny-tsl-example-mlxh7s?file=src%2FApp.tsx
export default function Home() {

    const [col, setCol] = useState('#070');

    const uniforms = useMemo(
        () => ({
            color_base: uniform(new Color('#070')),
            color_top: uniform(new Color('#629033')),
        }),
        []
    );

    const { count } = useControls({
        count: {
            value: 10000,
            min: 1,
            max: 10000,
        },
        color_base: {
            value: '#070',
            onChange: (value) => {
                console.log(value)
                setCol(value);
                uniforms.color_base.value = new Color(value);
            }
        },
        color_top: {
            value: '#629033',
            onChange: (value) => {
                console.log(value)
                uniforms.color_top.value = new Color(value);
            }
        }
    });

    const createProceduralGeometry = useMemo(() => {
        const geometry = new BufferGeometry();

        const posArray = [];
        const indArray = [];



        for (let index = 0; index < count; index++) {
            const x = (Math.random() - 0.5) * 10;
            const y = (Math.random() - 0.5) * 10;
            posArray.push(x, 0, y);
            posArray.push(x, 0, y);
            posArray.push(x, 0.3, y);
            indArray.push(index * 3, index * 3 + 1, index * 3 + 2);
        }

        const positions = new Float32Array(posArray);
        const indices = new Uint16Array(indArray);

        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        geometry.setAttribute('index', new BufferAttribute(indices, 1));

        return geometry;
    }, [count]);

    const customMaterial = useMemo(() => {
        const material = new MeshPhysicalNodeMaterial();

        // vertex
        const modelPosition = modelWorldMatrix.mul(vec4(positionLocal, 1));

        const cameraRight = normalize(vec3(cameraWorldMatrix[0].xyz)).mul(-1)
        // const cameraForward = normalize(vec3(cameraWorldMatrix[2].xyz))
        const index = attribute('index', 'float').mod(3)
        const scale = sin(div(Math.PI, 1.5).mul(index.sub(2)))
        material.positionNode = modelPosition.add(cameraRight.mul(scale).mul(0.1))


        // fragment
        material.normalNode = vec3(0, 1, 0).transformDirection(cameraWorldMatrix);

        const color1 = uniforms.color_base;
        const color2 = uniforms.color_top;
        const a = positionLocal.y.mul(3)
        material.colorNode = mix(color1, color2, a);

        return material;
    }, [uniforms]);






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
                    geometry={createProceduralGeometry}
                    material={customMaterial}
                />
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[10, 0.01, 10, 32, 2, 32]} />
                    <meshPhysicalMaterial color={col} />
                </mesh>


                <OrbitControls makeDefault />
                <Environment preset="city" background />
            </Canvas>
        </div>
    );
}
