import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProgressContext } from '../ProgressContext';
import { BsCaretDownFill } from "react-icons/bs";
import { motion } from 'framer-motion';

const DatasetInfo = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const datasetInfo = location.state?.datasetInfo;
    const [dataTypeIsExpanded, setDataTypeIsExpanded] = useState(false);
    const [basicStatisticsIsExpanded, setbasicStatisticsIsExpanded] = useState(false);
    const { setProgress } = useContext(ProgressContext);

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

    const handleStartTraining = () => {
        setProgress(4);
        navigate("/training", { state: { datasetInfo: datasetInfo } });
    };

    return (
        <div>
            <section>
                <div className="md:p-5 md:pl-5">
                    <div className="bg-gray-800 p-9 rounded-lg mb-8 md:max-h-[650px] overflow-auto">

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
                            <h4 className="text-md text-blue-300 ">Missing Data:</h4>
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
                                    <span className="text-gray-100">No missing data detected.</span>
                                )
                            ) : (
                                <span className="text-gray-100">No missing data detected.</span>
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
                        <button onClick={handleStartTraining} className="text-white bg-blue-500 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                            Continue
                        </button>
                    </div>
                </div>
            </section >
        </div >
    );
};

export default DatasetInfo;
