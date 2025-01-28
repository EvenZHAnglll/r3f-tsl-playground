'use client'
import { Environment, OrbitControls } from "@react-three/drei";
import WebGPUCanvas from "@/components/WebGPUCanvas";
import { useMemo, useState } from "react";
import { BufferAttribute, BufferGeometry, Color, MeshPhysicalNodeMaterial, Vector3 } from 'three/webgpu'
import {
    attribute,
    bool,
    cameraWorldMatrix,
    distance,
    div,
    float,
    hash,
    mix,
    modelWorldMatrix,
    normalize,
    positionLocal,
    sin,
    smoothstep,
    step,
    sub,
    time,
    uniform,
    vec3,
    vec4
} from "three/tsl";
import { useControls } from "leva";



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
                setCol(value);
                uniforms.color_base.value = new Color(value);
            }
        },
        color_top: {
            value: '#629033',
            onChange: (value) => {
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
            const position = new Vector3(x, 0, y);
            if (position.length() > 5) continue;
            posArray.push(x, 0, y);
            posArray.push(x, 0, y);
            posArray.push(x, 0, y);
            indArray.push(index * 3, index * 3 + 1, index * 3 + 2);
        }

        const positions = new Float32Array(posArray);
        const indices = new Uint16Array(indArray);

        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        geometry.setAttribute('index', new BufferAttribute(indices, 1));

        return geometry;
    }, [count]);

    const grassMaterial = useMemo(() => {
        const material = new MeshPhysicalNodeMaterial();

        // vertex
        const modelPosition = modelWorldMatrix.mul(vec4(positionLocal, 1));

        const cameraRight = normalize(vec3(cameraWorldMatrix[0].xyz)).mul(-1)
        // const cameraForward = normalize(vec3(cameraWorldMatrix[2].xyz))
        const index = attribute('index', 'float').mod(3)
        const scale = sin(div(Math.PI, 1.5).mul(index.sub(2)))
        const top = step(1.5, index)
        const topOffset = vec3(hash(modelPosition.x), hash(modelPosition.y), hash(modelPosition.z)).sub(0.5).mul(0.1).add(vec3(0, 0.3, 0)).mul(top)
        const rs = modelPosition.mul(2)
        const windOffset = vec3(
            sin(rs.x.add(time)),
            1,
            sin(rs.z.add(time))
        ).normalize().mul(0.06).mul(top)
        material.positionNode = modelPosition.add(cameraRight.mul(scale).mul(0.1)).add(topOffset).add(windOffset);


        // fragment
        material.normalNode = vec3(0, 1, 0).transformDirection(cameraWorldMatrix);

        const color1 = uniforms.color_base;
        const color2 = uniforms.color_top;
        const a = positionLocal.y.mul(3)
        material.colorNode = mix(color1, color2, a);

        material.specularIntensityNode = float(0.6);
        material.roughnessNode = float(0.9);

        material.castShadowNode = bool(true);

        return material;
    }, [uniforms]);

    const groundMaterial = useMemo(() => {
        const material = new MeshPhysicalNodeMaterial();
        material.transparent = true;
        material.alphaHash = true;
        material.colorNode = uniforms.color_base;

        const dis = distance(positionLocal, vec3(0, 0, 0))
        material.opacityNode = sub(1, smoothstep(5, 6, dis))

        material.specularIntensityNode = float(0.6);
        material.roughnessNode = float(0.9);

        return material;
    }, [uniforms])




    return (
        <div className="bg-gray-800 w-full h-full" >
            <WebGPUCanvas>
                <OrbitControls
                    makeDefault
                    // minPolarAngle={-2}
                    minPolarAngle={0.7}
                    maxPolarAngle={1.3}
                />
                <color attach="background" args={['#fef4ef']} />
                <ambientLight />
                <directionalLight castShadow intensity={3.6} position={[20, 15, 10]} />

                <mesh
                    geometry={createProceduralGeometry}
                    material={grassMaterial}
                    receiveShadow
                />

                <mesh
                    position={[0, 0, 0]}
                    material={groundMaterial}
                    receiveShadow
                >
                    <boxGeometry args={[20, 0.01, 20, 32, 2, 32]} />
                    {/* <meshPhysicalMaterial color={col} opacity={0.5} transparent /> */}
                </mesh>

                <mesh castShadow>
                    <boxGeometry args={[1, 2, 1]} />
                    <meshPhysicalMaterial color={'#aa9999'} />
                </mesh>




                {/* <Environment preset="city" /> */}
            </WebGPUCanvas>
        </div>
    );
}
