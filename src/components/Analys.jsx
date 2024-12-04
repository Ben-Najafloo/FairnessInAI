import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ProgressContext } from '../ProgressContext';
import { FaCheck } from "react-icons/fa";


const Analys = () => {
    const location = useLocation();
    const { result } = location.state || {}; // Get result from location state

    if (!result) {
        return <p>No results available. Please start training.</p>;
    }

    // Extract the evaluation object and message from the result
    const { evaluation, message } = result;
    const { fairness_score, performance_score, fairness_metric, performance_metric, non_numeric_columns, algorithm } = evaluation || {};

    return (
        <div>

            <section className="p-24 antialiased dark:bg-gray-900 md:py-16">
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
                    <Link to="/training" className="back-button">
                        Train Again
                    </Link>
                </div>


            </section>










        </div>
    );
};

export default Analys;
