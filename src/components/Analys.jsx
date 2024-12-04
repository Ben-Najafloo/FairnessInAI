import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Analys = () => {
    const location = useLocation();
    const { result } = location.state || {}; // Get result from location state

    if (!result) {
        return <p>No results available. Please start training.</p>;
    }

    // Extract the evaluation object and message from the result
    const { evaluation, message } = result;
    const { fairness_score, performance_score } = evaluation || {};

    return (
        <div>
            <h1>Training Results</h1>
            <div className="results-container">
                <p><strong>Message:</strong> {message}</p>
                <p><strong>Fairness Score:</strong> {fairness_score !== undefined ? fairness_score : 'N/A'}</p>
                <p><strong>Performance Score:</strong> {performance_score !== undefined ? performance_score : 'N/A'}</p>
            </div>
            <Link to="/training" className="back-button">
                Train Again
            </Link>
        </div>
    );
};

export default Analys;
