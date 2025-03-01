import React, { useContext, useState } from 'react';
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ProgressContext } from '../ProgressContext';
import Slider from '@mui/material/Slider';
import axios from 'axios';

const Training = () => {

    const location = useLocation();
    // const datasetInfo = location.state?.datasetInfo;
    const { datasetInfo, doHandleMissData, doBalanceData } = location.state || {};
    const { problem_type } = datasetInfo || {};
    console.log(problem_type)

    const navigate = useNavigate();

    const { setProgress } = useContext(ProgressContext);

    const [showConfigTable, setShowConfigTable] = useState(false);

    const [selectedAlgorithms, setSelectedAlgorithms] = useState([]);
    const [selectedFairnessMetrics, setSelectedFairnessMetrics] = useState([]);
    const [selectedPerformanceMetrics, setSelectedPerformanceMetrics] = useState([]);
    const [splitRatio, setSplitRatio] = useState(20); // Default: Test 20%, Train 80%


    const regressionAlgorithms = ['Linear Regression', 'Random Forest Regression', 'Gradient Boosting Regression', 'Decision Tree Regression'];
    const classificationAlgorithms = ['Logistic Regression', 'Support Vector Machine', 'Naive Bayes', 'Random Forest Classification'];
    const algorithms =
        problem_type === "regression"
            ? regressionAlgorithms
            : problem_type === "classification"
                ? classificationAlgorithms
                : [];

    const metrics = ['Demographic Parity', 'Equalized Odds', 'Disparate Impact'];
    const evaluationMetrics = ['Accuracy', 'Precision', 'Recall'];

    const configTable = () => {
        setShowConfigTable(true);
    }

    const handleAlgorithmChange = (event) => {
        const value = event.target.value;
        setSelectedAlgorithms((prev) =>
            prev.includes(value) ? prev.filter((alg) => alg !== value) : [...prev, value]
        );
    };

    const handleFairnessMetricChange = (event) => {
        const value = event.target.value;
        setSelectedFairnessMetrics((prev) =>
            prev.includes(value) ? prev.filter((metric) => metric !== value) : [...prev, value]
        );
    };

    const handlePerformanceMetricChange = (event) => {
        const value = event.target.value;
        setSelectedPerformanceMetrics((prev) =>
            prev.includes(value) ? prev.filter((metric) => metric !== value) : [...prev, value]
        );
    };

    const handleSplitChange = (event, value) => {
        setSplitRatio(value); // Update the split ratio
    };

    // Form submission handler
    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = {
            selectedAlgorithms,
            selectedFairnessMetrics,
            selectedPerformanceMetrics,
            splitRatio,
            trainSplitRatio: 100 - splitRatio,
            doHandleMissData,
            doBalanceData,
            problem_type
        };

        try {
            // Send POST request to the backend
            const response = await axios.post("http://localhost:5000/train", formData);

            // Axios automatically parses JSON responses
            const result = response.data;
            console.log('Training Result:', result);
            setProgress(8);
            // Navigate to the results page and pass the result as state
            navigate('/analys', { state: { result } });
        } catch (error) {
            console.error('Error during training:', error);
            // Show error notification or handle it accordingly
        }
    };

    return (
        <div>
            <section>

                <div className="md:pl-5 w-full">
                    <div className="bg-gray-800 py-4 px-9 rounded-lg h-[550px] md:max-h-[550px] overflow-auto">
                        <h2 className="text-xl mb-6 font-semibold text-gray-900 dark:text-white sm:text-2xl">Final Configuration</h2>
                        <form className="w-full pl-4">

                            <p className='text-white leading-8'>According to the problem type and pre assessment of the fairness, it is suggested to use
                                <br />
                                {problem_type && (<span className='font-bold italic mr-2 text-green-500'>
                                    {problem_type.toUpperCase()}
                                </span>)}
                                algorithms for training.
                                <br /> Also the ratio for splitting the dataset will be <span className='font-bold italic'> Testing: 20% and Training: 80%.</span>
                            </p>
                            {(doBalanceData || doHandleMissData) && (
                                <span className='text-white leading-8'>Before processing of fairness assessment as there are:</span>
                            )}
                            {doHandleMissData && (
                                <p className='text-white leading-8'>
                                    <ul>
                                        <li className='list-disc list-inside pl-3'> Missing value in your dataset, it will be handeled according to the type of missed values.</li>
                                    </ul>
                                </p>
                            )}
                            {doBalanceData && (
                                <p className='text-white leading-8'>
                                    <ul>
                                        <li className='list-disc list-inside pl-3'> Imbalance class distribution in your dataset, it will be balanced (sintatic data points will be generated and added).</li>
                                    </ul>
                                </p>
                            )}

                            <p className='text-white leading-8 mt-7'>For manual configuration click <a onClick={configTable} className='text-blue-500 cursor-pointer'>here</a></p>

                            {showConfigTable && (
                                <div className='pl-4'>
                                    <div className="flex-wrap -mx-3 my-6">

                                        <h3 className="mb-1 text-white">Algorithm for training: </h3>
                                        <ul class="grid w-2/3 gap-2 md:grid-cols-2">
                                            {algorithms.map((algorithm) => (

                                                <li>
                                                    <input type="checkbox" id={`${algorithm}-checkbox`} value={algorithm} checked={selectedAlgorithms.includes(algorithm)} onChange={handleAlgorithmChange} class="hidden peer" />
                                                    <label for={`${algorithm}-checkbox`} class="inline-flex items-center justify-between text-gray-200 w-full pt-2 px-5 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-green-400 hover:text-gray-600  peer-checked:text-green-400 hover:bg-gray-50 ">
                                                        <div class="block">
                                                            <div className='flex'>
                                                                <div class="w-full">
                                                                    <div class="text-base mb-3 font-semibold">{algorithm}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>

                                    </div>
                                    <div className="flex-wrap -mx-3 mb-6">

                                        <h3 className="mb-1 text-white">Fairness metric(s):</h3>
                                        <ul class="grid w-2/3 gap-2 md:grid-cols-3">
                                            {metrics.map((metric) => (
                                                <li>
                                                    <input type="checkbox" id={`${metric}-checkbox`} value={metric} checked={selectedFairnessMetrics.includes(metric)} onChange={handleFairnessMetricChange} class="hidden peer" />
                                                    <label for={`${metric}-checkbox`} class="inline-flex items-center justify-between text-gray-200 w-full pt-2 px-5 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-green-400 hover:text-gray-600  peer-checked:text-green-400 hover:bg-gray-50 ">
                                                        <div class="block">
                                                            <div className='flex'>
                                                                <div class="w-full">
                                                                    <div class="text-base mb-3 font-semibold">{metric}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>

                                    </div>
                                    <div className="flex-wrap -mx-3 mb-6">

                                        <h3 className="mb-1 text-white">Performance evaluation metric:</h3>
                                        <ul class="grid w-2/3 gap-2 md:grid-cols-3">
                                            {evaluationMetrics.map((evaluationMetric) => (
                                                <li>
                                                    <input type="checkbox" id={`${evaluationMetric}-checkbox`} value={evaluationMetric} checked={selectedPerformanceMetrics.includes(evaluationMetric)} onChange={handlePerformanceMetricChange} class="hidden peer" />
                                                    <label for={`${evaluationMetric}-checkbox`} class="inline-flex items-center justify-between text-gray-200 w-full pt-2 px-5 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-green-400 hover:text-gray-600  peer-checked:text-green-400 hover:bg-gray-50 ">
                                                        <div class="block">
                                                            <div className='flex'>
                                                                <div class="w-full">
                                                                    <div class="text-base mb-3 font-semibold">{evaluationMetric}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="flex-wrap -mx-3">
                                        <h3 className="mb-1 text-white">Set the ratio for splitting the dataset: </h3>
                                        <div className='flex'>
                                            <div className='w-96'>
                                                <Slider
                                                    aria-label="Temperature"
                                                    defaultValue={20}
                                                    value={splitRatio}
                                                    onChange={handleSplitChange}
                                                    valueLabelDisplay="auto"
                                                    shiftStep={30}
                                                    step={10}
                                                    marks
                                                    min={0}
                                                    max={90}
                                                />
                                            </div>
                                            <div className="ml-7">
                                                <span className="ml-5 text-white">Testing: {splitRatio} %</span>
                                                <span className="ml-5 text-white">Training: {100 - splitRatio} %</span>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            )}


                            <div className="flex items-center space-x-4 mt-5">
                                <Link to="/upload" className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                    Load Another Dataset
                                </Link>
                                <button onClick={handleSubmit} className="text-white bg-blue-500 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                                    Start Training
                                </button>
                            </div>
                        </form>

                    </div>

                </div>
            </section>

        </div>
    )
}

export default Training

