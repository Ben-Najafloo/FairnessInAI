import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { ProgressContext } from '../ProgressContext';
import Slider from '@mui/material/Slider';
import axios from 'axios';

import { motion } from 'framer-motion';
import { ScaleLoader } from 'react-spinners';
import { BsCaretDownFill } from "react-icons/bs";
import { TbAutomation } from "react-icons/tb";
import { GrManual } from "react-icons/gr";

import manualPNG from '../img/manual.png';
import autoPNG from '../img/auto2.png';

const Training = () => {

    const location = useLocation();
    // const datasetInfo = location.state?.datasetInfo;
    const { datasetInfo, doHandleMissData, doBalanceData } = location.state || {};
    const { problem_type } = datasetInfo || {};
    console.log(problem_type)

    const navigate = useNavigate();

    const { setProgress } = useContext(ProgressContext);

    const [showFinalConfig, setShowFinalConfig] = useState(true);
    const [showConfigTable, setShowConfigTable] = useState(true);
    const [showConfigTableManual, setShowConfigTableManual] = useState(false);

    const [dataTypeIsExpanded, setDataTypeIsExpanded] = useState(false);

    const [selectedAlgorithms, setSelectedAlgorithms] = useState([]);
    const [selectedFairnessMetrics, setSelectedFairnessMetrics] = useState([]);
    const [splitRatio, setSplitRatio] = useState(20); // Default: Test 20%, Train 80%


    const regressionAlgorithms = ['Linear Regression', 'Random Forest Regression', 'Gradient Boosting Regression', 'Decision Tree Regression'];
    const classificationAlgorithms = ['Logistic Regression', 'Support Vector Machine', 'Naive Bayes', 'Random Forest Classification'];
    const algorithms =
        problem_type === "regression"
            ? regressionAlgorithms
            : problem_type === "classification"
                ? classificationAlgorithms
                : [];

    const metrics = ['Demographic Parity Difference', 'Equalized Odds Difference', 'Disparate Impact Difference'];


    const handleManualConfig = () => {
        setShowConfigTable(false);
        setShowConfigTableManual(true);

    }

    const closeManualConfig = () => {
        setShowConfigTable(true);
        setShowConfigTableManual(false);
    }

    // show the details    
    const dataTypeView = () => {
        setDataTypeIsExpanded(!dataTypeIsExpanded);
    };

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


    const handleSplitChange = (event, value) => {
        setSplitRatio(value); // Update the split ratio
    };

    // Form submission handler
    const handleManualSubmit = async (event) => {
        event.preventDefault();

        const formData = {
            selectedAlgorithms,
            selectedFairnessMetrics,
            splitRatio,
            trainSplitRatio: 100 - splitRatio,
            doHandleMissData,
            doBalanceData,
            problem_type
        };
        console.log(formData);
        try {
            // Send POST request to the backend
            const response = await axios.post("http://localhost:5000/train", formData);

            const result = response.data;
            console.log('Training Result:', result);
            setProgress(8);
            navigate('/analys', { state: { result } });
        } catch (error) {
            console.error('Error during training:', error);
        }
    };

    const [isLoading, setIsLoading] = useState(false);
    const handleAutoSubmit = async (event) => {
        event.preventDefault();

        const defaultAlgorithm = "TPOT";
        const defaultMetric = 'Demographic Parity';

        const formData = {
            selectedAlgorithms: [defaultAlgorithm],
            selectedFairnessMetrics: [defaultMetric],
            splitRatio,
            trainSplitRatio: 100 - splitRatio,
            doHandleMissData,
            doBalanceData,
            problem_type,
            tpotGenerations: 5,  // Default values for TPOT
            tpotPopulationSize: 15
        };

        setIsLoading(true); // Start loading
        setShowFinalConfig(false);

        try {
            const response = await axios.post("http://localhost:5000/train", formData);
            const result = response.data;
            setProgress(8);
            console.log('Training Result:', result);
            setIsLoading(false); // Stop loading after success
            navigate('/analys', { state: { result } });
        } catch (error) {
            setIsLoading(false);
            console.error('Error during training:', error);
        }
    };

    return (
        <div>
            <section>

                {/* spinners */}
                <div>
                    {isLoading && (
                        <div className="md:pl-5 w-full">
                            <div className="bg-gray-800 py-4 px-9 h-[450px]">
                                <div style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <ScaleLoader color="#FFFFFF" loading={true} size={200} />
                                    <p className='text-white'>Training in progress...</p>
                                    <p className='text-white'>It is working with TPOT Algorithm. IT will terminate when the first condition is met.</p>
                                    <p className='text-white'>Generation size: 5  </p>
                                    <p className='text-white'>Population size: 15  </p>
                                    <p className='text-white'>This may take a while, enjoy your coffee!</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {showFinalConfig && (
                    <div className="md:pl-5 w-full">
                        <div className="bg-gray-800 py-4 px-9 h-[565px] md:max-h-[565px] overflow-auto">
                            <h2 className="text-xl mb-6 font-semibold text-gray-900 dark:text-white sm:text-2xl">Final Configuration</h2>

                            {showConfigTable && (
                                <div className="w-full pl-4">
                                    <h4 class="mb-2 text-base text-white">Choose the Mode:</h4>
                                    <ul class="grid w-full gap-6 md:grid-cols-2">
                                        {/* automatically Configuration */}
                                        <li>
                                            <label onClick={handleAutoSubmit} class="inline-flex items-center justify-between text-gray-200 w-full p-5 border border-gray-200 rounded-lg cursor-pointer hover:bg-slate-700 hover:border-green-400">

                                                <div class="block">
                                                    <div className='flex'>
                                                        <TbAutomation class="mb-2 w-7 h-7 mr-4" alt="alt" />
                                                        <div class="text-xl mb-3 font-semibold">Auto</div>
                                                    </div>
                                                    <div class="w-full ml-2">
                                                        <p class="text-sm">
                                                            Auto mode streamlines the process and generates production-ready code with tuned hyperparameters, saving time and ensuring fairness-aware, high-performance modeling.
                                                        </p>
                                                    </div>
                                                </div>
                                            </label>

                                            {/* show details of auto confif button */}
                                            <button onClick={dataTypeView} class=" hover:text-blue-300 px-5 inline-flex items-center text-white mt-1">
                                                {dataTypeIsExpanded ? (
                                                    <>
                                                        <span>Hide Details</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>See more Details of auto mode</span>
                                                    </>
                                                )}
                                                <motion.span animate={{ rotate: dataTypeIsExpanded ? 180 : 0 }}>
                                                    <BsCaretDownFill className="ml-3" />
                                                </motion.span>
                                            </button>

                                        </li>
                                        <li>
                                            <label onClick={handleManualConfig} class="inline-flex items-center justify-between text-gray-200 w-full p-5 border border-gray-200 rounded-lg cursor-pointer hover:bg-slate-700 hover:border-green-400">
                                                <div class="block">
                                                    <div className='flex'>
                                                        <GrManual class="mb-2 w-7 h-7 mr-4" alt="alt" />
                                                        <div class="text-xl mb-3 font-semibold">Manual</div>
                                                    </div>
                                                    <div class="w-full ml-2">
                                                        <p class="text-sm">
                                                            You have full control to manually select the algorithm, fairness metric, and train-test split ratio.
                                                            <span className='font-bold italic mr-2'>&nbsp;All configuration options align with the selected problem type to ensure valid and meaningful evaluations.</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </label>
                                        </li>
                                    </ul>
                                    {/* show details of auto Configuration */}
                                    {dataTypeIsExpanded && (
                                        <motion.div>
                                            {/* 
                                            {(doBalanceData || doHandleMissData) && (
                                                <span className='text-white leading-8'>Before processing of fairness assessment as there are:</span>
                                            )}
                                            
                                            {doBalanceData && (
                                                <p className='text-white leading-8'>
                                                    <ul>
                                                        <li className='list-disc list-inside pl-3'> Imbalance class distribution in your dataset, it will be balanced (sintatic data points will be generated and added).</li>
                                                    </ul>
                                                </p>
                                            )} */}
                                            <p className='text-white leading-8 mt-4'>Based on the problem type and a preliminary fairness analysis, the tool automatically selects a suitable &nbsp;
                                                {problem_type && (<span className='font-bold italic mr-2 text-green-500'>
                                                    {problem_type.toUpperCase()}
                                                </span>)}
                                                algorithm using TPOT (Tree-based Pipeline Optimization Tool). It applies automated machine learning (AutoML) techniques to identify the best-performing pipeline tailored to your dataset and fairness objectives.
                                            </p>
                                            <p className='text-white leading-8'>
                                                <ul>
                                                    <li className='list-disc list-inside pl-3'><span className='font-bold italic mr-2'> Algorithm Selection: </span>Automatically optimized through TPOT to maximize performance and fairness.</li>
                                                    <li className='list-disc list-inside pl-3'><span className='font-bold italic mr-2'> Fairness Metric: </span>Chosen based on the dataset’s structure and the fairness context (e.g., group fairness vs. individual fairness).</li>
                                                    <li className='list-disc list-inside pl-3'><span className='font-bold italic mr-2'> Data Split: </span>80% for training, 20% for testing—ensuring robust evaluation.</li>
                                                    <li className='list-disc list-inside pl-3'><span className='font-bold italic mr-2'> Imbalance Handling: </span>If class imbalance is detected, synthetic samples will be generated to balance the dataset before model training.</li>
                                                </ul>
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* manually Configuration */}
                            <div>
                                {showConfigTableManual && (
                                    <div className='pl-4 mt-16'>
                                        <div className="flex-wrap -mx-3 my-6">

                                            <h3 className="mb-1 text-white">Algorithm for training: </h3>
                                            <ul class="grid w-2/3 gap-2 md:grid-cols-2">
                                                {algorithms.map((algorithm) => (

                                                    <li>
                                                        <input type="checkbox" id={`${algorithm}-checkbox`} value={algorithm} checked={selectedAlgorithms.includes(algorithm)} onChange={handleAlgorithmChange} class="hidden peer" />
                                                        <label for={`${algorithm}-checkbox`} class="inline-flex rounded items-center justify-between text-gray-200 w-full pt-2 px-5 border border-gray-200  cursor-pointer peer-checked:border-green-400 hover:text-gray-600  peer-checked:text-green-400 hover:bg-gray-50 ">
                                                            <div class="block">
                                                                <div className='flex'>
                                                                    <div class="w-full">
                                                                        <div class="text-sm mb-3">{algorithm}</div>
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
                                                        <label for={`${metric}-checkbox`} class="inline-flex rounded items-center justify-between text-gray-200 w-full pt-2 px-5 border border-gray-200  cursor-pointer peer-checked:border-green-400 hover:text-gray-600  peer-checked:text-green-400 hover:bg-gray-50 ">
                                                            <div class="block">
                                                                <div className='flex'>
                                                                    <div class="w-full">
                                                                        <div class="text-sm mb-3">{metric}</div>
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

                                        <div className="flex items-center space-x-4 mt-9">
                                            <button onClick={closeManualConfig} className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                                Back
                                            </button>
                                            <button onClick={handleManualSubmit} className="text-white bg-blue-500 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                                                Start Training
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                    </div>
                )}

            </section>

        </div>
    )
}

export default Training

