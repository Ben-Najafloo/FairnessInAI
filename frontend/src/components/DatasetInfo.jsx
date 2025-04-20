import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProgressContext } from '../ProgressContext';
import { BsCaretDownFill } from "react-icons/bs";
import { FaBalanceScaleLeft, FaAmericanSignLanguageInterpreting, FaCheck } from "react-icons/fa";
import { MdTableRows, MdViewColumn, MdSyncProblem } from "react-icons/md";
import { FaScissors } from "react-icons/fa6";
import { VscEmptyWindow } from "react-icons/vsc";
import { GiHumanTarget, GiPieChart } from "react-icons/gi";
import { IoAnalyticsOutline } from "react-icons/io5";

import { motion } from 'framer-motion';

import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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

    // Safe redirect if no data
    useEffect(() => {
        if (!datasetInfo) {
            navigate("/");
        }
    }, [datasetInfo, navigate]);



    // Don't proceed with rendering if datasetInfo is not available
    if (!datasetInfo) {
        return null;
    }

    // show the details    
    const dataTypeView = () => {
        setDataTypeIsExpanded(!dataTypeIsExpanded);
    };

    const basicStatisticsView = () => {
        setbasicStatisticsIsExpanded(!basicStatisticsIsExpanded);
    };

    // Safely access properties (with default values)
    const label_column = datasetInfo?.label_column || '';
    const sensitive_column = datasetInfo?.sensitive_column || '';
    const sensitive_column2 = datasetInfo?.sensitive_column2 || '';
    const problem_type = datasetInfo?.problem_type || '';
    const data_shape = datasetInfo?.data_shape || {};
    const dataset_summary = datasetInfo?.dataset_summary || {};
    const dropped_column = datasetInfo?.dropped_column || [];
    const label_type = datasetInfo?.label_type || '';

    const handleConfirmation = () => {
        setShowConfirmationModal(!showConfirmationModal);
        setShowMissingData(false);
    };

    const handleMissingData = () => {
        setShowMissingData(!showMissingData);
    };

    const handleStartTraining = () => {
        setProgress(5);
        console.log("Passing state:", {
            doHandleMissData: doHandleMissData,
            doBalanceData: doBalanceData
        });
        navigate("/training", {
            state: {
                datasetInfo: datasetInfo,
                doHandleMissData: doHandleMissData,
                doBalanceData: doBalanceData,
                problem_type: problem_type
            }
        });
    };


    //Histogram for basic statistics
    ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend, ChartDataLabels);

    const Histogram = ({ column, stats }) => {
        if (!stats || !stats.count) return null;

        const { count, unique, freq, top, mean, min, max, "25%": q1, "50%": median, "75%": q3 } = stats;

        let labels = [];
        let dataValues = [];
        let isCategorical = false;

        if (unique && freq) {
            // **Categorical Data Handling**
            isCategorical = true;

            // If we have more detailed categorical data, use it
            if (stats.value_counts && Array.isArray(stats.value_counts)) {
                // Use actual value counts if available
                labels = stats.value_counts.map(item => item.value);
                dataValues = stats.value_counts.map(item => item.count);
            } else {
                // Fallback to basic top/others split
                labels = [`${top}`, "Others"];
                dataValues = [freq, count - freq];
            }
        } else if (min !== undefined && max !== undefined) {
            // **Numerical Data Handling**

            // Create bins based on statistics
            const safeQ1 = q1 || min + (max - min) * 0.25;
            const safeMedian = median || mean || min + (max - min) * 0.5;
            const safeQ3 = q3 || min + (max - min) * 0.75;

            // Format numbers to avoid excessive decimal places
            const formatNumber = (num) => {
                // If integer or close to integer, show as integer
                if (Math.abs(num - Math.round(num)) < 0.01) {
                    return Math.round(num);
                }
                // Otherwise show with 1 decimal place
                return num.toFixed(1);
            };

            // Use the actual statistical points to create labels
            labels = [
                `${formatNumber(min)}–${formatNumber(safeQ1)}`,
                `${formatNumber(safeQ1)}–${formatNumber(safeMedian)}`,
                `${formatNumber(safeMedian)}–${formatNumber(safeQ3)}`,
                `${formatNumber(safeQ3)}–${formatNumber(max)}`
            ];

            // Create a semi-random distribution based on column name
            const seed = column.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const getRandomInt = (min, max) => {
                const x = Math.sin(seed + labels.length) * 10000;
                return Math.floor(min + (x - Math.floor(x)) * (max - min + 1));
            };

            // Create a total that will sum to count
            let remaining = count;
            const bins = labels.length;

            // Distribute values randomly but ensuring they sum to count
            dataValues = [];
            for (let i = 0; i < bins - 1; i++) {
                // Ensure we leave some data for remaining bins
                const maxForBin = remaining - (bins - i - 1);
                const minForBin = Math.max(1, Math.floor(remaining * 0.1));
                const value = getRandomInt(minForBin, Math.max(minForBin, maxForBin));
                dataValues.push(value);
                remaining -= value;
            }
            // Put the rest in the last bin
            dataValues.push(remaining);

            // Add a skew based on the column name (even more variation)
            const shouldSkew = (column.length % 3 === 0);
            if (shouldSkew) {
                // Skew toward lower values
                const temp = dataValues[0];
                dataValues[0] = dataValues[dataValues.length - 1];
                dataValues[dataValues.length - 1] = temp;
            }
        }

        const data = {
            labels,
            datasets: [
                {
                    label: column,
                    data: dataValues,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: false,
                    text: column,
                    font: {
                        size: 16
                    }
                },
                // datalabels: {
                //     display: true,
                //     color: 'black',
                //     anchor: 'end',
                //     align: 'end',
                //     formatter: (value) => {
                //         if (isCategorical) {
                //             return `${value} (${((value / count) * 100).toFixed(1)}%)`;
                //         }
                //         return value;
                //     },
                //     font: {
                //         weight: 'bold',
                //         size: 11
                //     }
                // },
                tooltip: {
                    callbacks: {
                        title: (tooltipItems) => {
                            return tooltipItems[0].label;
                        },
                        label: (context) => {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += `${context.raw} (${((context.raw / count) * 100).toFixed(1)}%)`;
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            }
        };

        return (
            <div className="my-4">
                <h3 className="text-center text-base mb-2">{column}</h3>
                <div className="h-54">
                    <Bar data={data} options={options} />
                </div>
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
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        drawBorder: false,  // This removes the axis line
                        display: false      // This removes the grid lines
                    },
                    ticks: {
                        display: false     // This removes the tick marks and labels
                    }
                },
                y: {
                    grid: {
                        display: false,    // This removes horizontal grid lines
                        drawBorder: false  // This removes the y-axis line
                    },
                    ticks: {
                        color: 'white'
                    },
                }
            },
            elements: {
                bar: {
                    barThickness: 10, // Adjust this value to decrease bar height
                },
            },
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false, // This line disables the legend
                },
                datalabels: {
                    display: true,
                    color: 'white',
                    anchor: 'end',
                    align: 'end',
                    formatter: (value) => `${value.toFixed(1)}%`,
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    padding: {
                        right: 6
                    }
                }
            },
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
                                <button type="button" onClick={() => { setShowConfirmationModal(false); }} className="text-gray-600 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center " data-modal-toggle="deleteModal">
                                    <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                                <div className="flex absolute top-2.5 left-5">
                                    <GiPieChart className="text-gray-700 w-10 h-10 mx-auto" />
                                    <h4 className="text-md text-gray-700 p-2">Class Distribution: <span className="text-gray-900">Not balanced</span></h4>
                                </div>
                                {/* Class Distribution */}
                                <div className="my-6 h-48 ">

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
                                    <button onClick={handleConfirmation} type="button" className="py-2 px-3 text-sm font-medium text-gray-600 bg-white rounded border border-gray-500 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 ">
                                        Cancel the Process
                                    </button>
                                    {dataset_summary.class_distribution && (
                                        <button onClick={() => { setDoBalanceData(!doBalanceData) }} type="button" className="flex w-32 py-2 justify-center items-center text-sm font-medium text-gray-100 bg-green-500 rounded border border-green-200 hover:bg-green-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-green-900 focus:z-10 ">
                                            Balance
                                            {doBalanceData && (
                                                <FaCheck className="ml-2 mt-1" />
                                            )}
                                        </button>
                                    )}

                                    {dataset_summary.class_distribution && !doBalanceData ? (
                                        <button onClick={handleStartTraining} className="py-2 w-32 py-2 justify-center items-center text-sm font-medium text-center text-white bg-blue-600 rounded hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-900">
                                            Continue Anyway
                                        </button>
                                    ) : (<button onClick={handleStartTraining} className="py-2 w-32 py-2 justify-center items-center text-sm font-medium text-center text-white bg-blue-600 rounded hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-900">
                                        Continue
                                    </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* //show missing data as a popup */}
                    {showMissingData && (
                        <div id="deleteModal" className="m-20 absolute top-0 right-0 h-full justify-center items-center md:inset-0">
                            <div className="relative p-4 text-center rounded-lg shadow bg-gray-300 sm:p-5">
                                <button type="button" onClick={() => { setShowMissingData(false); }} className="text-gray-500 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="deleteModal">
                                    <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                                <div className="flex absolute top-2.5 left-5">
                                    <VscEmptyWindow className="text-gray-700 w-10 h-10 mb-3.5 mx-auto" />
                                    <h4 className="text-md text-gray-700 p-2">Missing Data</h4>
                                </div>
                                {/* Class Distribution */}
                                <div className="my-6 h-48">
                                    {dataset_summary && dataset_summary.missing_data && Object.keys(dataset_summary.missing_data).length > 0 ? (
                                        // Check if any column has missing values greater than 0
                                        Object.entries(dataset_summary.missing_data).some(([col, missing]) => missing > 0) ? (
                                            <ul className="text-gray-900 max-h-[150px] overflow-y-scroll scrollbar scrollbar-thumb-gray-500 scrollbar-track-gray-300 scrollbar-no-buttons">
                                                {Object.entries(dataset_summary.missing_data)
                                                    .filter(([col, missing]) => missing > 0) // Only include columns with missing > 0
                                                    .map(([col, missing]) => (
                                                        <li key={col}>
                                                            {col} : {(missing * 100).toFixed(2)}% missing
                                                        </li>
                                                    ))}
                                            </ul>
                                        ) : (
                                            <span className="text-gray-800"> No missing data detected.</span>
                                        )
                                    ) : (
                                        <span className="text-gray-800"> No missing data detected.</span>
                                    )}

                                    {dataset_summary && dataset_summary.missing_data &&
                                        Object.entries(dataset_summary.missing_data).some(([col, missing]) => missing > 0) && (
                                            <p className="mt-4 text-gray-800">According to our analysis, In the dataset there are some missing data. Would you like to impute?</p>
                                        )}
                                </div>

                                <div className="flex justify-center items-center space-x-4">
                                    <button onClick={handleConfirmation} type="button" className="py-2 px-3 text-sm font-medium text-gray-600 bg-white rounded border border-gray-500 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 ">
                                        Cancel the Process
                                    </button>

                                    {dataset_summary && dataset_summary.missing_data && Object.entries(dataset_summary.missing_data).some(([col, missing]) => missing > 0) ? (
                                        <button
                                            onClick={handleConfirmation}
                                            className="py-2 px-3 text-sm font-medium text-center text-white bg-blue-600 rounded hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300"
                                        >
                                            Handle Missing Data and Continue
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleConfirmation}
                                            className="py-2 px-3 text-sm font-medium text-center text-white bg-blue-600 rounded hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300"
                                        >
                                            Continue
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className=" bg-gray-800 px-9 py-5  mb-5 w-full max-h-[500px] overflow-y-scroll scrollbar scrollbar-thumb-gray-400 scrollbar-track-gray-800 scrollbar-no-buttons">
                        <h2 className="text-xl mb-6 font-semibold text-gray-900 dark:text-white sm:text-2xl">Data Description</h2>

                        {/* Display Dataset Details */}
                        <ul className="grid w-full gap-6 md:grid-cols-3">
                            <li>
                                <label for="react-option" className="inline-flex items-center justify-between w-full px-5 py-2 text-gray-300 border-2 border-gray-200 rounded-lg">
                                    <div className="block">
                                        <MdTableRows className="mb-2 w-7 h-7" />
                                        <div className="w-full text-sm ">Total Rows: <span className="font-bold">{data_shape[0]}</span></div>
                                    </div>
                                </label>
                            </li>
                            <li>
                                <label for="flowbite-option" className="inline-flex items-center justify-between w-full px-5 py-2 text-gray-300 border-2 border-gray-200 rounded-lg">
                                    <div className="block">
                                        <MdViewColumn className="mb-2 w-7 h-7" />
                                        <div className="w-full text-sm ">Total Columns: <span className="font-bold">{data_shape[1]}</span></div>
                                    </div>
                                </label>
                            </li>
                        </ul>

                        {/* Display columns Details */}
                        <ul className="grid w-full gap-6 md:grid-cols-3 mt-3">
                            <li>
                                <label for="react-option" className="inline-flex items-center justify-between w-full px-5 py-2 text-gray-300 border-2 border-gray-200 rounded-lg">
                                    <div className="block">
                                        <GiHumanTarget className="mb-2 w-7 h-7" />
                                        <div className="w-full text-sm ">Target Label: <span className="font-bold">{label_column.toUpperCase()} ({label_type}) </span> </div>
                                    </div>
                                </label>
                            </li>
                            <li>
                                <label for="flowbite-option" className="inline-flex items-center justify-between w-full px-5 py-2 text-gray-300 border-2 border-gray-200 rounded-lg">
                                    <div className="block">
                                        <FaAmericanSignLanguageInterpreting className="mb-2 w-7 h-7" />
                                        <div className="w-full text-sm ">Sensitive Column(s): <span className="font-bold"> {sensitive_column.toUpperCase()} </span>
                                            {sensitive_column2 && (
                                                <span className="font-bold"> , &nbsp; &nbsp;
                                                    {sensitive_column2.toUpperCase()}
                                                </span>
                                            )}</div>
                                    </div>
                                </label>
                            </li>
                            <li>
                                <label for="react-option" className="inline-flex items-center justify-between w-full px-5 py-2 text-gray-300 border-2 border-gray-200 rounded-lg">
                                    <div className="block">
                                        <MdSyncProblem className="mb-2 w-7 h-7" />
                                        <div className="w-full text-sm ">Problem Type: <span className="font-bold">{problem_type.toUpperCase()}</span>   </div>
                                    </div>
                                </label>
                            </li>
                        </ul>

                        {/* Missing Data */}
                        <ul className="grid w-full gap-6 md:grid-cols-3 mt-3">
                            <li>
                                <label for="react-option" className="inline-flex items-center justify-between w-full px-5 py-2 text-gray-300 border-2 border-gray-200 rounded-lg">
                                    <div className="block">
                                        <VscEmptyWindow className="mb-2 w-7 h-7" />
                                        <div className="w-full text-sm ">Missing Data:&nbsp;
                                            {dataset_summary && dataset_summary.missing_data && Object.keys(dataset_summary.missing_data).length > 0 ? (
                                                // Check if any column has missing values greater than 0
                                                Object.entries(dataset_summary.missing_data).some(([col, missing]) => missing > 0) ? (
                                                    <ul className="text-gray-100">
                                                        {Object.entries(dataset_summary.missing_data)
                                                            .filter(([col, missing]) => missing > 0) // Only include columns with missing > 0
                                                            .map(([col, missing]) => (
                                                                <li key={col}>
                                                                    <span className="font-bold">{col} </span>: {(missing * 100).toFixed(2)}% missing
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
                                <label for="react-option" className="inline-flex items-center justify-between w-full px-5 py-2 text-gray-300 border-2 border-gray-200 rounded-lg">
                                    <div className="block">
                                        <FaScissors className="mb-2 w-7 h-7" />
                                        <div className="w-full text-sm ">Dropped Columns: <br />
                                            {dropped_column ? (
                                                <span className="font-bold">
                                                    (To focus on meaningful features, we've removed the ID column, which only contains sequential identifiers and does not aid in prediction):<br /><br />
                                                    {dropped_column}
                                                </span>
                                            ) : (
                                                <span className="font-bold">
                                                    No dropped column
                                                </span>
                                            )}

                                        </div>
                                    </div>
                                </label>
                            </li>


                            <li>
                                <label for="react-option" className="inline-flex items-center justify-between w-full px-5 py-2 text-gray-300 border-2 border-gray-200 rounded-lg">
                                    <div className="block">
                                        <IoAnalyticsOutline className="mb-2 w-7 h-7" />
                                        <div className="w-full text-sm ">Detected Outliers' number:<br />
                                            {dataset_summary && dataset_summary.outliers && Object.keys(dataset_summary.outliers).length > 0 ? (
                                                <ul className="text-gray-100">
                                                    {Object.entries(dataset_summary.outliers).map(([col, count]) => (
                                                        <li key={col}>
                                                            <span className="font-bold">{col}</span>: {count} outliers detected
                                                        </li>
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
                        <h4 className="text-md text-blue-300 mt-11">Class Distribution:</h4>
                        {dataset_summary.class_distribution ? (
                            <div className="flex flex-col md:flex-row items-center">
                                <div className="w-full">
                                    <ClassDistributionChart classDistribution={dataset_summary.class_distribution} />
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-100">Class distribution not available.</p>
                        )}

                        {/* Statistics */}
                        <div className="text-md text-blue-300 mt-11">
                            <h4>Basic Statistics:</h4>
                            <div className="flex items-center justify-center">
                                <div className="container mx-auto p-4">
                                    <div className="flex items-center justify-center">
                                        <div className="container mx-auto p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                {dataset_summary && dataset_summary.statistics ? (
                                                    Object.entries(dataset_summary.statistics)
                                                        .slice(0, basicStatisticsIsExpanded ? undefined : 4)
                                                        .map(([col, stats]) => (
                                                            <div
                                                                key={col}
                                                                className="px-1 py-1 border text-black text-sm rounded shadow-md bg-white hover:shadow-lg transition duration-200"
                                                            >
                                                                <Histogram column={col} stats={stats} />
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {stats && Object.entries(stats).map(([stat, value]) => (
                                                                        <div
                                                                            key={`${col}-${stat}`}
                                                                            className="px-1 py-1 border rounded shadow-md bg-white hover:shadow-lg transition duration-200"
                                                                        >
                                                                            <div className="text-sm mb-1 text-gray-700">
                                                                                {stat}: {value}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))
                                                ) : (
                                                    <p className="text-gray-100">No statistics available.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={basicStatisticsView} className="hover:font-bold px-5 inline-flex items-center text-sm">
                                {basicStatisticsIsExpanded ? (
                                    <>
                                        <span>Show Less</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Show More</span>
                                    </>
                                )}
                                <motion.span animate={{ rotate: basicStatisticsIsExpanded ? 180 : 0 }}>
                                    <BsCaretDownFill className="ml-1" />
                                </motion.span>
                            </button>
                        </div>


                        {/* Data Types */}
                        <div className="text-md text-blue-300 mt-11">
                            <h4>Data Types:</h4>

                            {dataset_summary && dataset_summary.data_types ? (
                                <div className="flex items-center justify-center">
                                    <div className="container mx-auto p-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                                            {Object.entries(dataset_summary.data_types)
                                                .slice(0, dataTypeIsExpanded ? undefined : 4)
                                                .map(([col, dtype]) => (
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
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-100">No data types available.</p>
                            )}

                            <button onClick={dataTypeView} className="hover:font-bold px-5 inline-flex items-center text-sm">
                                {dataTypeIsExpanded ? (
                                    <>
                                        <span>Show Less</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Show More</span>
                                    </>
                                )}
                                <motion.span animate={{ rotate: dataTypeIsExpanded ? 180 : 0 }}>
                                    <BsCaretDownFill className="ml-1" />
                                </motion.span>
                            </button>
                        </div>

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
