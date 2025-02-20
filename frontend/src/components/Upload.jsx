import React, { useContext, useState, useEffect } from 'react';
import { ProgressContext } from '../ProgressContext';
import axios from 'axios';
import Papa from 'papaparse';
import { FaArrowRightLong, FaArrowLeftLong } from "react-icons/fa6";
import { FaFileUpload } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
// import { motion } from 'framer-motion';

import regImg from '../img/reg2.png';
import claImg from '../img/class2.png';

const Upload = () => {
    const { setProgress } = useContext(ProgressContext);
    const navigate = useNavigate();

    useEffect(() => {
        setProgress(2);
    }, [setProgress]);

    //dataForm values
    const [datasetFile, setDatasetFile] = useState(null);
    const [labelColumn, setLabelColumn] = useState('');
    const [sensitiveColumn, setSensitiveColumn] = useState(null);
    const [sensitiveColumn2, setSensitiveColumn2] = useState(null);
    const [problemTypeColumn, setProblemTypeColumn] = useState('');

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


    const handleSensitiveColumn = () => {
        // Ensure label and sensitive columns are selected
        if (!labelColumn) {
            setLabelErrorMessage("Please select label columns.");
            return;
        } else {
            setFileName(false);
            setSensitiveCulumnBox(true);

            setLabelErrorMessage('');
            setProgress(4);
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
            setSensitiveErrorMessage("Please select at least one sensitive columns.");
            return;
        } else {
            setSensitiveCulumnBox(false);
            setProblemType(true);
            console.log(sensitiveColumn, sensitiveColumn2);
            setSensitiveErrorMessage('');
            setProgress(5);
        }
    }

    const backToLabelColumn = () => {
        setFileName(true);
        setSensitiveCulumnBox(false);
        setProblemType(false);
        setProgress(4);
    }

    const backToSensitiveColumn = () => {
        setProgress(5);
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
                setDatasetFile(null); // Reset the dataset file state
                setFileName(""); // Clear the file name display
                setColumns([]);
                return;
            }

            // If valid, clear error and set the file
            setErrorMessage(''); // Clear any previous error messages
            setDatasetFile(selectedFile);
            setFileName(selectedFile.name);
            setProgress(3);

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
        // Ensure a file is selected
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
            setProgress(6); // Move to the next step in your flow
        } catch (error) {
            console.error("There was an error uploading the file!", error);
            setErrorMessage("Error in uploading dataset or processing request.");
        }
    };


    return (

        <div className="mx-auto md:pt-4 items-center justify-between pr-11 pl-11 pt-11 w-ful h-full">

            {!datasetFile && (
                <div className="mx-auto md:pt-4 items-center justify-between pr-11 pl-11 pt-11 w-ful h-full">
                    <label>
                        <div className="flex relative w-ful h-full pb-9 flex-col items-center justify-center border-2 border-green-500 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-100 dark:border-green-600 dark:hover:border-gray-500">
                            <div className="relative items-center  justify-center">
                                {/* Conditionally render elements based on datasetFile state */}
                                <div className='text-xl pt-8 text-center text-gray-500 dark:text-gray-400 relative items-center justify-center'>
                                    <p>Load the Dataset</p>
                                    <br />
                                    <FaFileUpload className="w-8 h-8 mb-4 text-center m-auto" />
                                    <p className="mb-7 ">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
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
                <div className="mx-auto md:pt-4 items-center justify-between pr-11 pl-11 pt-11 w-ful h-full">
                    <div className="flex relative w-ful h-full pb-9 flex-col items-center justify-center border-2 border-green-500 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-100 dark:border-green-600 dark:hover:border-gray-500">
                        {labelErrorMessage && (
                            <p className="mb-2 text-red-600">
                                {labelErrorMessage}
                            </p>
                        )}

                        {/* Display column names if available */}
                        {columns.length > 0 && (
                            <div className="items-center justify-center">
                                <div className='mt-5'>
                                    <p className="text-base text-gray-700 dark:text-white">
                                        Selected file:
                                        <strong> {fileName}</strong>
                                    </p>
                                    <p className='mb-3'>
                                        Now set the value for
                                        <span className='italic font-bold text-lg'> Label Column</span>
                                    </p>
                                    <div className=" mx-auto mt-3">
                                        <div
                                            className="grid grid-cols-1 px-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-2">
                                            {columns.map((col, index) => (

                                                <div key={col}>
                                                    <input type="checkbox" id={col} value={col} onChange={(e) => setLabelColumn(e.target.value)} class="hidden peer" />
                                                    <label for={col} class="inline-flex items-center justify-between w-full p-2 text-gray-300  border-2 border-gray-300 rounded-lg cursor-pointer peer-checked:border-green-400 hover:text-gray-800  peer-checked:text-green-400 hover:bg-gray-100 ">
                                                        <div class="block">
                                                            <div class="w-full text-base">{col}</div>
                                                        </div>
                                                    </label>
                                                </div>

                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="absolute bottom-3 right-3">
                            <button type="submit"
                                onClick={handleSensitiveColumn}
                                className="text-white flex hover:text-green-500 border border-white hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded text-base px-7 py-2 text-center">
                                <span className='text-base'>Next</span>
                                <FaArrowRightLong className="ml-3 text-2xl" />
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

            {sensitiveCulumnBox && (
                <div className="mx-auto md:pt-4 items-center justify-between pr-11 pl-11 pt-11 w-ful h-full">
                    <div className="flex relative w-ful h-full pb-9 flex-col items-center justify-center border-2 border-green-500 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-100 dark:border-green-600 dark:hover:border-gray-500">

                        {sensitiveErrorMessage && (
                            <p className="mb-2 text-red-600">
                                {sensitiveErrorMessage}
                            </p>
                        )}

                        {/* Display column names if available */}
                        {columns.length > 0 && (
                            <div className="items-center justify-center">
                                <div className='mt-5'>
                                    <p className='mb-3'>
                                        Now set the value for
                                        <span className='italic font-bold text-lg'> Sensitive features</span>
                                        <br />*** You can chose one or two options
                                    </p>
                                    <div className=" mx-auto mt-3">
                                        <div
                                            className="grid grid-cols-1 px-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-2">
                                            {columns.map((col, index) => (

                                                <div key={index}>
                                                    <input type="checkbox"
                                                        id={col}
                                                        value={col}
                                                        checked={col === sensitiveColumn || col === sensitiveColumn2}
                                                        onChange={() => handleSensitiveOptions(col)}
                                                        className="hidden peer" />
                                                    <label for={col} class="inline-flex items-center justify-between w-full p-2 text-gray-300  border-2 border-gray-300 rounded-lg cursor-pointer peer-checked:border-green-400 hover:text-gray-800  peer-checked:text-green-400 hover:bg-gray-100 ">
                                                        <div class="block">
                                                            <div class="w-full text-base">{col}</div>
                                                        </div>
                                                    </label>
                                                </div>

                                            ))}

                                            {/* <div>
                                                <p>Selected Sensitive Columns:</p>
                                                <ul>
                                                    {sensitiveColumn && <li>{sensitiveColumn}</li>}
                                                    {sensitiveColumn2 && <li>{sensitiveColumn2}</li>}
                                                </ul>
                                            </div> */}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="absolute bottom-3 right-3">
                            <button type="submit"
                                onClick={handleProblemType}
                                className="text-white flex hover:text-green-500 border border-white hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded text-base px-7 py-2 text-center">
                                <span className='text-base'>Next</span>
                                <FaArrowRightLong className="ml-3 text-2xl" />
                            </button>
                        </div>

                        <div className="absolute bottom-3 left-3">
                            <button type="submit"
                                onClick={backToLabelColumn}
                                className="text-white flex hover:text-green-500 border border-white hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded text-base px-7 py-2 text-center">
                                <span className='text-base'>Back</span>
                                <FaArrowLeftLong className="ml-3 text-2xl" />
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {problemType && (
                <div className="mx-auto md:pt-4 items-center justify-between pr-11 pl-11 pt-11 w-ful h-full">
                    <div className="flex relative w-ful h-full pb-9 flex-col items-center justify-center border-2 border-green-500 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-100 dark:border-green-600 dark:hover:border-gray-500">

                        {problemErrorMessage && (
                            <p className="mb-2 text-red-600">
                                {problemErrorMessage}
                            </p>
                        )}

                        <div className="items-center justify-center">
                            <h3 class="mb-5 text-xl font-medium text-gray-900 dark:text-white">Choose the Problem Type:</h3>
                            <ul class="grid w-full gap-6 md:grid-cols-2">

                                <li>
                                    <input type="checkbox" id="regression" onChange={(e) => setProblemTypeColumn(e.target.value)} value="regression" class="hidden peer" />
                                    <label for="regression" class="inline-flex items-center justify-between text-gray-200 w-full p-5 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-green-400 hover:text-gray-600  peer-checked:text-green-400 hover:bg-gray-50 ">
                                        <div class="block">
                                            <div className='flex'>
                                                <img src={regImg} class="mb-2 w-20 h-20" />
                                                <div class="w-full ml-4">
                                                    <div class="text-xl mb-3 font-semibold">Regression</div>
                                                    <p class="w-72 text-sm">Regression predicts a continuous output based on input features.</p>
                                                </div>
                                            </div>

                                        </div>
                                    </label>
                                </li>
                                <li>
                                    <input type="checkbox" id="angular-option" onChange={(e) => setProblemTypeColumn(e.target.value)} value="classification" class="hidden peer" />
                                    <label for="angular-option" class="inline-flex items-center justify-between text-gray-200 w-full p-5 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-green-400 hover:text-gray-600  peer-checked:text-green-400 hover:bg-gray-50 ">
                                        <div class="block">
                                            <div className='flex'>
                                                <img src={claImg} class="mb-2 w-20 h-20" />
                                                <div class="w-full ml-4">
                                                    <div class="text-xl mb-3 font-semibold">Classification</div>
                                                    <p class="w-72 text-sm">Classification categorizes inputs into discrete classes or labels.</p>
                                                </div>
                                            </div>

                                        </div>
                                    </label>
                                </li>
                            </ul>
                        </div>
                        <div className="absolute bottom-3 right-3">
                            <button type="submit"
                                onClick={handleSubmit}
                                className="text-white flex hover:text-green-500 border border-white hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded text-base px-7 py-2 text-center">
                                <span className='text-base'>Next</span>
                                <FaArrowRightLong className="ml-3 text-2xl" />
                            </button>
                        </div>

                        <div className="absolute bottom-3 left-3">
                            <button type="submit"
                                onClick={backToSensitiveColumn}
                                className="text-white flex hover:text-green-500 border border-white hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded text-base px-7 py-2 text-center">
                                <span className='text-base'>Back</span>
                                <FaArrowLeftLong className="ml-3 text-2xl" />
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>


    );
};

export default Upload;