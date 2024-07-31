import React from "react";

interface ColorTransitionProps {
    isVisible: boolean;
    fromColor: string;
    toColor: string;
    onClick: () => void;
}

const ColorTransition: React.FC<ColorTransitionProps> = ({
    isVisible,
    fromColor,
    toColor,
    onClick,
}) => {
    console.log("ColorTransition render:", { isVisible, fromColor, toColor });

    return (
        <div
            className={`fixed inset-0 transition-opacity duration-500 ${
                isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={onClick}
            style={{
                zIndex: 50,
                backgroundColor: fromColor,
            }}
        >
            Transition Active
        </div>
    );
};

export default ColorTransition;
