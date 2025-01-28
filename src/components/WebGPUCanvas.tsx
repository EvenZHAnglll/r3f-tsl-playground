import { ReactNode, useState } from 'react'
import { Canvas } from '@react-three/fiber'

import { WebGPURenderer } from 'three/webgpu'

const WebGPUCanvas = ({ children }: { children: ReactNode }) => {

    const [frameloop, setFrameloop] = useState<'never' | 'always'>('never')

    return (
        <Canvas
            camera={{ position: [6, 5, 10], fov: 40 }}
            shadows
            frameloop={frameloop}
            gl={(canvas) => {
                const renderer = new WebGPURenderer({
                    canvas: canvas as HTMLCanvasElement,
                });
                renderer.init().then(() => setFrameloop('always'))
                return renderer;
            }}
        >
            {children}
        </Canvas>
    )
}

export default WebGPUCanvas