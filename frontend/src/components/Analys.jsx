import React, { useContext, useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ProgressContext } from '../ProgressContext';
import { FaCheck, FaGoogleDrive } from "react-icons/fa";
import { FaRegShareFromSquare, FaFilePdf } from "react-icons/fa6";
import { MdEmail, MdOutlineQrCodeScanner, MdAddchart } from "react-icons/md";
import ChartDataLabels from 'chartjs-plugin-datalabels';
// import { IoMdHome } from "react-icons/io";

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

import {
    BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// download
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Analys = () => {
    const location = useLocation();
    const { result } = location.state || {};
    const { setProgress } = useContext(ProgressContext);
    const [isShared, setIsShared] = useState(false);

    // const [modelData, setModelData] = useState({
    //     fairness: {
    //         demographic_parity_difference: 0,
    //         equalized_odds_difference: 0.05,
    //         selection_rate_disparity: 0.92,
    //         accuracy_disparity: 0.95
    //     },
    //     group_metrics: {
    //         group_0: {
    //             count: 150,
    //             accuracy: 0.77,
    //             selection_rate: 0.42,
    //             false_positive_rate: 0.21,
    //             false_negative_rate: 0.18
    //         },
    //         group_1: {
    //             count: 120,
    //             accuracy: 0.81,
    //             selection_rate: 0.39,
    //             false_positive_rate: 0.19,
    //             false_negative_rate: 0.15
    //         }
    //     },

    //     feature_importance: {
    //         "age": 0.28,
    //         "income": 0.22,
    //         "education": 0.18,
    //         "location": 0.12,
    //         "employment": 0.10,
    //         "marital_status": 0.06,
    //         "credit_score": 0.04
    //     }
    // });

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress(9);
        }, 3000);

        return () => clearTimeout(timer);
    }, [setProgress]);

    const handleSharing = () => {
        setProgress(10);
        setIsShared(!isShared);
    };

    const handlePDFDownload = async () => {
        const input = document.getElementById("analysis-section"); // The section to capture as PDF
        if (!input) {
            console.error("Element to capture not found");
            return;
        }

        try {
            // Use html2canvas to capture the DOM element
            const canvas = await html2canvas(input);
            const imgData = canvas.toDataURL("image/png");

            // Initialize jsPDF
            const pdf = new jsPDF("p", "mm", "a4");

            // Calculate image dimensions for the PDF
            const imgWidth = 190; // Adjust as needed
            const pageHeight = 297; // A4 page height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            // Add image to the PDF and handle page breaks
            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Save the PDF
            pdf.save("Analysis_Report.pdf");
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };

    if (!result) {
        return <p>No results available. Please start training.</p>;
    }

    // Extract the evaluation object and message from the result
    const { evaluation, message } = result;
    const {
        fairness_score,
        performance_score,
        fairness_metric,
        non_numeric_columns,
        algorithm,
        sensitive_label_mapping,
        sensitive_test,
        fairness_reason,
        precision,
        recall,
        additional_insights
    } = evaluation || {};
    const {
        accuracy_disparity,
        confusion_matrix,
        f1_score,
        feature_importance,
        group_metrics,
        roc_auc,
        roc_curve,
        selection_rate_disparity

    } = additional_insights || {};

    // confusion matrix
    const trueNegative = confusion_matrix[0][0];
    const falsePositive = confusion_matrix[0][1];
    const falseNegative = confusion_matrix[1][0];
    const truePositive = confusion_matrix[1][1];

    const confusionMatrixData = [
        { name: 'True Negative', value: trueNegative },
        { name: 'False Positive', value: falsePositive },
        { name: 'False Negative', value: falseNegative },
        { name: 'True Positive', value: truePositive }
    ];
    const colors = ['#36A2EB', '#4BC0C0', '#9966FF', '#FF9F40', '#36A2EB', '#4BC0C0'];


    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    const currentDate = month + "/" + date + "/" + year;


    // Performane metric bar chart
    ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);
    const MetricsBarChart = () => {
        // Data from your evaluation
        const data = {
            labels: ['Accuracy', 'Precision', 'Recall', 'Fairness', 'F1 Score', 'ROC AUC'],
            datasets: [
                {
                    data: [performance_score, precision, recall, fairness_score, f1_score, roc_auc],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(75, 192, 192, 0.7)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1,
                },
            ],
        };

        const options = {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                    position: 'top',
                    labels: {
                        color: 'white'
                    }
                },
                title: {
                    display: false,
                    text: 'Model Performance and Fairness Metrics',
                    font: {
                        size: 16,
                    },
                    color: 'white'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.formattedValue;
                            return label;
                        }
                    },
                    titleColor: 'white',
                    bodyColor: 'white',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)'
                },
                // Add datalabels configuration here
                datalabels: {
                    color: 'white',
                    anchor: 'center',
                    align: 'center',
                    font: {
                        weight: 'bold'
                    },
                    formatter: function (value) {
                        return value.toFixed(2);
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    title: {
                        display: false,
                        text: 'Score',
                        font: {
                            size: 14,
                        },
                        color: 'white'
                    },
                    ticks: {
                        callback: function (value) {
                            return value.toFixed(2);
                        },
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    title: {
                        display: false,
                        text: 'Metrics',
                        font: {
                            size: 14,
                        },
                        color: 'white'
                    },
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
        };
        return (
            <div className="w-full max-w-2xl p-4 mt-5 ml-11">
                <Bar data={data} options={options} />
            </div>
        );
    };

    // feature importance bar chart
    // const featureImportanceData = Object.entries(modelData.feature_importance)
    //     .sort((a, b) => b[1] - a[1])
    //     .map(([feature, importance]) => ({
    //         name: feature.replace('_', ' '),
    //         value: importance
    //     }));

    return (
        <div className='pl-5 pr-5 relative '>

            <div className="lg:flex lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                        <div className="flex items-center text-sm text-gray-200">
                            <svg className="mr-1.5 size-5 shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" />
                            </svg>
                            Done on {currentDate}
                        </div>
                    </div>
                </div>
                <div className="flex lg:ml-4 lg:mt-0">
                    <span className="hidden sm:block">
                        <Link to="/upload"
                            className="text-white flex border-2 border-white hover:bg-primary-800 hover:ring-4 hover:ring-primary-300 font-medium rounded text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 hover:outline-none dark:hover:ring-primary-800">
                            <MdAddchart className="mr-3 text-xl" />New Assessment
                        </Link>
                    </span>

                    <span className="ml-3 hidden sm:block">
                        <button onClick={handleSharing} className="text-blue-300 flex border-2 border-blue-300 hover:bg-primary-800 hover:ring-4 hover:ring-primary-300 font-medium rounded text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 hover:outline-none dark:hover:ring-primary-800">
                            Get Report <FaRegShareFromSquare className="ml-3 text-xl" />
                        </button>
                    </span>

                </div>
            </div>
            {/* sharing report */}
            {isShared && (
                <div id="deleteModal" className="absolute top-15 right-10 justify-center items-center">
                    <div className="relative p-4 w-full max-w-md h-full md:h-auto">

                        <div className="relative text-center bg-white rounded-lg shadow dark:bg-gray-700 sm:p-5">
                            <button type="button" onClick={handleSharing} className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="deleteModal">
                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                <span className="sr-only">Close modal</span>
                            </button>

                            <table className='text-left'>
                                <tr>
                                    <td className='pb-2 w-36 text-white'>Download</td>
                                    <td className='pb-2 w-52 text-white'>Share</td>
                                </tr>
                                <tr>
                                    <td className='w-36'>
                                        <button onClick={handlePDFDownload}
                                            className="text-white  text-center hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-full border-2 border-white text-sm px-3.5 py-3.5  dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                                            <FaFilePdf className="text-xl" />
                                        </button>
                                    </td>
                                    <td className='w-52 flex'>
                                        <button
                                            className="text-white  text-center hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-full border-2 border-white text-sm px-3.5 py-3.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                                            <FaGoogleDrive className="text-xl" />
                                        </button>
                                        <button
                                            className="text-white ml-4  text-center hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-full border-2 border-white text-sm px-3.5 py-3.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                                            <MdEmail className="text-xl" />
                                        </button>
                                        <button
                                            className="text-white ml-4  text-center hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-full border-2 border-white text-sm px-3.5 py-3.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                                            <MdOutlineQrCodeScanner className="text-xl" />
                                        </button>
                                    </td>
                                </tr>
                            </table>



                        </div>
                    </div>
                </div>
            )}

            <div className='h-[520px] max-h-[540px] overflow-auto mt-4'>
                <section id="analysis-section" className="px-11 pt-7 pb-2 antialiased mb-7 bg-gray-700 py-4 rounded-lg">

                    <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">

                        <div className="mb-4 flex items-center justify-between gap-4 md:mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Training Result</h2>

                            <div className="flex text-green-500 items-center text-base font-medium text-primary-700 hover:underline dark:text-primary-500">
                                <span className='mr-2'>{message}</span>
                                <FaCheck />
                            </div>
                        </div>

                        <div className='flex'>
                            {/* performance metric bar table */}
                            <div className="grid gap-3 grid-cols-1">
                                <div className="flex items-center border-b border-b-green-200 px-2 pb-2">
                                    <div className="text-sm w-48 text-gray-900 dark:text-white">Accuracy Score:</div>
                                    <div className="text-sm w-64 text-gray-900 dark:text-white">{performance_score !== undefined ? performance_score.toFixed(2) : 'N/A'}</div>
                                </div>
                                <div className="flex items-center border-b border-b-green-200 px-2 pb-2">
                                    <div className="text-sm w-48 text-gray-900 dark:text-white">Precision Score:</div>
                                    <div className="text-sm w-64 text-gray-900 dark:text-white">{precision !== undefined ? precision : 'N/A'}</div>
                                </div>
                                <div className="flex items-center border-b border-b-green-200 px-2 pb-2">
                                    <div className="text-sm w-48 text-gray-900 dark:text-white">Recall Score:</div>
                                    <div className="text-sm w-64 text-gray-900 dark:text-white">{recall !== undefined ? recall : 'N/A'}</div>
                                </div>
                                <div className="flex items-center border-b border-b-green-200 px-2 pb-2">
                                    <div className="text-sm w-48 text-gray-900 dark:text-white">F1 Score:</div>
                                    <div className="text-sm w-64 text-gray-900 dark:text-white">{f1_score !== undefined ? f1_score : 'N/A'}</div>
                                </div>

                                <div className="flex items-center border-b border-b-green-200 px-2 pb-2">
                                    <div className="text-sm w-48 text-gray-900 dark:text-white">ROC AUC:</div>
                                    <div className="text-sm w-64 text-gray-900 dark:text-white">{roc_auc !== undefined ? roc_auc : 'N/A'}</div>
                                </div>
                                <div className="flex items-center border-b border-b-green-200 px-2 pb-2">
                                    <div className="text-sm w-48 text-gray-900 dark:text-white">Fairness Score:</div>
                                    <div className="text-sm w-64 text-gray-900 dark:text-white">{fairness_score !== undefined ? fairness_score : 'N/A'}</div>
                                </div>
                                <div className="flex items-center border-b border-b-green-200 px-2 pb-2">
                                    <div className="text-sm w-48 text-gray-900 dark:text-white">Accuracy Disparity:</div>
                                    <div className="text-sm w-64 text-gray-900 dark:text-white">{accuracy_disparity !== undefined ? accuracy_disparity : 'N/A'}</div>
                                </div>
                                <div className="flex items-center border-b border-b-green-200 px-2 pb-2">
                                    <div className="text-sm w-48 text-gray-900 dark:text-white">Selection Rate Disparity:</div>
                                    <div className="text-sm w-64 text-gray-900 dark:text-white">{selection_rate_disparity !== undefined ? selection_rate_disparity : 'N/A'}</div>
                                </div>
                                <div className="flex items-center border-b border-b-green-200 px-2 pb-2">
                                    <div className="text-sm w-48 text-gray-900 dark:text-white">Fairness Metric:</div>
                                    <div className="text-sm w-64 text-gray-900 dark:text-white">{fairness_metric !== undefined ? fairness_metric : 'N/A'}</div>
                                </div>

                                <div className="flex items-center border-b border-b-green-200 px-2 pb-2  ">
                                    <div className="text-sm w-48 text-gray-900 dark:text-white">Algorithm:</div>
                                    <div className="text-sm w-64 text-gray-900 dark:text-white">{algorithm}</div>
                                </div>
                                {/* <div className="flex items-center border-b border-b-green-400 px-2 py-1  ">
                                    <div className="text-sm w-40 text-gray-900 dark:text-white">One-hot encoded columns:</div>
                                    <span className="text-sm text-gray-900 dark:text-white">{non_numeric_columns && non_numeric_columns.length > 0 ? non_numeric_columns.join(' , ') : 'N/A'} </span>
                                </div> */}
                            </div>
                            <div className="grid gap-3 grid-cols-1 pl-7">
                                {/* performance metric bar chart */}
                                <MetricsBarChart className="text-whait" />
                            </div>

                        </div>

                    </div>

                    <div className="grid gap-3 grid-cols-2 mt-24">

                        {/* confusion matrix pie chart */}
                        <div className="h-64 mt-5">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={confusionMatrixData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {confusionMatrixData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-2 max-w-md mx-auto h-48 mt-11">
                            <div className="bg-blue-100 p-4 text-center border">
                                <p className="font-bold">{trueNegative}</p>
                                <p className="text-sm">True Negative</p>
                            </div>
                            <div className="bg-red-100 p-4 text-center border">
                                <p className="font-bold">{falsePositive}</p>
                                <p className="text-sm">False Positive</p>
                            </div>
                            <div className="bg-red-100 p-4 text-center border">
                                <p className="font-bold">{falseNegative}</p>
                                <p className="text-sm">False Negative</p>
                            </div>
                            <div className="bg-blue-100 p-4 text-center border">
                                <p className="font-bold">{truePositive}</p>
                                <p className="text-sm">True Positive</p>
                            </div>
                        </div>
                        {/* <span className="text-base text-gray-900 dark:text-white mt-5">Sensitive Label Mapping:</span>
                        <div className="flex items-center justify-center ">
                            <div className="container mx-auto p-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-2">
                                    {Object.entries(sensitive_label_mapping).map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="px-1 py-1 border rounded shadow-md bg-white hover:shadow-lg transition duration-200"
                                        >
                                            <span>{label}:</span> <span className='ml-3'>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div> */}

                        {/* <span className="text-base text-gray-900 dark:text-white mt-5">Sensitive Test Values:</span>
                        <div className="flex items-center justify-center ">
                            <div className="container mx-auto p-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-2">
                                    {sensitive_test.map((value, index) => (
                                        <div
                                            key={index}
                                            className="px-1 py-1 border rounded shadow-md bg-white hover:shadow-lg transition duration-200"
                                        >
                                            <div className="text-sm mb-1 text-gray-700">Test Result {index + 1}: {value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div> */}
                    </div>

                    <div className="grid gap-3 grid-cols-1 mt-24">
                        {/* <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={featureImportanceData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={120} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div> */}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Analys;
