import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProgressContext } from '../ProgressContext';
import { BsCaretDownFill } from "react-icons/bs";
import { FaBalanceScaleLeft } from "react-icons/fa";
import { motion } from 'framer-motion';

const DatasetInfo = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const datasetInfo = location.state?.datasetInfo;
    const [dataTypeIsExpanded, setDataTypeIsExpanded] = useState(false);
    const [basicStatisticsIsExpanded, setbasicStatisticsIsExpanded] = useState(false);
    const { setProgress } = useContext(ProgressContext);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    if (!datasetInfo) {
        navigate("/");
        return null;
    }

    // show the details    
    const dataTypeView = () => {
        setDataTypeIsExpanded(!dataTypeIsExpanded);
    };

    const basicStatisticsView = () => {
        setbasicStatisticsIsExpanded(!basicStatisticsIsExpanded);
    };

    const { label_column, sensitive_column, sensitive_column2, data_shape, dataset_summary } = datasetInfo;

    const handleConfirmation = () => {
        setShowConfirmationModal(!showConfirmationModal);
    };
    const handleStartTraining = () => {
        setProgress(4);
        navigate("/training", { state: { datasetInfo: datasetInfo } });
    };

    return (
        <div>
            <section>
                <div className="relative md:p-5 md:pl-5">
                    {showConfirmationModal && (
                        <div id="deleteModal" className="mt-20 ml-96 absolute top-0 right-0 justify-center items-center w-full md:inset-0 h-modal md:h-full">
                            <div className="relative p-4 w-full max-w-md h-full md:h-auto">

                                <div className="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-700 sm:p-5">
                                    <button type="button" onClick={handleConfirmation} className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="deleteModal">
                                        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                        <span className="sr-only">Close modal</span>
                                    </button>
                                    <FaBalanceScaleLeft className="text-gray-400 dark:text-gray-500 w-11 h-11 mb-3.5 mx-auto" />
                                    {/* Class Distribution */}
                                    <div className="my-6">
                                        <h4 className="text-md text-blue-300">Class Distribution: Not balanced</h4>
                                        {dataset_summary.class_distribution ? (
                                            <ul className="text-gray-100">
                                                {Object.entries(dataset_summary.class_distribution).map(([cls, percent]) => (
                                                    <li key={cls}>{cls}: {(percent * 100).toFixed(2)}%</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-100">Class distribution not available.</p>
                                        )}
                                    </div>
                                    <p className="mb-4 text-gray-500 dark:text-gray-300">According to our analysis, the dataset is not suitable for training. Are you sure you want to continue?</p>
                                    <div className="flex justify-center items-center space-x-4">
                                        <button onClick={handleConfirmation} type="button" className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                                            No, cancel
                                        </button>
                                        <button onClick={handleStartTraining} className="py-2 px-3 text-sm font-medium text-center text-white bg-blue-600 rounded hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-900">
                                            Yes, Continue Anymore
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>)}
                    <div className=" bg-gray-800 p-9 rounded-lg mb-8 max-h-[570px] overflow-auto">

                        {/* Display Dataset Details */}

                        <div className="flex mb-2">
                            <h4 className="text-md mr-2 text-blue-300">File Name:</h4>
                            <span className="text-gray-100">{datasetInfo.file_name}</span>
                        </div>
                        <div className="flex mb-2">
                            <h4 className="text-md mr-2 text-blue-300">Total Rows:</h4>
                            <span className="text-gray-100">{data_shape[0]} </span>
                        </div>
                        <div className="flex mb-2">
                            <h4 className="text-md mr-2 text-blue-300">Total Columns:</h4>
                            <span className="text-gray-100">{data_shape[1]}</span>
                        </div>
                        <div className="flex mb-2">
                            <h4 className="text-md mr-2 text-blue-300">Label Column:</h4>
                            <span className="text-gray-100">{label_column} </span>
                        </div>
                        <div className="flex mb-2">
                            <h4 className="text-md mr-2 text-blue-300">Sensitive Column:</h4>
                            <span className="text-gray-100">{sensitive_column}</span>
                        </div>

                        <div className="flex mb-2">
                            <h4 className="text-md mr-2 text-blue-300">Second Sensitive Column:</h4>
                            {sensitive_column2 ? (
                                <span className="text-gray-100">{sensitive_column2}</span>
                            ) : (
                                <span className="text-gray-100">Not selected</span>
                            )}
                        </div>


                        {/* Missing Data */}
                        <div className="flex mt-2">
                            <h4 className="text-md text-blue-300 ">Missing Data: </h4>
                            {dataset_summary.missing_data && Object.keys(dataset_summary.missing_data).length > 0 ? (
                                // Check if any column has missing values greater than 0
                                Object.entries(dataset_summary.missing_data).some(([col, missing]) => missing > 0) ? (
                                    <ul className="text-gray-100">
                                        {Object.entries(dataset_summary.missing_data)
                                            .filter(([col, missing]) => missing > 0) // Only include columns with missing > 0
                                            .map(([col, missing]) => (
                                                <li key={col}>
                                                    {col}: {(missing * 100).toFixed(2)}% missing
                                                </li>
                                            ))}
                                    </ul>
                                ) : (
                                    <span className="text-gray-100"> No missing data detected.</span>
                                )
                            ) : (
                                <span className="text-gray-100"> No missing data detected.</span>
                            )}
                        </div>

                        {/* Data Types */}
                        <div className="flex text-md text-blue-300 mt-6">
                            <h4>Data Types:</h4>
                            <button onClick={dataTypeView} class=" hover:font-bold px-5 inline-flex items-center">
                                {dataTypeIsExpanded ? (
                                    <>
                                        <span>Hide</span>
                                    </>
                                ) : (
                                    <>
                                        <span>View</span>
                                    </>
                                )}
                                <motion.span animate={{ rotate: dataTypeIsExpanded ? 180 : 0 }}>
                                    <BsCaretDownFill className="ml-1" />
                                </motion.span>
                            </button>
                        </div>
                        {dataset_summary.data_types && (
                            <div className="flex items-center justify-center">
                                <div className="container mx-auto p-4">
                                    {dataTypeIsExpanded && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                                            {Object.entries(dataset_summary.data_types).map(([col, dtype]) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    key={col}
                                                    className="px-1 py-1 border rounded shadow-md bg-white hover:shadow-lg transition duration-200"
                                                >
                                                    <div className="text-sm mb-1 text-gray-700">{col} : {dtype}</div>

                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                        )}


                        {/* Statistics */}
                        <div className="flex text-md text-blue-300 mt-6">
                            <h4>Basic Statistics:</h4>
                            <button onClick={basicStatisticsView} class=" hover:font-bold px-5 inline-flex items-center">
                                {basicStatisticsIsExpanded ? (
                                    <>
                                        <span>Hide</span>
                                    </>
                                ) : (
                                    <>
                                        <span>View</span>
                                    </>
                                )}
                                <motion.span animate={{ rotate: basicStatisticsIsExpanded ? 180 : 0 }}>
                                    <BsCaretDownFill className="ml-1" />
                                </motion.span>
                            </button>
                        </div>
                        {dataset_summary.statistics && Object.keys(dataset_summary.statistics).length > 0 ? (
                            <div className="flex items-center justify-center">
                                <div className="container mx-auto p-4">
                                    {basicStatisticsIsExpanded && (
                                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                            {Object.entries(dataset_summary.statistics).map(([col, stats]) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    key={col}
                                                    className="px-1 py-1 border rounded shadow-md bg-white hover:shadow-lg transition duration-200"
                                                >
                                                    <strong>{col}:</strong>
                                                    <ul>
                                                        {Object.entries(stats).map(([stat, value]) => (
                                                            <li key={stat} className="text-sm mb-1">{stat}: {value}</li>
                                                        ))}
                                                    </ul>
                                                </motion.div>

                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-100">No statistics available.</p>
                        )}

                        {/* Class Distribution */}
                        <h4 className="text-md text-blue-300 mt-6">Class Distribution:</h4>
                        {dataset_summary.class_distribution ? (
                            <ul className="text-gray-100">
                                {Object.entries(dataset_summary.class_distribution).map(([cls, percent]) => (
                                    <li key={cls}>{cls}: {(percent * 100).toFixed(2)}%</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-100">Class distribution not available.</p>
                        )}

                        {/* Sensitive Column Distribution */}
                        {/* <h4 className="text-md text-blue-300 mt-6">Sensitive Column Distribution:</h4>
                        {dataset_summary.sensitive_column_distribution ? (
                            <ul className="text-gray-100">
                                {Object.entries(dataset_summary.sensitive_column_distribution).map(([val, percent]) => (
                                    <li key={val}>{val}: {(percent * 100).toFixed(2)}%</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-100">Sensitive column distribution not available.</p>
                        )} */}

                        {/* Outliers */}
                        <h4 className="text-md text-blue-300 mt-6">Outliers Detected:</h4>
                        {dataset_summary.outliers && Object.keys(dataset_summary.outliers).length > 0 ? (
                            <ul className="text-gray-100">
                                {Object.entries(dataset_summary.outliers).map(([col, count]) => (
                                    <li key={col}>{col}: {count} outliers detected</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-100">No outliers detected.</p>
                        )}


                    </div>


                    <div className="flex items-center space-x-4">
                        <a href="/upload" className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                            Change the Dataset
                        </a>
                        <button onClick={handleConfirmation} className="text-white bg-blue-500 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                            Continue
                        </button>
                    </div>
                </div>
            </section >
        </div >
    );
};

export default DatasetInfo;
