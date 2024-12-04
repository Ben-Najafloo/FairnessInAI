import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { ProgressContext } from '../ProgressContext';
import Slider from '@mui/material/Slider';
import axios from 'axios';

const Training = () => {

    // const location = useLocation(); // Access state passed during navigation
    const navigate = useNavigate();
    // const datasetInfo = location.state?.datasetInfo;

    const { setProgress } = useContext(ProgressContext);

    const [selectedAlgorithms, setSelectedAlgorithms] = useState([]);
    const [selectedFairnessMetrics, setSelectedFairnessMetrics] = useState([]);
    const [selectedPerformanceMetrics, setSelectedPerformanceMetrics] = useState([]);
    const [splitRatio, setSplitRatio] = useState(20); // Default: Test 20%, Train 80%

    const algorithms = ['Logistic Regression', 'Random Forest', 'Support Vector Machine', 'Neural Network'];
    const metrics = ['Demographic Parity', 'Equalized Odds', 'Disparate Impact'];
    const evaluationMetrics = ['Accuracy', 'Precision', 'Recall'];

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
        };

        try {
            // Send POST request to the backend
            const response = await axios.post("http://localhost:5000/train", formData);

            // Axios automatically parses JSON responses
            const result = response.data;
            console.log('Training Result:', result);
            setProgress(5);
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
                <div className="md:p-5 md:pl-5">
                    <div className="bg-gray-800 p-9 rounded-lg mb-8 md:max-h-[850px] overflow-auto">

                        <form className="w-full pl-4">
                            <div className="flex-wrap -mx-3 mb-4">

                                <h3 className="mb-1 text-white">Select an algorithm for training: </h3>
                                <ul className="w-72 cursor-pointer text-sm font-medium text-gray-900  border-gray-200 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    {algorithms.map((algorithm) => (
                                        <li className="hover:bg-slate-300 mb-1 bg-white w-full cursor-pointer border-b border-gray-200 rounded dark:border-gray-600">
                                            <div className="flex cursor-pointer items-center ps-3">
                                                <input id={`${algorithm}-checkbox`}
                                                    type="checkbox"
                                                    value={algorithm}
                                                    checked={selectedAlgorithms.includes(algorithm)}
                                                    onChange={handleAlgorithmChange}
                                                    className="w-4 h-4 text-blue-600 cursor-pointer bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                                                <label for={`${algorithm}-checkbox`} className="w-full py-2 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">{algorithm}</label>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                            </div>
                            <div className="flex-wrap -mx-3 mb-4">

                                <h3 className="mb-1 text-white">Choose fairness metric(s):</h3>
                                <ul className="w-72 text-sm font-medium text-gray-900 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    {metrics.map((metric) => (
                                        <li className="hover:bg-slate-300 mb-1 bg-white w-full cursor-pointer border-b border-gray-200 rounded dark:border-gray-600">
                                            <div className="flex cursor-pointer items-center ps-3">
                                                <input
                                                    id={`${metric}-checkbox`}
                                                    type="checkbox"
                                                    value={metric}
                                                    checked={selectedFairnessMetrics.includes(metric)}
                                                    onChange={handleFairnessMetricChange}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                                                <label htmlFor={`${metric}-checkbox`} className="w-full py-2 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">{metric}</label>
                                            </div>
                                        </li>
                                    ))}

                                </ul>

                            </div>
                            <div className="flex-wrap -mx-3 mb-4">

                                <h3 className="mb-1 text-white">Select model performance evaluation metric:</h3>
                                <ul className="w-72 text-sm font-medium text-gray-900 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    {evaluationMetrics.map((evaluationMetric) => (
                                        <li className="hover:bg-slate-300 mb-1 bg-white w-full cursor-pointer border-b border-gray-200 rounded dark:border-gray-600">
                                            <div className="flex cursor-pointer items-center ps-3">
                                                <input id={`${evaluationMetric}-checkbox`}
                                                    type="checkbox"
                                                    value={evaluationMetric}
                                                    checked={selectedPerformanceMetrics.includes(evaluationMetric)}
                                                    onChange={handlePerformanceMetricChange}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                                                <label htmlFor={`${evaluationMetric}-checkbox`} className="w-full py-2 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">{evaluationMetric} </label>
                                            </div>
                                        </li>
                                    ))}


                                </ul>
                            </div>
                            <div className="flex-wrap -mx-3 mb-4">
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
                                        <span className="ml-5 text-white">Test: {splitRatio} %</span>
                                        <span className="ml-5 text-white">Train: {100 - splitRatio} %</span>
                                    </div>

                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <a href="/upload" className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                    back
                                </a>
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

