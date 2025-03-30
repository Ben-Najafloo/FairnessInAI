import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { ProgressContext } from '../ProgressContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ScaleLoader } from 'react-spinners';

const Training = () => {
    const location = useLocation();
    const { datasetInfo, doHandleMissData, doBalanceData } = location.state || {};
    const { problem_type } = datasetInfo || {};

    const navigate = useNavigate();
    const { setProgress } = useContext(ProgressContext);

    const [isLoading, setIsLoading] = useState(false);
    const [trainingProgress, setTrainingProgress] = useState(0);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Connect to WebSocket
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        // Listen for training progress
        newSocket.on('training_progress', (data) => {
            setTrainingProgress(data.progress_percentage);
        });

        // Listen for training completion
        newSocket.on('training_complete', (result) => {
            setIsLoading(false);
            setProgress(8);
            navigate('/analys', { state: { result } });
        });

        // Listen for training errors
        newSocket.on('training_error', (error) => {
            console.error('Training Error:', error);
            setIsLoading(false);
        });

        // Cleanup socket on component unmount
        return () => newSocket.close();
    }, [navigate, setProgress]);

    const handleAutoSubmit = async (event) => {
        event.preventDefault();

        const defaultAlgorithm = "TPOT";
        const defaultMetric = 'Demographic Parity';

        const formData = {
            selectedAlgorithms: [defaultAlgorithm],
            selectedFairnessMetrics: [defaultMetric],
            splitRatio: 20,
            trainSplitRatio: 80,
            doHandleMissData,
            doBalanceData,
            problem_type,
            tpotGenerations: 5,
            tpotPopulationSize: 15
        };

        setIsLoading(true);
        setTrainingProgress(0);

        try {
            await axios.post("http://localhost:5000/train", formData);
        } catch (error) {
            console.error('Error during training:', error);
            setIsLoading(false);
        }
    };

    return (
        <div>
            {isLoading && (
                <div className="md:pl-5 w-full">
                    <div className="bg-gray-800 py-4 px-9 rounded-lg h-[450px]">
                        <div style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <ScaleLoader color="#FFFFFF" loading={true} size={200} />
                            <p className='text-white'>Training in progress... {trainingProgress}%</p>
                            <p className='text-white'>TPOT Algorithm Progress</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${trainingProgress}%` }}
                                ></div>
                            </div>
                            <p className='text-white mt-2'>Generation size: 5</p>
                            <p className='text-white'>Population size: 15</p>
                            <p className='text-white'>This may take a while, enjoy your coffee!</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Rest of your existing component code */}
        </div>
    )
}

export default Training;