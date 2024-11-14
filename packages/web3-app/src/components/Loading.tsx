import React from 'react';
import styled from 'styled-components';

const Block = styled.div`
    height: 100vh;

    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${props => props.theme.backgroundPage};
    color: ${props => props.theme.accentBlue};
`;

export const Loading = React.forwardRef<HTMLDivElement>(({}, ref) => {
    const size = '128px';
    return (
        <Block ref={ref}>
            <svg
                fill="none"
                width={size}
                height={size}
                viewBox="0 0 128 128"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs />
                <linearGradient
                    id="linear-gradient"
                    x1="591.1"
                    y1="661.1"
                    x2="642.3"
                    y2="569.6"
                    gradientUnits="userSpaceOnUse"
                    name="Layer %{number}"
                    style={{ zoom: 1 }}
                    data-layer-id="6380970463949"
                    gradientTransform="matrix(0.501235, 0, 0, 0.501235, -217.049974, -238.43236)"
                >
                    <stop offset="0" stopColor="#242430" />
                    <stop offset="1" stopColor="#737382" />
                </linearGradient>
                <linearGradient
                    id="linear-gradient-2"
                    x1="1053.2"
                    y1="661.1"
                    x2="1104.4"
                    y2="569.6"
                    gradientTransform="matrix(-0.501235, 0, 0, 0.501235, 575.602248, -238.43236)"
                    name="Layer %{number}"
                    style={{ zoom: 1 }}
                    data-layer-id="5555211163949"
                    xlinkHref="#linear-gradient"
                />
                <polygon
                    className="cls-1"
                    points="125.795 35.793 89.855 47.973 68.855 86.668 81.385 112.583 125.795 35.793"
                    name="Layer %{number}"
                    data-layer-id="9837132463950"
                    style={{ zoom: 1, fill: "url('#linear-gradient')" }}
                />
                <polygon
                    className="cls-2"
                    points="63.442 78.598 63.442 78.598 63.442 78.598 63.442 78.598"
                    name="Layer %{number}"
                    data-layer-id="2314768563950"
                    style={{ zoom: 1, fill: 'rgb(74, 115, 232)' }}
                />
                <polygon
                    className="cls-2"
                    points="63.442 20.855 63.442 20.855 63.442 20.855 63.442 20.855"
                    name="Layer %{number}"
                    data-layer-id="0696864663950"
                    style={{ zoom: 1, fill: 'rgb(74, 115, 232)' }}
                />
                <polygon
                    className="cls-5"
                    points="63.442 20.855 63.442 20.855 63.442 20.855 63.442 20.855"
                    name="Layer %{number}"
                    data-layer-id="2652663563950"
                    style={{ zoom: 1, fill: 'rgb(63, 99, 200)' }}
                />
                <polygon
                    className="cls-5"
                    points="63.442 78.598 63.442 78.598 63.442 78.598 63.442 78.598"
                    name="Layer %{number}"
                    data-layer-id="0597070363950"
                    style={{ zoom: 1, fill: 'rgb(63, 99, 200)' }}
                />
                <polygon
                    className="cls-2"
                    points="45.847 45.567 63.491 78.598 63.491 45.567 45.847 45.567"
                    name="Layer %{number}"
                    data-layer-id="4539022563950"
                    style={{ zoom: 1, fill: 'rgb(74, 115, 232)' }}
                />
                <polygon
                    className="cls-3"
                    points="63.491 20.855 45.847 45.567 63.491 45.567 63.491 20.855"
                    name="Layer %{number}"
                    data-layer-id="9874553563950"
                    style={{ zoom: 1, fill: 'rgb(129, 158, 240)' }}
                />
                <polygon
                    className="cls-5"
                    points="63.491 45.567 63.491 78.598 81.083 45.567 63.491 45.567"
                    name="Layer %{number}"
                    data-layer-id="4669198363950"
                    style={{ zoom: 1, fill: 'rgb(63, 99, 200)' }}
                />
                <polygon
                    className="cls-2"
                    points="81.083 45.567 63.491 20.855 63.491 45.567 81.083 45.567"
                    name="Layer %{number}"
                    data-layer-id="4739380463950"
                    style={{ zoom: 1, fill: 'rgb(74, 115, 232)' }}
                />
                <polygon
                    className="cls-5"
                    points="63.491 45.567 63.491 78.598 63.491 78.598 63.491 78.598 63.491 45.567 63.491 45.567"
                    name="Layer %{number}"
                    data-layer-id="1493894463950"
                    style={{ zoom: 1, fill: 'rgb(63, 99, 200)' }}
                />
                <polygon
                    className="cls-5"
                    points="63.491 45.567 63.491 20.855 63.491 20.855 63.491 20.855 63.491 45.567 63.491 45.567"
                    name="Layer %{number}"
                    data-layer-id="0989313363950"
                    style={{ zoom: 1, fill: 'rgb(63, 99, 200)' }}
                />
                <polygon
                    className="cls-4"
                    points="1.188 35.793 37.126 47.973 58.078 86.668 45.547 112.583 1.188 35.793"
                    name="Layer %{number}"
                    data-layer-id="3798667563950"
                    style={{ zoom: 1, fill: "url('#linear-gradient-2')" }}
                />
            </svg>
        </Block>
    );
});
