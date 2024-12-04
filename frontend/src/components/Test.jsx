import React, { useState } from 'react';

const Test = () => {
    const [datasetFile, setDatasetFile] = useState(null);
    const [fileName, setFileName] = useState('');

    // Handle file input change
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setDatasetFile(selectedFile);
        setFileName(selectedFile ? selectedFile.name : '');
    };

    // Handle delete action
    const handleDelete = () => {
        setDatasetFile(null);
        setFileName('');
    };

    return (
        <label className="flex w-2/3 flex-col items-center justify-center h-64 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
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
                    <p className="text-base text-blue-700">Selected File: {fileName}</p>
                )}

                {/* Show delete button if a file is loaded */}
                {datasetFile && (
                    <button
                        onClick={handleDelete}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
                    >
                        Delete
                    </button>
                )}
            </div>
            <input
                id="dropzone-file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
            />
        </label>
    );
};

export default Test;