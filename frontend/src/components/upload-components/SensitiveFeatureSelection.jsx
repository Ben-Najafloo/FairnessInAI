import React, { useState } from 'react';
import SelectionFrame from './SelectionFrame';
import { motion, AnimatePresence } from "framer-motion";

const SensitiveFeatureSelection = ({ columns = [],
    sensitiveErrorMessage,
    handleProblemType,
    backToLabelColumn,
    setSensitiveColumn,
    setSensitiveColumn2,
    sensitiveColumn,
    sensitiveColumn2,
    fileName
}) => {

    //Add pagination state on all columns of dataset
    const itemsPerPage = 20;

    const totalPages = Math.ceil(columns.length / itemsPerPage);

    const [sensitiveCurrentPage, setSensitiveCurrentPage] = useState(1);
    const currentSensitive = columns.slice(
        (sensitiveCurrentPage - 1) * itemsPerPage,
        sensitiveCurrentPage * itemsPerPage
    );

    // Handle checkbox change
    const handleSensitiveOptions = (value) => {
        if (value === sensitiveColumn) {
            // Deselect sensitiveColumn1
            setSensitiveColumn(null);
        } else if (value === sensitiveColumn2) {
            // Deselect sensitiveColumn2
            setSensitiveColumn2(null);
        } else if (!sensitiveColumn) {
            // Assign to sensitiveColumn1 if it's empty
            setSensitiveColumn(value);
        } else if (!sensitiveColumn2) {
            // Assign to sensitiveColumn2 if it's empty
            setSensitiveColumn2(value);
        } else {
            alert("You can only select up to two sensitive columns.");
        }
    };

    const titleForSensitiveForm = <> Now set <span className='italic font-bold text-lg'> the Sensitive Feature </span> you can chose one or two! </>;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -200, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className='h-full'
            >
                <SelectionFrame
                    errorMessage={sensitiveErrorMessage}
                    columns={columns}
                    fileName={fileName}
                    handleNextStep={handleProblemType}
                    handleBackStep={backToLabelColumn}
                    itemsPerPage={itemsPerPage}
                    totalPages={totalPages}
                    currentPage={sensitiveCurrentPage}
                    setCurrentPage={setSensitiveCurrentPage}
                    title={titleForSensitiveForm}
                >
                    <div
                        className="grid grid-cols-1 h-48 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-2">
                        {currentSensitive.map((col, index) => (
                            <div key={index}>
                                <input type="checkbox"
                                    id={col}
                                    value={col}
                                    checked={col === sensitiveColumn || col === sensitiveColumn2}
                                    onChange={() => handleSensitiveOptions(col)}
                                    className="hidden peer" />
                                <label for={col} className="inline-flex items-center justify-between w-full p-2 text-gray-300  border border-gray-300 rounded cursor-pointer peer-checked:border-green-400 hover:text-gray-800  peer-checked:text-green-400 hover:bg-gray-100 ">
                                    <div className="block">
                                        <div className="w-full text-base">{col}</div>
                                    </div>
                                </label>
                            </div>

                        ))}
                    </div>
                </SelectionFrame>
            </motion.div>
        </AnimatePresence>
    )
}

export default SensitiveFeatureSelection
