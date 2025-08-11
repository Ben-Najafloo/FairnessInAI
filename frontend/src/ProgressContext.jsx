import React, { createContext, useState } from "react";

export const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
    const [progress, setProgress] = useState(1); // Default progress is Step 1
    const [closeSidebar, setCloseSidebar] = useState(false); // Sidebar state

    return (
        <ProgressContext.Provider value={{ progress, setProgress, closeSidebar, setCloseSidebar }}>
            {children}
        </ProgressContext.Provider>
    );
};
