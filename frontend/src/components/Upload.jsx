import React, { useContext, useState } from 'react';
import { ProgressContext } from '../ProgressContext';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

import { AskHelp, ShowHelp, DatasetUpload, ProblemTypeCo, TargetFeatureSelection, SensitiveFeatureSelection } from './upload-components/uploadComponentsUrl.js';

const Upload = () => {
    const { setProgress } = useContext(ProgressContext);
    const navigate = useNavigate();

    //dataForm values
    const [datasetFile, setDatasetFile] = useState(null);
    const [labelColumn, setLabelColumn] = useState('');
    const [targetTableShow, setTargetTableShow] = useState(false);
    const [sensitiveColumn, setSensitiveColumn] = useState(null);
    const [sensitiveColumn2, setSensitiveColumn2] = useState(null);
    const [problemTypeColumn, setProblemTypeColumn] = useState('');

    //help popup
    const [helpPopUpTarget, setHelpPopUpTarget] = useState(false);
    const [showHelpTarget, setShowHelpTarget] = useState(false);

    // steps
    const [fileName, setFileName] = useState('');
    const [sensitiveCulumnBox, setSensitiveCulumnBox] = useState(false);
    const [problemType, setProblemType] = useState('');

    //errors
    const [errorMessage, setErrorMessage] = useState('');
    const [labelErrorMessage, setLabelErrorMessage] = useState('');
    const [sensitiveErrorMessage, setSensitiveErrorMessage] = useState('');
    const [problemErrorMessage, setProblemErrorMessage] = useState('');

    //show all columns of dataset
    const [columns, setColumns] = useState([]);

    const handleTargetHelp = () => {
        setHelpPopUpTarget(false);
        setShowHelpTarget(true);
    }

    // Handle delete action
    const backToUpload = () => {
        setDatasetFile(null);
        setFileName('');
        setProgress(3);
        setTargetTableShow(false);
    };

    const handleSensitiveColumn = () => {
        if (!labelColumn) {
            setLabelErrorMessage('Please select a target value');
        } else {
            setSensitiveCulumnBox(true);
            setHelpPopUpTarget(false);
            setLabelErrorMessage('');
            setTargetTableShow(false);
        }
    }

    const handleProblemType = () => {
        if (!sensitiveColumn) {
            setSensitiveErrorMessage("Please select at least one sensitive column.");
            return;
        } else {
            setSensitiveCulumnBox(false);
            setProblemType(true);
            console.log(sensitiveColumn, sensitiveColumn2);
            setSensitiveErrorMessage('');
        }
    }

    const backToLabelColumn = () => {
        setTargetTableShow(true);
        setSensitiveCulumnBox(false);
        setProblemType(false);
    }

    const backToSensitiveColumn = () => {
        setProblemType(false);
        setSensitiveCulumnBox(true);
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!problemTypeColumn) {
            setProblemErrorMessage("Please select a problem type.");
            return;
        }

        // Prepare form data
        const formData = new FormData();
        formData.append("file", datasetFile);
        formData.append("label_column", labelColumn);
        formData.append("sensitive_column", sensitiveColumn);
        formData.append("sensitive_column2", sensitiveColumn2 || "");
        formData.append("problem_type", problemTypeColumn);

        try {
            // Send POST request to the backend
            const response = await axios.post("http://localhost:5000/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            // console.log(response.data);
            setErrorMessage(''); // Clear any previous error messages 

            navigate("/dataset-info", { state: { datasetInfo: response.data } });
            setProgress(4); // Move to the next step in your flow
        } catch (error) {
            console.error("There was an error uploading the file!", error);
            setErrorMessage("Error in uploading dataset or processing request.");
        }
    };

    return (
        <div className="mx-auto md:pt-4 items-center justify-between md:pr-11 md:pl-11 pt-11 w-ful h-full">

            {helpPopUpTarget && (
                <AskHelp fileName={fileName} setHelpPopUpTarget={setHelpPopUpTarget} handleTargetHelp={handleTargetHelp} />
            )}
            {showHelpTarget && (
                <ShowHelp setShowHelpTarget={setShowHelpTarget} />
            )}
            {!datasetFile && (
                <DatasetUpload
                    errorMessage={errorMessage}
                    setDatasetFile={setDatasetFile}
                    datasetFile={datasetFile}
                    fileName={fileName}
                    setFileName={setFileName}
                    setErrorMessage={setErrorMessage}
                    setColumns={setColumns}
                    setTargetTableShow={setTargetTableShow}
                    labelColumn={labelColumn}
                    setHelpPopUpTarget={setHelpPopUpTarget}
                />
            )}

            {targetTableShow && (
                <TargetFeatureSelection
                    columns={columns}
                    handleSensitiveColumn={handleSensitiveColumn}
                    labelErrorMessage={labelErrorMessage}
                    labelColumn={labelColumn}
                    setLabelColumn={setLabelColumn}
                    fileName={fileName}
                    backToUpload={backToUpload}
                />
            )}

            {sensitiveCulumnBox && (
                <SensitiveFeatureSelection
                    columns={columns}
                    sensitiveErrorMessage={sensitiveErrorMessage}
                    handleProblemType={handleProblemType}
                    backToLabelColumn={backToLabelColumn}
                    setSensitiveColumn={setSensitiveColumn}
                    setSensitiveColumn2={setSensitiveColumn2}
                    sensitiveColumn={sensitiveColumn}
                    sensitiveColumn2={sensitiveColumn2}
                    fileName={fileName} />
            )}

            <ProblemTypeCo
                problemType={problemType}
                problemErrorMessage={problemErrorMessage}
                setProblemTypeColumn={setProblemTypeColumn}
                problemTypeColumn={problemTypeColumn}
                handleSubmit={handleSubmit}
                backToSensitiveColumn={backToSensitiveColumn} />

        </div>

    );
};

export default Upload;




// rastesh man zaban italiaiim dar hadd A