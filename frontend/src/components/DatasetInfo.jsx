import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProgressContext } from '../ProgressContext';
import { BsCaretDownFill } from "react-icons/bs";
import { FaBalanceScaleLeft, FaAmericanSignLanguageInterpreting, FaCheck } from "react-icons/fa";
import { MdTableRows, MdViewColumn, MdSyncProblem } from "react-icons/md";
import { FaScissors } from "react-icons/fa6";
import { VscEmptyWindow } from "react-icons/vsc";
import { GiHumanTarget } from "react-icons/gi";
import { IoAnalyticsOutline } from "react-icons/io5";

import { motion } from 'framer-motion';

import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

const DatasetInfo = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const datasetInfo = location.state?.datasetInfo;
    const [dataTypeIsExpanded, setDataTypeIsExpanded] = useState(false);
    const [basicStatisticsIsExpanded, setbasicStatisticsIsExpanded] = useState(false);
    const { setProgress } = useContext(ProgressContext);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showMissingData, setShowMissingData] = useState(false);
    const [doHandleMissData, setDoHandleMissData] = useState(false);
    const [doBalanceData, setDoBalanceData] = useState(false);

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

    const { label_column, sensitive_column, sensitive_column2, problem_type, data_shape, dataset_summary, dropped_column, label_type } = datasetInfo;

    const handleConfirmation = () => {
        setShowConfirmationModal(!showConfirmationModal);
        setShowMissingData(false);
    };

    const handleMissingData = () => {
        setShowMissingData(!showMissingData);
    }


    const handleStartTraining = () => {
        setProgress(7);
        console.log("Passing state:", {
            doHandleMissData: doHandleMissData,
            doBalanceData: doBalanceData
        });
        navigate("/training", {
            state: {
                datasetInfo: datasetInfo,
                doHandleMissData: doHandleMissData,
                doBalanceData: doBalanceData
            }
        });
    };

    //Histogram for basic statistics
    ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);
    const Histogram = ({ column, stats }) => {
        if (!stats || !stats.count) return null;

        const { count, unique, freq, top, mean, std, min, max, "25%": q1, "50%": median, "75%": q3 } = stats;

        let labels = [];
        let dataValues = [];

        if (unique && freq) {
            // **Categorical Data Handling**
            labels = [`${top} `, "Others"];
            dataValues = [freq, count - freq];
        } else if (min !== undefined && max !== undefined) {
            // **Numerical Data Handling**
            labels = [`Min (${min})`, `25% (${q1 || min})`, `50% (${median || mean})`, `75% (${q3 || max})`, `Max (${max})`];

            // Estimate frequencies assuming normal-like spread
            dataValues = [
                count * 0.1,  // Min
                count * 0.25, // Q1
                count * 0.35, // Median
                count * 0.2,  // Q3
                count * 0.1   // Max
            ];
        }

        const data = {
            labels,
            datasets: [
                {
                    label: column,
                    data: dataValues,
                    backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                    borderColor: ['rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1,
                },
            ],
        };

        return (
            <div className="my-4">
                <Bar data={data} />
            </div>
        );
    };

    const ClassDistributionChart = ({ classDistribution }) => {
        if (!classDistribution) return <p className="text-gray-100">Class distribution not available.</p>;

        const labels = Object.keys(classDistribution);
        const dataValues = Object.values(classDistribution).map(percent => percent * 100); // Convert to percentage

        const data = {
            labels,
            datasets: [
                {
                    label: 'Class Distribution (%)',
                    data: dataValues,
                    backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                    borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1,
                },
            ],
        };

        const options = {
            indexAxis: 'y', // Horizontal bar chart
            scales: {
                x: { beginAtZero: true, max: 100 },
            },
            elements: {
                bar: {
                    barThickness: 10, // Adjust this value to decrease bar height
                },
            },
            maintainAspectRatio: false, // Allows custom height adjustments
        };

        return <Bar data={data} options={options} />;
    };

    const ClassDistributionPieChart = ({ classDistribution }) => {
        if (!classDistribution) return <p className="text-gray-100">Class distribution not available.</p>;

        const labels = Object.keys(classDistribution);
        const dataValues = Object.values(classDistribution).map(percent => percent * 100);

        const data = {
            labels,
            datasets: [
                {
                    label: 'Class Distribution (%)',
                    data: dataValues,
                    backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                    borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1,
                },
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'rgb(255, 255, 255)',
                        font: {
                            size: 14, // Adjust font size
                            weight: 'bold', // Make text bold
                        },
                        generateLabels: (chart) => {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    return {
                                        text: `${label}: ${value.toFixed(2)}%`, // Add percentage to legend
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        hidden: isNaN(value),
                                        index: i,
                                    };
                                });
                            }
                            return [];
                        },
                    },
                },
            },
        };

        return (
            <div className="w-full md:w-1/3 h-36 mt-3">
                <Pie data={data} options={options} />
            </div>
        );
    };

    return (
        <div>
            <section>
                <div className="relative  md:pl-5 w-full">

                    {showConfirmationModal && (
                        <div id="deleteModal" className="m-20 absolute top-0 right-0 justify-center items-center md:inset-0 h-full">
                            <div className="relative p-4 text-center rounded-lg shadow bg-gray-300 sm:p-5">
                                <button type="button" onClick={() => { setShowConfirmationModal(false); }} className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="deleteModal">
                                    <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                                <FaBalanceScaleLeft className="text-gray-400 dark:text-gray-500 w-11 h-11 mb-3.5 mx-auto" />
                                {/* Class Distribution */}
                                <div className="my-6 h-48 ">
                                    <h4 className="text-md text-blue-900">Class Distribution: Not balanced</h4>
                                    {dataset_summary.class_distribution ? (
                                        <div className="flex text-center justify-center">
                                            <ClassDistributionPieChart classDistribution={dataset_summary.class_distribution} />
                                        </div>
                                    ) : (
                                        <p className="text-gray-100">Class distribution not available.</p>
                                    )}
                                </div>
                                <p className="mb-4 text-gray-900">According to our analysis, the classes of target column are inbalanced which may cause algorithmic bias.</p>
                                <div className="flex justify-center items-center space-x-4">
                                    <button onClick={handleConfirmation} type="button" className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                                        Cancel the Process
                                    </button>
                                    <button onClick={() => { setDoBalanceData(!doBalanceData) }} type="button" className="flex py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded border border-green-200 hover:bg-green-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-green-900 focus:z-10 dark:bg-green-700 dark:text-green-300 dark:border-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-600">
                                        Balance
                                        {doBalanceData && (
                                            <FaCheck className="ml-2 mt-1" />
                                        )}
                                    </button>
                                    <button onClick={handleStartTraining} className="py-2 px-3 text-sm font-medium text-center text-white bg-blue-600 rounded hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-900">
                                        Continue Anyway
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* //show missing data as a popup */}
                    {showMissingData && (
                        <div id="deleteModal" className="m-20 absolute top-0 right-0 justify-center items-center md:inset-0 h-full">
                            <div className="relative p-4 text-center rounded-lg shadow bg-gray-300 sm:p-5">
                                <button type="button" onClick={() => { setShowMissingData(false); }} className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="deleteModal">
                                    <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                                <FaBalanceScaleLeft className="text-gray-400 dark:text-gray-500 w-11 h-11 mb-3.5 mx-auto" />
                                {/* Class Distribution */}
                                <div className="my-6 h-48">
                                    <h4 className="text-md text-blue-800">Missing Data</h4>
                                    {dataset_summary.missing_data && Object.keys(dataset_summary.missing_data).length > 0 ? (
                                        // Check if any column has missing values greater than 0
                                        Object.entries(dataset_summary.missing_data).some(([col, missing]) => missing > 0) ? (
                                            <ul className="text-gray-900">
                                                {Object.entries(dataset_summary.missing_data)
                                                    .filter(([col, missing]) => missing > 0) // Only include columns with missing > 0
                                                    .map(([col, missing]) => (
                                                        <li key={col}>
                                                            {col}: {(missing * 100).toFixed(2)}% missing
                                                        </li>
                                                    ))}
                                            </ul>
                                        ) : (
                                            <span className="text-gray-800"> No missing data detected.</span>
                                        )
                                    ) : (
                                        <span className="text-gray-800"> No missing data detected.</span>
                                    )}

                                    {Object.entries(dataset_summary.missing_data).some(([col, missing]) => missing > 0) && (
                                        <p className="mt-4 text-gray-800">According to our analysis, In the dataset there are some missing data. Would you like to dismiss?</p>
                                    )}
                                </div>

                                <div className="flex justify-center items-center space-x-4">
                                    <button onClick={handleConfirmation} type="button" className="py-2 px-3 text-sm font-medium text-gray-600 bg-white rounded border border-gray-500 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 ">
                                        Cancel the Process
                                    </button>
                                    {/* Only show the "Dismiss" button if there are missing values */}
                                    {Object.entries(dataset_summary.missing_data).some(([col, missing]) => missing > 0) && (
                                        <button type="button" onClick={() => { setDoHandleMissData(!doHandleMissData) }} className="flex py-2 px-3 text-sm font-medium text-white bg-green-500 rounded border border-green-200 hover:bg-green-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-green-900 focus:z-10 ">
                                            Handle Missing Data
                                            {doHandleMissData && (
                                                <FaCheck className="ml-2 mt-1" />
                                            )}
                                        </button>
                                    )}
                                    {Object.entries(dataset_summary.missing_data).some(([col, missing]) => missing > 0) ? (
                                        <button onClick={handleConfirmation} className="py-2 px-3 text-sm font-medium text-center text-white bg-blue-600 rounded hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300">
                                            Continue Anyway
                                        </button>
                                    ) : (
                                        <button onClick={handleConfirmation} className="py-2 px-3 text-sm font-medium text-center text-white bg-blue-600 rounded hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300">
                                            Continue
                                        </button>
                                    )}

                                </div>
                            </div>
                        </div>
                    )}

                    <div className=" bg-gray-800 px-9 py-5 rounded-lg mb-5 w-full max-h-[500px] overflow-auto">
                        <h2 className="text-xl mb-6 font-semibold text-gray-900 dark:text-white sm:text-2xl">Data Description</h2>

                        {/* Display Dataset Details */}
                        <ul class="grid w-full gap-6 md:grid-cols-3">
                            <li>
                                <label for="react-option" class="inline-flex items-center justify-between w-full px-5 py-2 text-gray-300 border-2 border-gray-200 rounded-lg">
                                    <div class="block">
                                        <MdTableRows class="mb-2 w-7 h-7" />
                                        <div class="w-full text-base ">Total Rows: {data_shape[0]}</div>
                                    </div>
                                </label>
                            </li>
                            <li>
                                <label for="flowbite-option" class="inline-flex items-center justify-between w-full px-5 py-2 text-gray-300 border-2 border-gray-200 rounded-lg">
                                    <div class="block">
                                        <MdViewColumn class="mb-2 w-7 h-7" />
                                        <div class="w-full text-base ">Total Columns: {data_shape[1]}</div>
                                    </div>
                                </label>
                            </li>
                        </ul>

                        {/* Display columns Details */}
                        <ul class="grid w-full gap-6 md:grid-cols-3 mt-3">
                            <li>
                                <label for="react-option" class="inline-flex items-center justify-between w-full px-5 py-2 text-gray-300 border-2 border-gray-200 rounded-lg">
                                    <div class="block">
                                        <GiHumanTarget class="mb-2 w-7 h-7" />
                                        <div class="w-full text-base ">Target Label: {label_column.toUpperCase()} ({label_type})  </div>
                                    </div>
                                </label>
                            </li>
                            <li>
                                <label for="flowbite-option" class="inline-flex items-center justify-between w-full px-5 py-2 text-gray-300 border-2 border-gray-200 rounded-lg">
                                    <div class="block">
                                        <FaAmericanSignLanguageInterpreting class="mb-2 w-7 h-7" />
                                        <div class="w-full text-base ">Sensitive Column(s): {sensitive_column.toUpperCase()}
                                            {sensitive_column2 && (
                                                <span> , &nbsp; &nbsp;
                                                    {sensitive_column2.toUpperCase()}
                                                </span>
                                            )}</div>
                                    </div>
                                </label>
                            </li>
                            <li>
                                <label for="react-option" class="inline-flex items-center justify-between w-full px-5 py-2 text-gray-300 border-2 border-gray-200 rounded-lg">
                                    <div class="block">
                                        <MdSyncProblem class="mb-2 w-7 h-7" />
                                        <div class="w-full text-base ">Problem Type: {problem_type.toUpperCase()}   </div>
                                    </div>
                                </label>
                            </li>
                        </ul>

                        {/* Missing Data */}
                        <ul class="grid w-full gap-6 md:grid-cols-3 mt-3">
                            <li>
                                <label for="react-option" class="inline-flex items-center justify-between w-full px-5 py-2 text-gray-300 border-2 border-gray-200 rounded-lg">
                                    <div class="block">
                                        <VscEmptyWindow class="mb-2 w-7 h-7" />
                                        <div class="w-full text-base ">Missing Data:&nbsp;
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
                                    </div>
                                </label>
                            </li>
                            <li>
                                <label for="react-option" class="inline-flex items-center justify-between w-full px-5 py-2 text-gray-300 border-2 border-gray-200 rounded-lg">
                                    <div class="block">
                                        <FaScissors class="mb-2 w-7 h-7" />
                                        <div class="w-full text-base ">Dropped Columns:<br />
                                            {dropped_column}
                                        </div>
                                    </div>
                                </label>
                            </li>


                            <li>
                                <label for="react-option" class="inline-flex items-center justify-between w-full px-5 py-2 text-gray-300 border-2 border-gray-200 rounded-lg">
                                    <div class="block">
                                        <IoAnalyticsOutline class="mb-2 w-7 h-7" />
                                        <div class="w-full text-base ">Outliers Detected:<br />
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
                                    </div>
                                </label>
                            </li>







                        </ul>

                        {/* Class Distribution */}
                        <h4 className="text-md text-blue-300 mt-6">Class Distribution:</h4>
                        {dataset_summary.class_distribution ? (
                            <div className="flex flex-col md:flex-row items-center">
                                {/* <ul className="text-gray-100 mr-4">
                                    {Object.entries(dataset_summary.class_distribution).map(([cls, percent]) => (
                                        <li key={cls}>{cls}: {(percent * 100).toFixed(2)}%</li>
                                    ))}
                                </ul> */}
                                <div className="w-full">
                                    <ClassDistributionChart classDistribution={dataset_summary.class_distribution} />
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-100">Class distribution not available.</p>
                        )}



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
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            {Object.entries(dataset_summary.statistics).map(([col, stats]) => (
                                                <div
                                                    key={col}
                                                    className="px-1 py-1 border text-sm rounded shadow-md bg-white hover:shadow-lg transition duration-200"
                                                >
                                                    <Histogram column={col} stats={stats} />
                                                    {/* <strong className="text-blue-600">{col}:</strong> */}
                                                    <ul>
                                                        {Object.entries(stats).map(([stat, value]) => (
                                                            <li key={stat} className="text-sm mb-1">{stat}: {value}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-100">No statistics available.</p>
                        )}


                    </div>

                    <div className="flex items-center space-x-4">
                        <a href="/upload" className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                            Change the Dataset
                        </a>
                        <button onClick={handleMissingData} className="text-white bg-blue-500 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                            Continue
                        </button>
                    </div>
                </div>
            </section >
        </div >
    );
};

export default DatasetInfo;
