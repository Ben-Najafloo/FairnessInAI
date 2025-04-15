import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FairnessDashboard = ({ featureImportance }) => {
    const [demographicFeatures, setDemographicFeatures] = useState({});
    const [socioeconomicProxies, setSocioeconomicProxies] = useState({});
    const [industryBias, setIndustryBias] = useState({});
    const [topFactors, setTopFactors] = useState([]);

    useEffect(() => {
        if (!featureImportance) return;

        // Create groups of related features
        const demographicData = {};
        const socioeconomicData = {};
        const industryData = {};

        // Process feature importance data to categorize features
        Object.entries(featureImportance).forEach(([feature, value]) => {
            // Demographic factors
            if (feature.includes('Race/Ethnicity') ||
                feature.includes('Age') ||
                feature.includes('Disability') ||
                feature.includes('Gender')) {
                demographicData[feature] = value;
            }
            // Socioeconomic proxies
            else if (feature.includes('University') ||
                feature.includes('GPA') ||
                feature.includes('Education') ||
                feature.includes('Employment Gap')) {
                socioeconomicData[feature] = value;
            }
            // Industry bias
            else if (feature.includes('Industry_')) {
                industryData[feature] = value;
            }
        });

        // Get top 10 factors overall
        const sortedFactors = Object.entries(featureImportance)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        setDemographicFeatures(demographicData);
        setSocioeconomicProxies(socioeconomicData);
        setIndustryBias(industryData);
        setTopFactors(sortedFactors);
    }, [featureImportance]);

    // Chart options
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                display: false,
            },
            title: {
                display: true,
                text: 'Feature Importance by Category',
                color: 'white'
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `Importance: ${context.raw.toFixed(3)}`;
                    },
                    color: 'white'
                },
                titleColor: 'white',
                bodyColor: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.7)'
            },
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
                    display: true,
                    text: 'Importance Score',
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
        }
    };

    // Chart data preparation functions
    const createChartData = (dataObj, color) => {
        return {
            labels: Object.keys(dataObj),
            datasets: [
                {
                    label: 'Feature Importance',
                    data: Object.values(dataObj),
                    backgroundColor: color.bg,
                    borderColor: color.border,
                    borderWidth: 1,
                },
            ],
        };
    };

    // If no data, show loading or empty state
    if (!featureImportance || Object.keys(featureImportance).length === 0) {
        return (
            <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow">
                <div className="text-center p-10">
                    <p className="text-gray-500">No feature importance data available.</p>
                </div>
            </div>
        );
    }

    // Create chart data objects
    const demographicChartData = createChartData(
        demographicFeatures,
        { bg: 'rgba(255, 99, 132, 0.6)', border: 'rgba(255, 99, 132, 1)' }
    );

    const socioeconomicChartData = createChartData(
        socioeconomicProxies,
        { bg: 'rgba(54, 162, 235, 0.6)', border: 'rgba(54, 162, 235, 1)' }
    );

    const industryChartData = createChartData(
        industryBias,
        { bg: 'rgba(75, 192, 192, 0.6)', border: 'rgba(75, 192, 192, 1)' }
    );

    const topFactorsChartData = {
        labels: topFactors.map(item => item[0]),
        datasets: [
            {
                label: 'Feature Importance',
                data: topFactors.map(item => item[1]),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Helper function to find highest value in an object
    const getHighestValue = (obj) => {
        const values = Object.values(obj);
        return values.length > 0 ? Math.max(...values).toFixed(3) : 'N/A';
    };

    // Find demographic data with highest importance
    const hasRaceEthnicity = Object.keys(demographicFeatures).some(key => key.includes('Race/Ethnicity'));
    const highestRaceImportance = hasRaceEthnicity ?
        Object.entries(demographicFeatures)
            .filter(([key]) => key.includes('Race/Ethnicity'))
            .sort((a, b) => b[1] - a[1])[0] : null;

    return (
        <div className="max-w-6xl mx-auto">

            <div className="mb-8">
                <div className="p-4">
                    {/* <h2 className="text-xl font-semibold mb-2 text-white">Key Fairness Concerns</h2> */}
                    <h4 className="w-full text-md text-blue-300 mt-6 border-b border-b-blue-200 mb-5">Key Fairness Concerns:</h4>
                    <ul className="list-disc pl-5 space-y-2 text-white">
                        {Object.keys(demographicFeatures).length > 0 && (
                            <li>
                                <span className="font-medium">Demographic bias:</span> The model weighs demographic factors
                                {demographicFeatures['Age'] && <span> like age ({demographicFeatures['Age'].toFixed(3)})</span>}
                                {highestRaceImportance && <span> and {highestRaceImportance[0]} ({highestRaceImportance[1].toFixed(3)})</span>}
                            </li>
                        )}
                        {demographicFeatures['Disability Status_Yes'] && (
                            <li>
                                <span className="font-medium">Disability discrimination:</span> Disability status has notable influence ({demographicFeatures['Disability Status_Yes'].toFixed(3)})
                            </li>
                        )}
                        {Object.keys(socioeconomicProxies).length > 0 && (
                            <li>
                                <span className="font-medium">Socioeconomic barriers:</span> Features like
                                {socioeconomicProxies['University Prestige'] && <span> university prestige ({socioeconomicProxies['University Prestige'].toFixed(3)})</span>}
                                {socioeconomicProxies['GPA'] && <span> and GPA ({socioeconomicProxies['GPA'].toFixed(3)})</span>}
                                may disadvantage candidates from less privileged backgrounds
                            </li>
                        )}
                        {Object.keys(industryBias).length > 0 && (
                            <li>
                                <span className="font-medium">Industry preference:</span> Strong bias toward specific industries
                                (highest: {getHighestValue(industryBias)})
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {Object.keys(demographicFeatures).length > 0 && (
                    <div className="p-4">

                        <div className="h-64">
                            <Bar data={demographicChartData} options={{ ...options, plugins: { ...options.plugins, title: { display: true, color: 'white', text: 'Demographic Factors' } } }} />
                        </div>
                    </div>
                )}

                {Object.keys(socioeconomicProxies).length > 0 && (
                    <div className="p-4">

                        <div className="h-64">
                            <Bar data={socioeconomicChartData} options={{ ...options, plugins: { ...options.plugins, title: { display: true, color: 'white', text: 'Socioeconomic Proxies' } } }} />
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {Object.keys(industryBias).length > 0 && (
                    <div className="p-4">

                        <div className="h-64">
                            <Bar data={industryChartData} options={{ ...options, plugins: { ...options.plugins, title: { display: true, color: 'white', text: 'Industry Bias' } } }} />
                        </div>
                    </div>
                )}

                {/* <div className="p-4">

                    <div className="h-64">
                        <Bar data={topFactorsChartData} options={{ ...options, indexAxis: 'y', plugins: { ...options.plugins, title: { display: true, color: 'white', text: 'Top 10 Most Influential Features' } } }} />
                    </div>
                </div> */}
            </div>

            <div className="p-4 text-white">
                {/* <h2 className="text-xl font-semibold mb-2">Recommendations</h2> */}
                <h4 className="w-full text-md text-blue-300 mt-6 border-b border-b-blue-200 mb-5">Recommendations:</h4>
                <ul className="list-disc pl-5 space-y-2">
                    {Object.keys(demographicFeatures).length > 0 && (
                        <li>Consider removing or reducing influence of protected characteristics (e.g., {Object.keys(demographicFeatures).slice(0, 2).join(', ')})</li>
                    )}
                    {Object.keys(socioeconomicProxies).length > 0 && (
                        <li>Evaluate whether socioeconomic proxies are truly predictive of job success</li>
                    )}
                    {Object.keys(industryBias).length > 0 && (
                        <li>Examine why certain industries are weighted so heavily</li>
                    )}
                    <li>Implement fairness constraints to balance outcomes across demographic groups</li>
                    <li>Conduct disparate impact analysis to identify adverse outcomes</li>
                </ul>
            </div>
        </div>
    );
};

export default FairnessDashboard;