import React, { useContext, useState, useEffect, useRef } from 'react';
import { ProgressContext } from '../ProgressContext';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Papa from 'papaparse';

import AskHelp from "./upload-components/AskHelp";
import ShowHelp from "./upload-components/ShowHelp";
import DatasetUpload from './upload-components/DatasetUpload';
import ProblemTypeCo from './upload-components/ProblemTypeCo';
import TargetFeatureSelection from './upload-components/TargetFeatureSelection';
import SensitiveFeatureSelection from './upload-components/SensitiveFeatureSelection';


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

    const timeoutId = useRef(null);
    useEffect(() => {
        // Set up the timeout
        timeoutId.current = setTimeout(() => {
            if (fileName) {
                console.log('6 seconds passed and fileName is truthy');
                setHelpPopUpTarget(true);
            }
        }, 6000);
        return () => {
            if (timeoutId.current) {
                console.log('Timeout cleared');
                clearTimeout(timeoutId.current);
            }
        };
    }, [fileName]);

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
            console.log(labelColumn);
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

    // Handle file input change
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            const allowedFormats = ["csv", "json", "xls", "xlsx"]; // Allowed file extensions
            const fileExtension = selectedFile.name.split('.').pop().toLowerCase(); // Extract file extension

            if (!allowedFormats.includes(fileExtension)) {
                setErrorMessage(`${fileExtension} is an Invalid file format. Please upload a file in one of the following formats: ${allowedFormats.join(", ")}`);
                console.log(errorMessage)
                setDatasetFile(null);
                setFileName("");
                setColumns([]);
                return;
            }
            setErrorMessage('');
            setDatasetFile(selectedFile);
            setFileName(selectedFile.name);
            setProgress(3);
            setTargetTableShow(true)
            setTimeout(() => {
                if (!labelColumn) {
                    console.log('6 seconds passed')
                    setHelpPopUpTarget(true);
                }
            }, 6000);

            // Read and parse the CSV file to extract column names
            const reader = new FileReader();
            reader.onload = (event) => {
                const csvData = event.target.result;
                Papa.parse(csvData, {
                    header: true, // Automatically treat the first row as column headers
                    complete: (results) => {
                        if (results.meta.fields) {
                            setColumns(results.meta.fields); // Extract column names
                        }
                    },
                    error: (err) => {
                        console.error("Error parsing CSV file:", err);
                        setErrorMessage("Error reading CSV file. Please check the file format.");
                        setColumns([]);
                    },
                });
            };
            reader.readAsText(selectedFile);
        }
    };

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
                <AskHelp setHelpPopUpTarget={setHelpPopUpTarget} handleTargetHelp={handleTargetHelp} />
            )}
            {showHelpTarget && (
                <ShowHelp setShowHelpTarget={setShowHelpTarget} />
            )}
            {!datasetFile && (
                <DatasetUpload errorMessage={errorMessage} handleFileChange={handleFileChange} />
            )}

            {targetTableShow && (
                <TargetFeatureSelection
                    columns={columns}
                    handleSensitiveColumn={handleSensitiveColumn}
                    labelErrorMessage={labelErrorMessage}
                    labelColumn={labelColumn}
                    setLabelColumn={setLabelColumn}
                    setDatasetFile={setDatasetFile}
                    setTargetTableShow={setTargetTableShow}
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