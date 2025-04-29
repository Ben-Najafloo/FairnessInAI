import React, { useContext, useState, useEffect, useRef } from 'react';
import { ProgressContext } from '../ProgressContext';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Papa from 'papaparse';
import { FaArrowRightLong, FaArrowLeftLong } from "react-icons/fa6";
import { FaFileUpload, FaAmericanSignLanguageInterpreting } from "react-icons/fa";
import { GiHumanTarget } from "react-icons/gi";

import AskHelp from "./upload-components/AskHelp";
import ShowHelp from "./upload-components/ShowHelp";
import ProblemTypeCo from './upload-components/ProblemTypeCo';


const Upload = () => {
    const { setProgress } = useContext(ProgressContext);
    const navigate = useNavigate();

    //dataForm values
    const [datasetFile, setDatasetFile] = useState(null);
    const [labelColumn, setLabelColumn] = useState('');
    const [sensitiveColumn, setSensitiveColumn] = useState(null);
    const [sensitiveColumn2, setSensitiveColumn2] = useState(null);
    const [problemTypeColumn, setProblemTypeColumn] = useState('');
    //help popup
    const [helpPopUpTarget, setHelpPopUpTarget] = useState(false);
    const [showHelpTarget, setShowHelpTarget] = useState(false);

    // steps
    const [fileName, setFileName] = useState('');
    const [sensitiveCulumnBox, setSensitiveCulumnBox] = useState('');
    const [problemType, setProblemType] = useState('');

    //errors
    const [errorMessage, setErrorMessage] = useState('');
    const [labelErrorMessage, setLabelErrorMessage] = useState('');
    const [sensitiveErrorMessage, setSensitiveErrorMessage] = useState('');
    const [problemErrorMessage, setProblemErrorMessage] = useState('');

    //show all columns of dataset
    const [columns, setColumns] = useState([]);

    //Add pagination state on all columns of dataset
    const itemsPerPage = 20;
    const [targetCurrentPage, setTargetCurrentPage] = useState(1);
    const [sensitiveCurrentPage, setSensitiveCurrentPage] = useState(1);
    const totalPages = Math.ceil(columns.length / itemsPerPage);

    const timeoutId = useRef(null); // Use useRef to hold the timeout ID

    useEffect(() => {
        // Set up the timeout
        timeoutId.current = setTimeout(() => {
            if (fileName) {
                console.log('6 seconds passed and fileName is truthy');
                setHelpPopUpTarget(true);
            }
        }, 6000);

        // Cleanup function: This runs when the component unmounts or when
        // the dependencies in the dependency array change.
        return () => {
            if (timeoutId.current) {
                console.log('Timeout cleared');
                clearTimeout(timeoutId.current);
            }
        };
    }, [fileName]); // Re-run effect whenever fileName changes

    // Function to update fileName (for demonstration purposes)
    const handleFileNameChange = (newFileName) => {
        setFileName(newFileName);
    };

    const currentLabels = columns.slice(
        (targetCurrentPage - 1) * itemsPerPage,
        targetCurrentPage * itemsPerPage
    );
    const currentSensitive = columns.slice(
        (sensitiveCurrentPage - 1) * itemsPerPage,
        sensitiveCurrentPage * itemsPerPage
    );

    const handleTargetHelp = () => {
        setHelpPopUpTarget(false);
        setShowHelpTarget(true);
    }

    const handleSensitiveColumn = () => {
        // Ensure label and sensitive columns are selected
        if (!labelColumn) {
            setLabelErrorMessage("Please select the target label.");
            return;
        } else {
            setFileName(false);
            setSensitiveCulumnBox(true);
            setHelpPopUpTarget(false);
            setLabelErrorMessage('');

        }
    }

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
        setFileName(true);
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
                console.log('is an Invalid file format')
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
            setTimeout(() => {
                if (fileName) {
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

    // Handle delete action
    const handleDelete = () => {
        setDatasetFile(null);
        setFileName('');
        setProgress(3);
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

        console.log(labelColumn, sensitiveColumn, problemTypeColumn);

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
            {/* ask help for target lable */}
            {helpPopUpTarget && (
                <AskHelp setHelpPopUpTarget={setHelpPopUpTarget} handleTargetHelp={handleTargetHelp} />
            )}
            {showHelpTarget && (
                <ShowHelp setShowHelpTarget={setShowHelpTarget} />
            )}
            {!datasetFile && (
                <div className="mx-auto md:pt-4 items-center justify-between md:pr-11 md:pl-11 pt-11 w-ful h-full">
                    <label>
                        <div className="flex relative w-ful h-full pb-9 flex-col items-center justify-center border-2 border-green-500 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-100 dark:border-green-600 dark:hover:border-gray-500">

                            <div className="relative items-center  justify-center">
                                {/* Conditionally render elements based on datasetFile state */}
                                <div className='text-base pt-8 text-center text-gray-300 relative items-center justify-center'>

                                    {errorMessage ? (
                                        <p>
                                            <span className="text-red-600">{errorMessage}</span>
                                            <br /><br />
                                            Please tray again!
                                            <br />
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                    ) : (<>
                                        <p>
                                            {/* Support different CSV encodings (some users might upload with utf-16, ISO-8859-1, etc.)<br />

                                            Try common separators (e.g., ,, ;, \t) in case users upload with non-standard delimiters.<br />

                                            Clean column names (strip whitespace, remove newline chars).<br />

                                            Handle edge-case object columns more gently (like mixed types).<br />

                                            Add fallback if headers are missing (prevent crash if file has no headers).<br /><br /><br /> */}
                                        </p>
                                        <p>Load the Dataset (Please upload in <span className='font-bold'> CSV, JSON, XLS, </span> or <span className='font-bold'>XLSX </span> format) </p>
                                        <br />
                                        <FaFileUpload className="w-8 h-8 mb-5 text-center m-auto" />
                                        <p className="mb-7 ">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                    </>)}
                                </div>


                            </div>
                            <input
                                id="dropzone-file"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </label>
                </div>
            )}

            {fileName && (
                <div className="mx-auto md:pt-4 items-center justify-between md:pr-11 md:pl-11 pt-11 w-ful h-full">
                    <div className="flex relative w-ful h-full pb-14 flex-col items-center justify-center bg-gray-700 text-white">
                        {labelErrorMessage && (
                            <p className="mb-2 text-red-600 absolute top-11">
                                {labelErrorMessage}
                            </p>
                        )}

                        {/* Display column names if available */}
                        {columns.length > 0 && (
                            <div className="items-center justify-center w-full px-4">
                                <div className='mt-3 ml-3'>
                                    <p className='absolute top-3 left-3 w-full'>
                                        <span className="text-base text-gray-700 dark:text-white pb-2">
                                            Selected file:
                                            <strong> {fileName}</strong>
                                        </span> <br />
                                        <GiHumanTarget className="w-9 h-9 absolute top-2 right-9" />
                                        Now set
                                        <span className='italic font-bold text-lg'> the Target Label </span>
                                        to perform ML model
                                    </p>
                                    <div className=" mx-auto mt-3 w-full">
                                        <div
                                            className="grid grid-cols-1 h-48 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-2">
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

                                        {columns.length > itemsPerPage && (
                                            <div className="flex flex-col mt-5">
                                                <div className="inline-flex justify-end mt-2 xs:mt-0 text-sm">

                                                    <button
                                                        onClick={() => setTargetCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                        disabled={targetCurrentPage === 1}
                                                        className="flex items-center justify-center  px-4 h-6 text-base font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900 dark:bg-gray-800  dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                                        <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H1m0 0 4 4M1 5l4-4" />
                                                        </svg>
                                                    </button>

                                                    <span className='mx-2'>Features {targetCurrentPage} of {totalPages}</span>

                                                    <button
                                                        onClick={() => setTargetCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                        disabled={targetCurrentPage === totalPages}
                                                        className="flex items-center mr-5 justify-center  px-4 h-6 text-base font-medium text-white bg-gray-800 rounded-e hover:bg-gray-900 dark:bg-gray-800  dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                                        <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                                                        </svg>
                                                    </button>
                                                    <span>Total: {columns.length}</span>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="absolute bottom-3 right-3">
                            <button type="submit"
                                onClick={handleSensitiveColumn}
                                className="text-white flex hover:text-green-500 border border-white hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded text-base px-7 py-2 text-center">
                                <span className='text-sm'>Next</span>
                                <FaArrowRightLong className="ml-3 text-lg" />
                            </button>
                        </div>


                        {/* Show delete button if a file is loaded */}
                        {datasetFile && (
                            <div className='absolute bottom-2 left-2'>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-1 text-sm hover:border-2 border-red-500 text-red-500 rounded"
                                >
                                    Change or Delete the Dataset
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* sensitive feature selection */}

            {sensitiveCulumnBox && (
                <div className="mx-auto md:pt-4 items-center justify-between md:pr-11 md:pl-11 pt-11 w-ful h-full">
                    <div className="flex relative w-ful h-full pb-14 flex-col items-center justify-center bg-gray-700 text-white">

                        {sensitiveErrorMessage && (
                            <p className="mb-2 text-red-600 absolute top-11">
                                {sensitiveErrorMessage}
                            </p>
                        )}

                        {/* Display column names if available */}
                        {columns.length > 0 && (
                            <div className="items-center justify-center w-full px-4">
                                <div className='mt-3 ml-3'>
                                    <p className='absolute top-3 left-3 w-full'>
                                        <FaAmericanSignLanguageInterpreting className="w-9 h-9 absolute top-2 right-9" />
                                        Now select the label as
                                        <span className='italic font-bold text-lg'> the Sensitive features</span>
                                        <br /><span className='text-green-500'>*** You can choose one or two options</span>
                                    </p>
                                    <div className=" mx-auto mt-3">
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
                                        {columns.length > itemsPerPage && (
                                            <div className="flex flex-col mt-5">
                                                <div className="inline-flex mt-2 xs:mt-0 justify-end text-sm">

                                                    <button
                                                        onClick={() => setSensitiveCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                        disabled={sensitiveCurrentPage === 1}
                                                        className="flex items-center justify-center  px-4 h-6 text-base font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900 dark:bg-gray-800  dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                                        <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H1m0 0 4 4M1 5l4-4" />
                                                        </svg>
                                                    </button>

                                                    <span className='mx-2'>Features {sensitiveCurrentPage} of {totalPages}</span>

                                                    <button
                                                        onClick={() => setSensitiveCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                        disabled={sensitiveCurrentPage === totalPages}
                                                        className="flex items-center mr-5 justify-center  px-4 h-6 text-base font-medium text-white bg-gray-800 rounded-e hover:bg-gray-900 dark:bg-gray-800  dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                                        <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                                                        </svg>
                                                    </button>
                                                    <span>Total: {columns.length}</span>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="absolute bottom-3 right-3">
                            <button type="submit"
                                onClick={handleProblemType}
                                className="text-white flex hover:text-green-500 border border-white hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded text-base px-7 py-2 text-center">
                                <span className='text-sm'>Next</span>
                                <FaArrowRightLong className="ml-3 text-lg " />
                            </button>
                        </div>

                        <div className="absolute bottom-3 left-3">
                            <button type="submit"
                                onClick={backToLabelColumn}
                                className="text-white flex hover:text-green-500 border border-white hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded text-base px-7 py-2 text-center">
                                <FaArrowLeftLong className="mr-3 text-lg " />
                                <span className='text-sm'>Back</span>
                            </button>
                        </div>

                    </div>
                </div>
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