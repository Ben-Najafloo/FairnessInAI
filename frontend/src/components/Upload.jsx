import React, { useContext, useState } from 'react';
import { ProgressContext } from '../ProgressContext';
import axios from 'axios';
import Papa from 'papaparse';
import { TbDeviceAnalytics } from "react-icons/tb";
import { FaHandPointDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const Upload = () => {
    const { setProgress } = useContext(ProgressContext);
    const navigate = useNavigate();
    const [datasetFile, setDatasetFile] = useState(null);
    const [labelColumn, setLabelColumn] = useState('');
    const [sensitiveColumn, setSensitiveColumn] = useState('');
    const [sensitiveColumn2, setSensitiveColumn2] = useState('');
    const [metricType, setMetricType] = useState('demographic_parity');
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
        formData.append("sensitive_column2", sensitiveColumn2);


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
            className="mx-auto md:mt-20 items-center justify-between px-4 w-2/3">

            <div className='w-full p-2'>
                <label className="flex relative pb-9 flex-col items-center justify-center h-[550px] border-2 border-green-500 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-100 dark:border-green-600 dark:hover:border-gray-500">
                    <div className="relative items-center justify-center pt-4 h-[350px]">
                        {/* Conditionally render elements based on datasetFile state */}
                        {!datasetFile && (
                            <div className='text-xl text-gray-500 dark:text-gray-400 relative items-center justify-center'>
                                <p>Load the Dataset</p>
                                <br />
                                <svg className="w-8 h-8 mb-4 " ariaHidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                </svg>
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
                                <div className=" mx-auto p-4">
                                    <strong>Columns:</strong>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                                        {columns.map((col, index) => (
                                            <div key={col} className="px-1 py-1 border rounded shadow-md bg-white hover:shadow-lg transition duration-200">
                                                <div className="text-sm mb-1 text-gray-700">{col}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className='mt-5'>
                                    <h1 className='text-green-600 font-bold text-2xl'>Perfect!</h1>
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
                                className="px-4 py-1 border-2 border-red-500 text-red-500 rounded"
                            >
                                Change or Delete
                            </button>
                        </div>
                    )}
                </label>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="px-3">
                    <label className="block uppercase tracking-wide text-gray-100 text-xs font-bold mb-1" for="grid-city">
                        Label Column:*
                    </label>
                    <input className="appearance-none text-white bg-slate-600 block w-full focus:text-gray-700 border border-green-500 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-slate-300 focus:border-gray-500" id="" type="text" value={labelColumn} onChange={(e) => setLabelColumn(e.target.value)} />
                </div>

                <div className="px-3">
                    <label className="block uppercase tracking-wide text-gray-100 text-xs font-bold mb-1" for="grid-zip">
                        Sensitive Column:*
                    </label>
                    <input className="appearance-none text-white bg-slate-600 block w-full focus:text-gray-700 border border-green-500 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-slate-300 focus:border-gray-500" id="" type="text" value={sensitiveColumn} onChange={(e) => setSensitiveColumn(e.target.value)} />
                </div>

                <div className="px-3">
                    <label className="block uppercase tracking-wide text-gray-100 text-xs font-bold mb-1" for="grid-zip">
                        Sensitive Column:
                    </label>
                    <input className="appearance-none text-white bg-slate-600 block w-full focus:text-gray-700 border border-green-500 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-slate-300 focus:border-gray-500" id="" type="text" value={sensitiveColumn2} onChange={(e) => setSensitiveColumn2(e.target.value)} />
                </div>

                <div className="px-3 mt-4 ml-11">
                    <button type="submit"
                        className="text-green-500 flex hover:text-green-500 border border-green-500 hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded text-base px-7 py-2 text-center">
                        <span>Analyze</span>
                        <TbDeviceAnalytics className="ml-3 mt-1" />
                    </button>
                </div>
            </div>
        </form>


    );
};

export default Upload;