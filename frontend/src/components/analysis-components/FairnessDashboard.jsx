import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FairnessDashboard = ({
    featureImportance,
    domain = 'general', // Options: 'employment', 'lending', 'education', 'criminal_justice', 'general'
    categoryMapping = null, // Optional custom category mapping
    customMetrics = null, // Optional additional metrics to display
}) => {
    const [categorizedFeatures, setCategorizedFeatures] = useState({});
    const [topFactors, setTopFactors] = useState([]);
    const [domainSpecificInsights, setDomainSpecificInsights] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    // Default category mappings for different domains
    const defaultCategoryMappings = {
        employment: {
            demographic: ['Race/Ethnicity', 'Age', 'Gender', 'Disability Status'],
            socioeconomic: ['University', 'GPA', 'Education', 'Employment Gap'],
            industry: ['Industry_'],
        },
        lending: {
            demographic: ['Race/Ethnicity', 'Age', 'Gender', 'Marital Status'],
            socioeconomic: ['Income', 'Employment', 'Education'],
            financial: ['Credit_Score', 'Debt', 'Payment_History'],
        },
        education: {
            demographic: ['Race/Ethnicity', 'Age', 'Gender', 'Disability Status'],
            socioeconomic: ['Family_Income', 'Parents_Education', 'Zip_Code'],
            academic: ['Test_Score', 'GPA', 'Extra_Curricular'],
        },
        criminal_justice: {
            demographic: ['Race/Ethnicity', 'Age', 'Gender'],
            socioeconomic: ['Income', 'Education', 'Employment'],
            history: ['Prior_Convictions', 'Misdemeanor', 'Felony', 'Juvenile'],
            risk: ['Risk_', 'Score_', 'Recidivism_'],
        },
        general: {
            demographic: ['Race', 'Ethnicity', 'Age', 'Gender', 'Disability', 'Sex'],
            background: ['Education', 'Income', 'Employ', 'History'],
            system_specific: [], // Will be populated with any features that don't fit other categories
        }
    };

    // Domain-specific recommendation templates
    const domainRecommendations = {
        employment: [
            "Consider removing or reducing influence of protected characteristics",
            "Evaluate whether socioeconomic proxies are truly predictive of job success",
            "Examine why certain industries are weighted so heavily",
        ],
        lending: [
            "Analyze whether credit scoring has disparate impact on protected groups",
            "Consider alternative credit evaluation methods for underrepresented groups",
            "Ensure zip code and location factors aren't proxies for racial segregation",
        ],
        education: [
            "Evaluate whether standardized test scores have equitable outcomes across demographics",
            "Consider socioeconomic factors that might impact educational opportunities",
            "Implement holistic review processes to mitigate systemic disadvantages",
        ],
        criminal_justice: [
            "Assess whether risk scores correlate with protected characteristics",
            "Evaluate the impact of prior history weighting on different demographic groups",
            "Consider implementation of race-neutral risk assessment factors",
            "Review whether geographic/neighborhood factors create disparate outcomes",
        ],
        general: [
            "Identify and minimize the influence of protected characteristics",
            "Examine proxies that might indirectly encode demographic information",
            "Implement fairness constraints to balance outcomes across demographic groups",
            "Conduct disparate impact analysis to identify adverse outcomes",
        ]
    };

    // Colors for different categories
    const categoryColors = {
        demographic: { bg: 'rgba(255, 99, 132, 0.6)', border: 'rgba(255, 99, 132, 1)' },
        socioeconomic: { bg: 'rgba(54, 162, 235, 0.6)', border: 'rgba(54, 162, 235, 1)' },
        industry: { bg: 'rgba(75, 192, 192, 0.6)', border: 'rgba(75, 192, 192, 1)' },
        financial: { bg: 'rgba(153, 102, 255, 0.6)', border: 'rgba(153, 102, 255, 1)' },
        academic: { bg: 'rgba(255, 159, 64, 0.6)', border: 'rgba(255, 159, 64, 1)' },
        history: { bg: 'rgba(255, 205, 86, 0.6)', border: 'rgba(255, 205, 86, 1)' },
        risk: { bg: 'rgba(201, 203, 207, 0.6)', border: 'rgba(201, 203, 207, 1)' },
        background: { bg: 'rgba(75, 192, 192, 0.6)', border: 'rgba(75, 192, 192, 1)' },
        system_specific: { bg: 'rgba(153, 102, 255, 0.6)', border: 'rgba(153, 102, 255, 1)' },
        other: { bg: 'rgba(100, 100, 100, 0.6)', border: 'rgba(100, 100, 100, 1)' },
    };

    // Function to determine if a feature matches a category
    const featureMatchesCategory = (feature, patterns) => {
        return patterns.some(pattern => {
            if (typeof pattern === 'string') {
                return feature.includes(pattern);
            }
            if (pattern instanceof RegExp) {
                return pattern.test(feature);
            }
            return false;
        });
    };

    useEffect(() => {
        if (!featureImportance) return;

        // Use provided category mapping or fall back to default
        const mapping = categoryMapping || defaultCategoryMappings[domain] || defaultCategoryMappings.general;

        // Initialize categories
        const categorized = {};
        Object.keys(mapping).forEach(category => {
            categorized[category] = {};
        });
        categorized.other = {}; // For anything uncategorized

        // Categorize features
        Object.entries(featureImportance).forEach(([feature, value]) => {
            let matchFound = false;

            for (const [category, patterns] of Object.entries(mapping)) {
                if (featureMatchesCategory(feature, patterns)) {
                    categorized[category][feature] = value;
                    matchFound = true;
                    break;
                }
            }

            if (!matchFound) {
                categorized.other[feature] = value;
            }
        });

        // Get top 10 factors overall
        const sortedFactors = Object.entries(featureImportance)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        setCategorizedFeatures(categorized);
        setTopFactors(sortedFactors);

        // Generate domain-specific insights
        generateDomainInsights(categorized, domain);

        // Generate recommendations
        let baseRecommendations = domainRecommendations[domain] || domainRecommendations.general;

        // Add general recommendations
        baseRecommendations = [
            ...baseRecommendations,
            "Implement fairness constraints to balance outcomes across groups",
            "Conduct disparate impact analysis to identify adverse outcomes"
        ];

        setRecommendations(baseRecommendations);

    }, [featureImportance, domain, categoryMapping]);

    // Generate domain-specific insights based on the features and their importance
    const generateDomainInsights = (categorized, domain) => {
        const insights = [];

        // Check for demographic bias
        if (categorized.demographic && Object.keys(categorized.demographic).length > 0) {
            const demographicFactors = Object.entries(categorized.demographic)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2);

            if (demographicFactors.length > 0) {
                insights.push({
                    title: "Demographic bias",
                    description: `The model weighs demographic factors like ${demographicFactors[0][0]} (${demographicFactors[0][1].toFixed(3)})${demographicFactors.length > 1 ? ` and ${demographicFactors[1][0]} (${demographicFactors[1][1].toFixed(3)})` : ''
                        }`
                });
            }
        }

        // Domain-specific insights
        if (domain === 'employment') {
            if (categorized.socioeconomic && Object.keys(categorized.socioeconomic).length > 0) {
                insights.push({
                    title: "Socioeconomic barriers",
                    description: "Features related to education and employment history may disadvantage candidates from less privileged backgrounds"
                });
            }
        } else if (domain === 'lending') {
            if (categorized.financial && Object.keys(categorized.financial).length > 0) {
                insights.push({
                    title: "Financial access barriers",
                    description: "Credit history metrics may disadvantage groups with historical barriers to financial services"
                });
            }
        } else if (domain === 'criminal_justice') {
            if (categorized.history && Object.keys(categorized.history).length > 0) {
                insights.push({
                    title: "Criminal history bias",
                    description: "Heavy reliance on prior history may perpetuate systemic biases in the criminal justice system"
                });
            }
            if (categorized.risk && Object.keys(categorized.risk).length > 0) {
                insights.push({
                    title: "Risk score concerns",
                    description: "Risk assessment scores may embed and amplify biases present in historical data"
                });
            }
        }

        // Add any strong factors from other categories
        Object.entries(categorized).forEach(([category, features]) => {
            if (category !== 'demographic' && Object.keys(features).length > 0) {
                const strongestFeature = Object.entries(features).sort((a, b) => b[1] - a[1])[0];
                if (strongestFeature && strongestFeature[1] > 0.3) {  // Only if importance is significant
                    insights.push({
                        title: `Strong ${category} influence`,
                        description: `High importance of ${strongestFeature[0]} (${strongestFeature[1].toFixed(3)}) may affect fairness outcomes`
                    });
                }
            }
        });

        setDomainSpecificInsights(insights);
    };

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
                    }
                },
                titleColor: 'white',
                bodyColor: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.7)'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
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
                    text: 'Features',
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

    // Format category name for display
    const formatCategoryName = (category) => {
        return category
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
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

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <div className="p-4">
                    <h4 className="w-full text-md text-blue-300 mt-6 border-b border-b-blue-200 mb-5">Key Fairness Concerns:</h4>
                    <ul className="list-disc pl-5 space-y-2 text-white">
                        {domainSpecificInsights.map((insight, index) => (
                            <li key={index}>
                                <span className="font-medium">{insight.title}:</span> {insight.description}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Top factors chart */}
            {/* <div className="p-4 mb-8">
                <h4 className="w-full text-md text-blue-300 mt-6 border-b border-b-blue-200 mb-5">Top 10 Most Important Features</h4>
                <div className="h-64">
                    <Bar
                        data={{
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
                        }}
                        options={options}
                    />
                </div>
            </div> */}

            {/* Category charts */}
            <h4 className="w-full text-md text-blue-300 mt-6 border-b border-b-blue-200 mb-5">Category Charts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {Object.entries(categorizedFeatures).map(([category, features], index) => {
                    if (Object.keys(features).length === 0) return null;

                    const color = categoryColors[category] || categoryColors.other;
                    const chartData = createChartData(features, color);
                    const categoryTitle = formatCategoryName(category);

                    return (
                        <div className="p-4" key={index}>
                            <div className="h-96">
                                <Bar
                                    data={chartData}
                                    options={{
                                        ...options,
                                        plugins: {
                                            ...options.plugins,
                                            title: {
                                                display: true,
                                                color: 'white',
                                                text: categoryTitle
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Custom metrics display if provided */}
            {customMetrics && (
                <div className="p-4 mb-8">
                    <h4 className="w-full text-md text-blue-300 mt-6 border-b border-b-blue-200 mb-5">Additional Fairness Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(customMetrics).map(([metric, value], index) => (
                            <div key={index} className="bg-gray-800 p-4 rounded-lg">
                                <h5 className="text-lg font-medium text-white mb-2">{formatCategoryName(metric)}</h5>
                                <p className="text-2xl font-bold text-blue-300">{typeof value === 'number' ? value.toFixed(3) : value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-4 text-white">
                <h4 className="w-full text-md text-blue-300 mt-6 border-b border-b-blue-200 mb-5">Recommendations:</h4>
                <ul className="list-disc pl-5 space-y-2">
                    {recommendations.map((recommendation, index) => (
                        <li key={index}>{recommendation}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FairnessDashboard;