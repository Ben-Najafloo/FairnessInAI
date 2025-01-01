import React, { useContext, useState } from 'react';
import { ProgressContext } from '../ProgressContext';
import axios from 'axios';
import Papa from 'papaparse';
import { TbDeviceAnalytics } from "react-icons/tb";
import { FaHandPointDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { FaFileUpload } from "react-icons/fa";



const Upload = () => {
    const { setProgress } = useContext(ProgressContext);
    const navigate = useNavigate();
    const [datasetFile, setDatasetFile] = useState(null);
    const [labelColumn, setLabelColumn] = useState('');
    const [sensitiveColumn, setSensitiveColumn] = useState('');

    // const [metricType, setMetricType] = useState('demographic_parity');
    const [fileName, setFileName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [columns, setColumns] = useState([]);


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
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(labelColumn, sensitiveColumn)

        // Ensure a file is selected
        if (!datasetFile) {
            setErrorMessage("Please upload a dataset file.");
            return;
        }
        // Ensure label and sensitive columns are selected
        if (!labelColumn || !sensitiveColumn) {
            setErrorMessage("Please select both label and sensitive columns.");
            return;
        }

        // Prepare form data
        const formData = new FormData();
        formData.append("file", datasetFile);
        formData.append("label_column", labelColumn);
        formData.append("sensitive_column", sensitiveColumn);


        try {
            // Send POST request to the backend
            const response = await axios.post("http://localhost:5000/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log(response.data);
            setErrorMessage(''); // Clear any previous error messages

            navigate("/dataset-info", { state: { datasetInfo: response.data } });
            setProgress(3); // Move to the next step in your flow
        } catch (error) {
            console.error("There was an error uploading the file!", error);
            setErrorMessage("Error in uploading dataset or processing request.");
        }
    };


    return (

        <form onSubmit={handleSubmit}
            enctype="multipart/form-data"
            className="mx-auto md:pt-4 items-center justify-between px-4 h-full">

            <div className='w-full p-2 h-4/5'>
                <label className="flex relative h-full pb-9 flex-col items-center justify-center border-2 border-green-500 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-100 dark:border-green-600 dark:hover:border-gray-500">
                    <div className="relative items-center  justify-center h-3/4">
                        {/* Conditionally render elements based on datasetFile state */}
                        {!datasetFile && (
                            <div className='text-xl pt-8 text-center text-gray-500 dark:text-gray-400 relative items-center justify-center'>
                                <p>Load the Dataset</p>
                                <br />
                                <FaFileUpload className="w-8 h-8 mb-4 text-center m-auto" />
                                <p className="mb-7 ">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                            </div>
                        )}

                        {errorMessage && (
                            <p className="mb-2 text-red-600">
                                {errorMessage}
                            </p>
                        )}

                        {fileName && (
                            <p className="text-base text-gray-700 dark:text-white">
                                <strong>Selected file: </strong>
                                {fileName}</p>
                        )}

                        {/* Display column names if available */}
                        {columns.length > 0 && (
                            <div className="items-center justify-center">

                                {/* <div className=" mx-auto">
                                    <strong>Columns:</strong>
                                    <div
                                        variants={{ transition: { staggleChildren: 0.5 } }}
                                        className="grid grid-cols-1 px-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-2">
                                        {columns.map((col, index) => (
                                            <div key={col} className="px-1 py-1 border rounded shadow-md bg-white hover:shadow-lg transition duration-200">
                                                <span className="text-sm text-gray-700">{col}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div> */}

                                <div className='mt-5'>
                                    <p>
                                        Now set the value for
                                        <span className='italic font-bold'> Label Column, and Sensitive Column</span>
                                        <br />
                                        in the below boxes.
                                        <FaHandPointDown className='inline ml-2 ' />
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                    <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                    />


                    {/* Show delete button if a file is loaded */}
                    {datasetFile && (
                        <div className='absolute bottom-2 right-2'>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-1 text-sm hover:border-2 border-red-500 text-red-500 rounded"
                            >
                                Change or Delete
                            </button>
                        </div>
                    )}
                </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 pl-3 pr-9 text-white">
                <div>
                    <label className='text-sm'>Label Column *</label>
                    <select value={labelColumn} onChange={(e) => setLabelColumn(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-800 focus:border-back-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-800 dark:focus:border-gray-800">
                        <option></option>
                        {columns.map((col, index) => (
                            <option key={col} value={col}>{col}</option>
                        ))}

                    </select>
                </div>
                <div>
                    <label className='text-sm'>Sensitive Feature *</label>
                    <select value={sensitiveColumn} onChange={(e) => setSensitiveColumn(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-800 focus:border-back-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-800 dark:focus:border-gray-800">
                        <option></option>
                        {columns.map((col, index) => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                    </select>
                </div>

                <div className="px-3 mt-6 ml-11">
                    <button type="submit"
                        className="text-white flex hover:text-green-500 border border-white hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded text-base px-7 py-2 text-center">
                        <span className='text-base'>Analyze</span>
                        <TbDeviceAnalytics className="ml-3 text-2xl" />
                    </button>
                </div>
            </div>
        </form>


    );
};

export default Upload;