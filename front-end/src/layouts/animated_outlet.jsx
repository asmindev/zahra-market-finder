import React from "react";
import { useLocation, useOutlet } from "react-router";
import { AnimatePresence } from "motion/react";

const AnimatedOutlet = () => {
    const location = useLocation();
    const element = useOutlet();

    return (
        <AnimatePresence mode="wait" initial={true}>
            {element && React.cloneElement(element, { key: location.pathname })}
        </AnimatePresence>
    );
};

export default AnimatedOutlet;
