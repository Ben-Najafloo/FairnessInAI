import React, { createContext, useState } from "react";

export const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
    const [progress, setProgress] = useState(1);
    const [closeSidebar, setCloseSidebar] = useState(false);
    const [fileName, setFileName] = useState('');
    const [sensitiveColumn, setSensitiveColumn] = useState(null);
    const [sensitiveColumn2, setSensitiveColumn2] = useState(null);
    const [labelColumn, setLabelColumn] = useState('');
    const [problemTypeColumn, setProblemTypeColumn] = useState('');

    if (progress < 1) {
        setFileName('');
        setLabelColumn('');
        setSensitiveColumn('');
        setSensitiveColumn2('');
        setProblemTypeColumn('')
    }

    console.log('from progress context', fileName, labelColumn, sensitiveColumn, sensitiveColumn2, problemTypeColumn)

    return (
        <ProgressContext.Provider value={{ progress, setProgress, closeSidebar, setCloseSidebar, fileName, setFileName, labelColumn, setLabelColumn, sensitiveColumn, setSensitiveColumn, sensitiveColumn2, setSensitiveColumn2, problemTypeColumn, setProblemTypeColumn }}>
            {children}
        </ProgressContext.Provider>
    );
};
