import React, { useContext, useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ProgressContext } from '../ProgressContext';
import { FaCheck, FaGoogleDrive } from "react-icons/fa";
import { FaRegShareFromSquare, FaFilePdf } from "react-icons/fa6";
import { MdEmail, MdOutlineQrCodeScanner, MdAddchart, MdOutlineDatasetLinked } from "react-icons/md";
import { SiThealgorithms } from "react-icons/si";
import { GrDocumentConfig } from "react-icons/gr";
import toast from 'react-hot-toast';
import FairnessDashboard from './analysis-components/FairnessDashboard';
import FeatureImportanceChart from './analysis-components/FeatureImportanceChart';
import GroupMetric from './analysis-components/GroupMetric';
import RocCurve from './analysis-components/RocCurve';
import DisparityMetricsChart from './analysis-components/DisparityMetricsChart';
import ByGroupMetrics from './analysis-components/ByGroupMetrics';

import ChartDataLabels from 'chartjs-plugin-datalabels';

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
    console.log(result)
    // Parse if result is a JSON string
    if (typeof result === 'string') {
        try {
            result = JSON.parse(result);
        } catch (error) {
            console.error('Failed to parse result JSON:', error);
            result = {};
        }
    }

    const { setProgress } = useContext(ProgressContext);
    const [isShared, setIsShared] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress(7);
        }, 3000);

        return () => clearTimeout(timer);
    }, [setProgress]);

    const [hasVisited, setHasVisited] = useState(false);

    useEffect(() => {
        if (!hasVisited) {
            console.log('Welcome to this page for the first time!');
            toast.success('message');
            setHasVisited(true);
        }
    }, [hasVisited]);


    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    const currentDate = month + "/" + date + "/" + year;

    const handleSharing = () => {
        setProgress(10);
        setIsShared(!isShared);
    };

    const handlePDFDownload = async () => {
        const input = document.getElementById("analysis-section"); // The 
        if (!input) {
            console.error("Element to capture not found");
            return;
        }

        const heading = document.createElement("h2");
        heading.textContent = "Training Result";
        input.appendChild(heading);

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
    const { evaluation, message, do_balance_data, file_name, label_column, sensitive_column, sensitive_column2 } = result;

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
        additional_insights,
        fairness_dashboard
    } = evaluation || {};
    const {
        accuracy_disparity,
        confusion_matrix,
        f1_score,
        feature_importance,
        group_metrics,
        roc_auc,
        roc_curve,
        selection_rate_disparity,
        weighted_accuracy
    } = additional_insights || {};
    const {
        by_group_metrics,
        disparity_metrics
    } = fairness_dashboard || {};



    // confusion matrix
    const safeMatrix = confusion_matrix || [[0, 0], [0, 0]];

    const trueNegative = safeMatrix[0]?.[0] ?? 0;
    const falsePositive = safeMatrix[0]?.[1] ?? 0;
    const falseNegative = safeMatrix[1]?.[0] ?? 0;
    const truePositive = safeMatrix[1]?.[1] ?? 0;

    const confusionMatrixData = [
        { name: 'True Negative', value: trueNegative },
        { name: 'False Positive', value: falsePositive },
        { name: 'False Negative', value: falseNegative },
        { name: 'True Positive', value: truePositive }
    ];

    const total = confusionMatrixData.reduce((sum, item) => sum + item.value, 0);

    // related to confusion matrix pie chart
    const colors = [
        'rgba(54, 162, 235, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
    ];


    ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);
    const MetricsBarChart = () => {

        const clean = (val) =>
            typeof val === 'number' && isFinite(val) ? val : 0;

        const data = {
            labels: ['Accuracy', 'Precision', 'Recall', 'Fairness', 'F1 Score', 'ROC AUC', 'Weighted Accuracy'],
            datasets: [
                {
                    data: [
                        clean(performance_score),
                        clean(precision),
                        clean(recall),
                        clean(fairness_score),
                        clean(f1_score),
                        clean(roc_auc),
                        clean(weighted_accuracy)
                    ],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
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
                        return typeof value === 'number' ? value.toFixed(2) : 'N/A';
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
            <div className="p-4 mt-5 w-full h-[400px]">
                <Bar data={data} options={options} />
            </div>
        );
    };

    return (
        <div>
            <section>
                <div className='md:pl-5 md:pr-5 relative'>

                    <div className="flex justify-end items-end w-full">
                        <div className="flex lg:ml-4 lg:mt-0 h-12">
                            <span className="hidden sm:block mr-3">
                                <Link to="/training"
                                    className="text-white flex hover:border hover:border-white  font-medium rounded text-sm px-3 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 hover:outline-none dark:hover:bg-gray-800">
                                    <GrDocumentConfig className="mr-2 text-xl" />Reconfiguration
                                </Link>
                            </span>
                            <span className="hidden sm:block">
                                <Link to="/upload"
                                    className="text-white flex hover:border hover:border-white  font-medium rounded text-sm px-3 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 hover:outline-none dark:hover:bg-gray-800">
                                    <MdAddchart className="mr-2 text-xl" />New Assessment
                                </Link>
                            </span>

                            <span className="ml-3 hidden sm:block">
                                <button onClick={handleSharing} className="text-blue-300 flex hover:border hover:border-blue-300  font-medium rounded text-sm px-3 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 hover:outline-none dark:hover:bg-gray-800">
                                    <FaRegShareFromSquare className="mr-2 text-xl" /> Get Report
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

                    <div className='h-[550px] max-h-[550px] mt-2 overflow-y-scroll scrollbar scrollbar-thumb-gray-400 scrollbar-track-gray-700 scrollbar-no-buttons'>
                        <section id="analysis-section" className="px-9 pt-5 pb-2 antialiased mb-5 bg-gray-700 py-4">
                            <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">

                                <div className="mb-11 flex justify-between gap-4 align-top">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Training Result</h2>
                                        <div className="min-w-0 flex-1 mt-4">
                                            <div className="flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                                                <div className="flex items-center text-sm text-gray-200">
                                                    <svg className="mr-1.5 size-5 shrink-0 text-gray-200" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                                        <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" />
                                                    </svg>
                                                    Done on {currentDate}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1 mt-3">
                                            <div className="flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                                                <div className="flex items-center text-sm text-gray-200">
                                                    <MdOutlineDatasetLinked className="mr-1.5 size-5 shrink-0 text-gray-200" />
                                                    Dataset:  &nbsp;<span className="text-sm w-64 text-gray-900 dark:text-white"> {file_name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1 mt-3">
                                            <div className="flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                                                <div className="flex items-center text-sm text-gray-200">
                                                    <SiThealgorithms className="mr-1.5 size-5 shrink-0 text-gray-200" />
                                                    Algorithm:  &nbsp;<span className="text-sm w-64 text-gray-900 dark:text-white"> {algorithm}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <div className="flex text-green-500 items-center align-top text-base font-medium">
                                        <span className='mr-2'>{message}</span>
                                        <FaCheck />
                                    </div> */}
                                </div>

                                <div>
                                    {/* performance metric table*/}
                                    <div className="md:grid md:gap-3 md:grid-cols-1">
                                        <div className="flex items-center border-b border-b-gray-600 px-2 pb-2">
                                            <div className="text-sm w-48 text-gray-900 dark:text-white">Accuracy Score:</div>
                                            <div className="text-sm w-32 text-gray-900 dark:text-white">{performance_score?.toFixed?.(2) ?? 'N/A'}</div>
                                            <div className="text-sm text-gray-900 dark:text-white">Overall correctness of predictions compared to actual outcomes.</div>
                                        </div>
                                        {do_balance_data && (
                                            <div className="flex items-center border-b border-b-gray-600 px-2 pb-2">
                                                <div className="text-sm w-48 text-gray-900 dark:text-white">Wighted Accuracy:</div>
                                                <div className="text-sm w-32 text-gray-900 dark:text-white">{weighted_accuracy?.toFixed?.(2) ?? 'N/A'}</div>
                                                <div className="text-sm text-gray-900 dark:text-white">Adjusts for class imbalance by valuing the correct classification of different classes differently.</div>
                                            </div>
                                        )}
                                        <div className="flex items-center border-b border-b-gray-600 px-2 pb-2">
                                            <div className="text-sm w-48 text-gray-900 dark:text-white">Precision Score:</div>
                                            <div className="text-sm w-32 text-gray-900 dark:text-white">{precision?.toFixed?.(2) ?? 'N/A'}</div>
                                            <div className="text-sm text-gray-900 dark:text-white">Proportion of true positives among all predicted positives.</div>
                                        </div>
                                        <div className="flex items-center border-b border-b-gray-600 px-2 pb-2">
                                            <div className="text-sm w-48 text-gray-900 dark:text-white">Recall Score:</div>
                                            <div className="text-sm w-32 text-gray-900 dark:text-white">{recall?.toFixed?.(2) ?? 'N/A'}</div>
                                            <div className="text-sm text-gray-900 dark:text-white">Ability to correctly identify actual positive cases.</div>
                                        </div>
                                        <div className="flex items-center border-b border-b-gray-600 px-2 pb-2">
                                            <div className="text-sm w-48 text-gray-900 dark:text-white">F1 Score:</div>
                                            <div className="text-sm w-32 text-gray-900 dark:text-white">{f1_score?.toFixed?.(2) ?? 'N/A'}</div>
                                            <div className="text-sm text-gray-900 dark:text-white">Balanced average of precision and recall.</div>
                                        </div>

                                        <div className="flex items-center border-b border-b-gray-600 px-2 pb-2">
                                            <div className="text-sm w-48 text-gray-900 dark:text-white">ROC AUC:</div>
                                            <div className="text-sm w-32 text-gray-900 dark:text-white">{roc_auc?.toFixed?.(2) ?? 'N/A'}</div>
                                            <div className="text-sm text-gray-900 dark:text-white">Model's performance in distinguishing classes (higher = better separation).</div>
                                        </div>

                                        <div className="flex items-center border-b border-b-gray-600 px-2 pb-2">
                                            <div className="text-sm w-48 text-gray-900 dark:text-white">Fairness Score:</div>
                                            <div className="text-sm w-32 text-gray-900 dark:text-white">{fairness_score?.toFixed?.(2) ?? 'N/A'}</div>
                                            <div className="text-sm text-gray-900 dark:text-green-400">Metric: {fairness_metric !== undefined ? fairness_metric : 'N/A'}</div>
                                        </div>
                                        <div className="flex items-center border-b border-b-gray-600 px-2 pb-2">
                                            <div className="text-sm w-48 text-gray-900 dark:text-white">Accuracy Disparity:</div>
                                            <div className="text-sm w-32 text-gray-900 dark:text-white">{accuracy_disparity?.toFixed?.(2) ?? 'N/A'}</div>
                                            <div className="text-sm text-gray-900 dark:text-white">Variation in accuracy between different groups (lower = fairer).</div>
                                        </div>
                                        <div className="flex items-center border-b border-b-gray-600 px-2 pb-2">
                                            <div className="text-sm w-48 text-gray-900 dark:text-white">Selection Rate Disparity:</div>
                                            <div className="text-sm w-32 text-gray-900 dark:text-white">{selection_rate_disparity?.toFixed?.(2) ?? 'N/A'}</div>
                                            <div className="text-sm text-gray-900 dark:text-white">No difference in selection rates between groups.</div>
                                        </div>
                                    </div>

                                    {/* performance metric bar chart*/}
                                    <div className="md:grid md:gap-1 md:grid-cols-1">
                                        <MetricsBarChart className="text-whait" />
                                    </div>

                                </div>

                            </div>

                            {/* Feature Importance */}
                            <div className="mt-24">
                                <h4 className="w-full text-md text-blue-300 mt-6 border-b border-b-blue-200">Feature Importance:</h4>
                                <FeatureImportanceChart feature_importance={feature_importance} />
                            </div>

                            {/* confusion_matrix */}
                            <div className='mt-24'>
                                <h4 className="w-full text-md text-blue-300 mt-6 border-b border-b-blue-200">Confusion Matrix:</h4>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {total === 0 ? (
                                        <p>No confusion matrix data to display.</p>
                                    ) : (
                                        <div className="h-72 mt-24">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={confusionMatrixData}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={true}
                                                        label={({ name, percent }) => {
                                                            const safePercent = typeof percent === 'number' ? (percent * 100).toFixed(0) : 'N/A';
                                                            return `${name}: ${safePercent}%`;
                                                        }}
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
                                    )}

                                    <div className="grid grid-cols-2 gap-2 max-w-md mx-auto h-64 mt-24">
                                        <div className="bg-blue-400 p-4 text-center border py-8">
                                            <p className="font-bold">{trueNegative}</p>
                                            <p className="text-sm">True Negative</p>
                                        </div>
                                        <div className="bg-orange-400 p-4 text-center border py-8">
                                            <p className="font-bold">{falsePositive}</p>
                                            <p className="text-sm">False Positive</p>
                                        </div>
                                        <div className="bg-orange-400 p-4 text-center border py-8">
                                            <p className="font-bold">{falseNegative}</p>
                                            <p className="text-sm">False Negative</p>
                                        </div>
                                        <div className="bg-blue-400 p-4 text-center border py-8">
                                            <p className="font-bold">{truePositive}</p>
                                            <p className="text-sm">True Positive</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* roc_curve */}
                            <div className="mt-24">
                                <h4 className="w-full text-md text-blue-300 mt-6 border-b border-b-blue-200">Roc Curve Chart:</h4>
                                <RocCurve roc_curve={roc_curve} />
                            </div>

                            {/* group_metrics */}
                            <div className="mt-24">
                                <h4 className="w-full text-md text-blue-300 mt-6 border-b border-b-blue-200">Group Metrics:</h4>
                                <GroupMetric group_metrics={group_metrics} />
                            </div>

                            {/* by_group_metrics  */}
                            <div className="mt-24">
                                <h4 className="w-full text-md text-blue-300 mt-6 border-b border-b-blue-200">By Group Metrics:</h4>
                                <ByGroupMetrics byGroupMetrics={by_group_metrics} />
                            </div>

                            {/* disparity_metrics */}
                            <div className="mt-24 h-96">
                                <h4 className="w-full text-md text-blue-300 mt-6 border-b border-b-blue-200">Disparity Metrics Chart:</h4>
                                <DisparityMetricsChart disparity_metrics={disparity_metrics} />
                            </div>

                            <div className="grid gap-3 grid-cols-1 mt-24">
                                <div>
                                    {feature_importance && Object.keys(feature_importance).length > 0 && (
                                        <div className="mt-8">
                                            <FairnessDashboard featureImportance={feature_importance} />
                                        </div>
                                    )}
                                </div>
                            </div>

                        </section>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default Analys;
