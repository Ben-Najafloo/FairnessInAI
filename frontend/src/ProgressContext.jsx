import React, { createContext, useState } from "react";

// Create a Context
export const ProgressContext = createContext();

// Create a Provider Component
export const ProgressProvider = ({ children }) => {
    const [progress, setProgress] = useState(1); // Default progress is Step 1

    return (
        <ProgressContext.Provider value={{ progress, setProgress }}>
            {children}
        </ProgressContext.Provider>
    );
};
