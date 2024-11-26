import * as React from 'react';

export interface OpenCvContextType {
    loaded: boolean;
    cv: any; // You can replace `any` with the actual type of the OpenCV instance if known
}

const OpenCvContext = React.createContext<OpenCvContextType | undefined>(undefined);

const { Consumer: OpenCvConsumer, Provider } = OpenCvContext;

export { OpenCvConsumer, OpenCvContext };

const scriptId = 'opencv-react';
const moduleConfig: {
    wasmBinaryFile: string;
    usingWasm: boolean;
    onRuntimeInitialized?: () => void;
} = {
    wasmBinaryFile: 'opencv_js.wasm',
    usingWasm: true
};

export const OpenCvProvider: React.FC<{
    openCvVersion?: string;
    openCvPath?: string;
    children: React.ReactNode;
}> = ({ openCvVersion = '3.4.16', openCvPath = '', children }) => {
    const [cvInstance, setCvInstance] = React.useState<OpenCvContextType>({
        loaded: false,
        cv: undefined
    });

    React.useEffect(() => {
        // @ts-ignore
        if (document.getElementById(scriptId) || window.cv) {
            // @ts-ignore
            setCvInstance({ loaded: true, cv: window.cv });
            return;
        }

        moduleConfig.onRuntimeInitialized = () => {
            // @ts-ignore
            setCvInstance({ loaded: true, cv: window.cv });
        };

        // @ts-ignore
        window.Module = moduleConfig;

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = openCvPath || `https://docs.opencv.org/${openCvVersion}/opencv.js`;
        // @ts-ignore
        script.nonce = true;
        script.defer = true;
        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);

            // @ts-ignore
            delete window.Module;
        };
    }, [openCvPath, openCvVersion]);

    return <Provider value={cvInstance}>{children}</Provider>;
};
