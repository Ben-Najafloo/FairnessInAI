import React from 'react'
import { FaFileUpload } from "react-icons/fa";

const DatasetUpload = ({ errorMessage, handleFileChange }) => {
    return (
        <div className="mx-auto md:pt-4 items-center justify-between md:pr-11 md:pl-11 pt-11 w-ful h-full">
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
        </div>
    )
}

export default DatasetUpload
