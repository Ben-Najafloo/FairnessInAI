import React, { useContext, useState } from 'react';
import { ProgressContext } from '../ProgressContext';
import axios from 'axios';
import ContinueMessage from './ContinueMessage';
import { TbDeviceAnalytics } from "react-icons/tb";
import { useNavigate } from "react-router-dom";


const Upload = () => {
    const { setProgress } = useContext(ProgressContext);
    const navigate = useNavigate();
    const [datasetFile, setDatasetFile] = useState(null);
    const [labelColumn, setLabelColumn] = useState('');
    const [sensitiveColumn, setSensitiveColumn] = useState('');
    const [metricType, setMetricType] = useState('demographic_parity');
    const [fileName, setFileName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [contineMessage, setContinueMessage] = useState('');


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

                setContinueMessage("");
                return;
            }

            // If valid, clear error and set the file
            setErrorMessage(''); // Clear any previous error messages
            setDatasetFile(selectedFile);
            setFileName(selectedFile.name);
            setContinueMessage(<ContinueMessage />);
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
        formData.append("metric_type", metricType);

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

        <form onSubmit={handleSubmit} enctype="multipart/form-data" className="mx-auto md:mt-20 items-center justify-between p-4 w-2/3">

            <div className='w-full p-2'>
                <label className="flex flex-col items-center justify-center h-96 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                    <div className="relative items-center justify-center pt-5 pb-6">
                        {/* Conditionally render elements based on datasetFile state */}
                        {!datasetFile && (
                            <>
                                <p>Load the Dataset</p>
                                <br />
                                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                </svg>
                                <p className="mb-7 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                            </>
                        )}

                        {fileName && (
                            <p className="text-base text-gray-700">Selected File: {fileName}</p>
                        )}

                        {errorMessage && (
                            <p className="mt-2 text-sm text-red-600">
                                {errorMessage}
                            </p>
                        )}

                        {contineMessage && (
                            <p>
                                {contineMessage}
                            </p>
                        )}

                        {/* Show delete button if a file is loaded */}
                        {datasetFile && (
                            <div className='float-right mt-20'>

                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-1 border-2 border-red-500 text-red-500 rounded"
                                >
                                    Change or Delete
                                </button>
                            </div>
                        )}
                    </div>
                    <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </label>
            </div>

            <div className="w-2/3 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 pt-2">
                <div className="w-full px-3 sm:col-span-2">
                    <label className="block uppercase tracking-wide text-gray-100 text-xs font-bold mb-1" for="grid-city">
                        Label Column:
                    </label>
                    <input className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="" type="text" value={labelColumn} onChange={(e) => setLabelColumn(e.target.value)} />
                </div>
                <div className="w-full px-3 sm:col-span-2">
                    <label className="block uppercase tracking-wide text-gray-100 text-xs font-bold mb-1" for="grid-state">
                        Fairness Metric:
                    </label>
                    <div className="relative">
                        <select className="block appearance-none w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                            id=""
                            value={metricType}
                            onChange={(e) => setMetricType(e.target.value)}>
                            <option>Demographic Parity</option>
                            <option>Equalized Odds</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
                <div className="w-full px-3 sm:col-span-2">
                    <label className="block uppercase tracking-wide text-gray-100 text-xs font-bold mb-1" for="grid-zip">
                        Sensitive Column:
                    </label>
                    <input className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="" type="text" value={sensitiveColumn} onChange={(e) => setSensitiveColumn(e.target.value)} />
                </div>
                <div className="w-full px-3 mt-4">
                    <button type="submit" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-9 rounded inline-flex items-center">
                        <span>Analyze</span>
                        <TbDeviceAnalytics className="ml-3" />
                    </button>
                </div>
            </div>
        </form>


    );
};

export default Upload;