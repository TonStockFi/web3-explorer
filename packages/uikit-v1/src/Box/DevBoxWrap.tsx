import React, { useState } from 'react';

export interface DevBoxProps {
    showClickOffset?: 1 | 0 | boolean;
    nodeOffsetX?: number;
    nodeOffsetY?: number;
    opacity?: number;
    hideNode?: 1 | 0;
    border?: 1 | 0;
    url: string;
    width?: number | string;
    height?: number | string;
}
interface DevBoxWrapProps {
    devBox: DevBoxProps;
    children?: React.ReactNode;
}

const DevBoxWrap = ({ devBox, children }: DevBoxWrapProps) => {
    const [offset, setOffset] = useState({ offsetX: 0, offsetY: 0 });
    const showOffset = devBox.showClickOffset && offset.offsetX && offset.offsetY;
    return (
        <div
            onClick={
                devBox.showClickOffset
                    ? e => {
                          const wrapper = e.currentTarget; // Get the wrapper element
                          const rect = wrapper.getBoundingClientRect(); // Get the wrapper's position and size

                          // Calculate the offset
                          const offsetX = e.clientX - rect.left; // Offset from the left
                          const offsetY = e.clientY - rect.top; // Offset from the top
                          console.debug(`offsetX=${offsetX} offsetY=${offsetY}`);
                          setOffset({ offsetX, offsetY });
                      }
                    : () => {
                          setOffset({ offsetX: 0, offsetY: 0 });
                      }
            }
            style={{
                width: devBox!.width || 360,
                height: devBox!.height || 800,
                position: 'relative',
                border: devBox.border ? '1px solid #e4e4e4' : undefined
            }}
        >
            <div
                style={{
                    opacity: devBox.opacity !== undefined ? devBox.opacity / 10 : 0.5,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundSize: 'cover',
                    backgroundImage: `url(${devBox!.url})`
                }}
            ></div>
            {!devBox.hideNode && (
                <div
                    style={{
                        position: 'absolute',
                        backgroundColor: devBox.showClickOffset ? 'blue' : undefined,
                        top: devBox.showClickOffset ? offset.offsetY : devBox.nodeOffsetY,
                        left: devBox.showClickOffset ? offset.offsetX : devBox.nodeOffsetX,
                        right: 0
                    }}
                >
                    {children}
                </div>
            )}

            {showOffset ? (
                <div
                    onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }}
                    style={{
                        borderRadius: 9,
                        background: 'red',
                        color: 'white',
                        margin: 0,
                        top: 0,
                        padding: 12,
                        display: 'inline',
                        position: 'absolute'
                    }}
                >
                    {`nodeOffsetX:${offset.offsetX}, nodeOffsetY:${offset.offsetY},`}
                </div>
            ) : null}
        </div>
    );
};
export default DevBoxWrap;
