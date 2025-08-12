import React, { useContext } from 'react';
import Papa from 'papaparse';
import { FaFileUpload } from "react-icons/fa";
import { ProgressContext } from '../../ProgressContext';
import { motion, AnimatePresence } from "framer-motion";

const DatasetUpload = ({ setHelpPopUpTarget, setTargetTableShow, labelColumn, setColumns, setDatasetFile, errorMessage, setErrorMessage, setFileName }) => {

    const { setProgress } = useContext(ProgressContext);

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

    return (
        <AnimatePresence mode="wait">
            <motion.div className="mx-auto md:pt-4 items-center justify-between md:pr-11 md:pl-11 pt-11 w-ful h-full"
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -200, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
            >
                <label>
                    <div className="flex relative w-ful h-full pb-9 flex-col items-center justify-center border-2 border-green-500 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-100 dark:border-green-600 dark:hover:border-gray-500">

                        <div className="relative items-center  justify-center">
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
            </motion.div>
        </AnimatePresence>
    )
}

export default DatasetUpload
