import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { ProgressContext } from '../ProgressContext';
import Slider from '@mui/material/Slider';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ScaleLoader } from 'react-spinners';
import { BsCaretDownFill } from "react-icons/bs";

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

    const metrics = ['Demographic Parity', 'Equalized Odds', 'Disparate Impact'];


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
                            <div className="bg-gray-800 py-4 px-9 rounded-lg h-[450px]">
                                <div style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <ScaleLoader color="#FFFFFF" loading={true} size={200} />
                                    <p className='text-white'>Training in progress...</p>
                                    <p className='text-white'>It is working with TPOT Algorithm</p>
                                    <p className='text-white'>Generation size: 5  </p>
                                    <p className='text-white'>Population size: 15  </p>
                                    <p className='text-white'>It will take some minutes, enjoy your coffee!</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {showFinalConfig && (
                    <div className="md:pl-5 w-full">
                        <div className="bg-gray-800 py-4 px-9 rounded-lg h-[550px] md:max-h-[550px] overflow-auto">
                            <h2 className="text-xl mb-6 font-semibold text-gray-900 dark:text-white sm:text-2xl">Final Configuration</h2>

                            {showConfigTable && (
                                <div className="w-full pl-4">
                                    <h4 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Choose the Configuration Way:</h4>
                                    <ul class="grid w-full gap-6 md:grid-cols-2">
                                        {/* automatically Configuration */}
                                        <li>
                                            <label onClick={handleAutoSubmit} class="inline-flex items-center justify-between text-gray-200 w-full p-5 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-slate-700 hover:border-green-400">

                                                <div class="block">
                                                    <div className='flex'>
                                                        <img src={autoPNG} class="mb-2 w-20 h-20" alt="alt" />
                                                        <div class="w-full ml-4">
                                                            <div class="text-xl mb-3 font-semibold">Auto</div>
                                                            <p class="w-72 text-sm">All configuration options align with the selected problem type.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>

                                            {/* show details of auto confif button */}
                                            <button onClick={dataTypeView} class=" hover:font-bold px-5 inline-flex items-center text-white mt-4">
                                                {dataTypeIsExpanded ? (
                                                    <>
                                                        <span>Hide Details</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>View Details</span>
                                                    </>
                                                )}
                                                <motion.span animate={{ rotate: dataTypeIsExpanded ? 180 : 0 }}>
                                                    <BsCaretDownFill className="ml-3" />
                                                </motion.span>
                                            </button>

                                        </li>
                                        <li>
                                            <label onClick={handleManualConfig} class="inline-flex items-center justify-between text-gray-200 w-full p-5 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-slate-700 hover:border-green-400">
                                                <div class="block">
                                                    <div className='flex'>
                                                        <img src={manualPNG} class="mb-2 w-20 h-20" alt="alt" />
                                                        <div class="w-full ml-4">
                                                            <div class="text-xl mb-3 font-semibold">Manual</div>
                                                            <p class="w-72 text-sm">All configuration options align with the selected problem type.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        </li>
                                    </ul>
                                    {/* show details of auto Configuration */}
                                    {dataTypeIsExpanded && (
                                        <motion.div>
                                            <p className='text-white leading-8 mt-4'>According to the problem type and pre assessment of the fairness, it is suggested to use
                                                <br />
                                                {problem_type && (<span className='font-bold italic mr-2 text-green-500'>
                                                    {problem_type.toUpperCase()}
                                                </span>)}
                                                algorithms for training.
                                                <br /> Also the ratio for splitting the dataset will be <br /> <span className='font-bold italic'> Testing: 20% and Training: 80%.</span>
                                            </p>
                                            {(doBalanceData || doHandleMissData) && (
                                                <span className='text-white leading-8'>Before processing of fairness assessment as there are:</span>
                                            )}
                                            {doHandleMissData && (
                                                <p className='text-white leading-8'>
                                                    <ul>
                                                        <li className='list-disc list-inside pl-3'> Missing value in your dataset, it will be handeled according to the type of the missed values.</li>
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

                                        <div className="flex items-center space-x-4 mt-7">
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

