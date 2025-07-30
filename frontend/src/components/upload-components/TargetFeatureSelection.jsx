import React, { useState } from 'react'
import SelectionFrame from './SelectionFrame';

const TargetFeatureSelection = ({
    columns = [],
    handleSensitiveColumn,
    labelErrorMessage,
    labelColumn,
    setLabelColumn,
    setDatasetFile,
    setTargetTableShow,
    fileName,
    backToUpload
}) => {

    const itemsPerPage = 20;
    const totalPages = Math.ceil(columns.length / itemsPerPage);

    // const [fileName, setFileName] = useState('');
    console.log(fileName)

    const [currentPage, setCurrentPage] = useState(1);
    const currentLabels = columns.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const titleForTargetForm = <> Please set <span className='italic font-bold text-lg'> the Target Label </span> to perform ML model </>;



    return (
        <SelectionFrame
            errorMessage={labelErrorMessage}
            columns={columns}
            fileName={fileName}
            handleNextStep={handleSensitiveColumn}
            handleBackStep={backToUpload}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            title={titleForTargetForm}
        >
            <div className="grid grid-cols-1 h-48 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-2">
                {currentLabels.map((col, index) => (
                    <div key={col}>
                        <input type="radio"
                            name="labelColumn"
                            id={col}
                            value={col}
                            onChange={(e) => setLabelColumn(e.target.value)}
                            checked={labelColumn === col}
                            className="hidden peer" />
                        <label htmlFor={col} className="inline-flex items-center justify-between w-full p-2 text-gray-300  border border-gray-300 rounded cursor-pointer peer-checked:border-green-400 hover:text-gray-800  peer-checked:text-green-400 hover:bg-gray-100 ">
                            <div className="block">
                                <div className="w-full text-base">{col}</div>
                            </div>
                        </label>
                    </div>
                ))}
            </div>

        </SelectionFrame>
    )
}

export default TargetFeatureSelection
