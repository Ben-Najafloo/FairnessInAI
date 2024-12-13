import React, { useContext, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ProgressContext } from '../ProgressContext';
import { FaCheck } from "react-icons/fa";

const Analys = () => {
    const location = useLocation();
    const { result } = location.state || {}; // Get result from location state
    const { setProgress } = useContext(ProgressContext);
    // setProgress(6);

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress(6);
        }, 3000);

        return () => clearTimeout(timer);
    }, [setProgress]);

    const endSession = () => {
        setProgress(7);
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
        performance_metric,
        non_numeric_columns,
        algorithm,
        sensitive_label_mapping,
        sensitive_test
    } = evaluation || {};

    return (
        <div className='md:max-h-screen md:h-screen h-screen p-5'>
            <div className='bg-gray-800 rounded-lg pb-7'>
                <section className="px-24 pt-16 pb-7 antialiased">
                    <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
                        <div className="mb-4 flex items-center justify-between gap-4 md:mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Training Result</h2>

                            <div className="flex text-green-500 items-center text-base font-medium text-primary-700 hover:underline dark:text-primary-500">
                                <span className='mr-2'>{message}</span>
                                <FaCheck />
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            <div className="items-center rounded border border-green-400 bg-white px-4 py-2  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                <span className="text-base font-bold text-gray-900 dark:text-white">Fairness Score:</span><br />
                                <span className="text-base font-medium text-gray-900 dark:text-white">{fairness_score !== undefined ? fairness_score : 'N/A'}</span>
                            </div>
                            <div className="items-center rounded border border-green-400 bg-white px-4 py-2  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                <span className="text-base font-bold text-gray-900 dark:text-white">Performance Score:</span><br />
                                <span className="text-base font-medium text-gray-900 dark:text-white">{performance_score !== undefined ? performance_score : 'N/A'}</span>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-5">
                            <div className="items-center rounded border border-green-400 bg-white px-4 py-2  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                <span className="text-base font-bold text-gray-900 dark:text-white">Fairness Metric:</span><br />
                                <span className="text-base font-medium text-gray-900 dark:text-white">{fairness_metric !== undefined ? fairness_metric : 'N/A'}</span>
                            </div>
                            <div className="items-center rounded border border-green-400 bg-white px-4 py-2  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                <span className="text-base font-bold text-gray-900 dark:text-white">Performance Metric:</span><br />
                                <span className="text-base font-medium text-gray-900 dark:text-white"> {performance_metric !== undefined ? performance_metric : 'N/A'}</span>
                            </div>
                            <div className="items-center rounded border border-green-400 bg-white px-4 py-2  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                <span className="text-base font-bold text-gray-900 dark:text-white">Algorithm:</span><br />
                                <span className="text-base font-medium text-gray-900 dark:text-white">{algorithm}</span>
                            </div>
                        </div>
                        <div className="grid gap-4 grid-cols-1 mt-5">
                            <div className="items-center rounded border border-green-400 bg-white px-4 py-2  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                <span className="text-base font-bold text-gray-900 dark:text-white">One-hot encoded columns:</span><br />
                                <span className="text-base font-medium text-gray-900 dark:text-white">{non_numeric_columns && non_numeric_columns.length > 0 ? non_numeric_columns.join(' , ') : 'N/A'} </span>
                            </div>
                            {/* 
                            <div className="items-center rounded border border-green-400 bg-white px-4 py-2  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                <span className="text-base font-bold text-gray-900 dark:text-white">Food &amp; Grocery</span><br />
                                <span className="text-base font-medium text-gray-900 dark:text-white">Electronics</span>
                            </div>
                            <div className="items-center rounded border border-green-400 bg-white px-4 py-2  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                <span className="text-base font-bold text-gray-900 dark:text-white">Food &amp; Grocery</span><br />
                                <span className="text-base font-medium text-gray-900 dark:text-white">Food &amp; Grocery</span>
                            </div> */}

                        </div>
                    </div>

                    <div className="grid gap-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 mt-5 ">
                        <div className="items-center rounded border border-green-400 bg-white px-4 py-2  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                            <span className="text-base font-bold text-gray-900 dark:text-white">Sensitive Label Mapping:</span><br />
                            <ul>
                                {Object.entries(sensitive_label_mapping).map(([label, value]) => (
                                    <li key={label}
                                        className="text-base font-medium text-gray-900 dark:text-white">
                                        <strong>{label}:</strong> {value}
                                    </li>
                                ))}
                            </ul>
                        </div>


                        <span className="text-base font-bold text-gray-900 dark:text-white mt-5">Sensitive Test Values:</span>
                        <div className="flex items-center justify-center ">
                            <div className="container mx-auto p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                                    {sensitive_test.map((value, index) => (
                                        <div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={index}
                                            className="px-1 py-1 border rounded shadow-md bg-white hover:shadow-lg transition duration-200"
                                        >
                                            <div className="text-sm mb-1 text-gray-700">Test Result {index + 1}: {value}</div>

                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </section>
                <div className="flex items-center space-x-4 ml-7">
                    <Link to="/training"
                        className="text-white  bg-blue-500 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                        Train Again
                    </Link>
                    <Link to="/" onClick={endSession} className="text-white bg-red-500 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                        End the Session
                    </Link>
                </div>
            </div>
        </div>
    );
};










export default Analys;
