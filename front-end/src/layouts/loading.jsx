import React from "react";

export default function Loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white/0 z-50 backdrop-blur-xs">
            <svg className="size-96" viewBox="0 0 50 50">
                <defs>
                    <linearGradient
                        id="holoGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop
                            offset="0%"
                            stopColor="#10B981"
                            stopOpacity="0.3"
                        />
                        <stop
                            offset="50%"
                            stopColor="#10B981"
                            stopOpacity="1"
                        />
                        <stop
                            offset="100%"
                            stopColor="#10B981"
                            stopOpacity="0.3"
                        />
                        <animate
                            attributeName="x1"
                            values="0%;100%;0%"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </linearGradient>
                </defs>
                <g>
                    <rect
                        x="12"
                        y="12"
                        width="26"
                        height="26"
                        rx="6"
                        ry="6"
                        fill="none"
                        stroke="url(#holoGradient)"
                        strokeWidth="2"
                    >
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 25 25"
                            to="360 25 25"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </rect>
                    <rect
                        x="16"
                        y="16"
                        width="18"
                        height="18"
                        rx="4"
                        ry="4"
                        fill="none"
                        stroke="url(#holoGradient)"
                        strokeWidth="1.5"
                        opacity="0.6"
                    >
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="360 25 25"
                            to="0 25 25"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </rect>
                </g>
            </svg>
        </div>
    );
}
