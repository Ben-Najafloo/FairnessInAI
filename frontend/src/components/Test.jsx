import React, { useState } from 'react';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const Test = () => {

    // Sample data - would be replaced with your actual model results
    const [modelData, setModelData] = useState({
        performance: {
            accuracy: 0.78,
            precision: 0.8,
            recall: 0.8,
            f1_score: 0.79,
            roc_auc: 0.82
        },
        fairness: {
            demographic_parity_difference: 0,
            equalized_odds_difference: 0.05,
            selection_rate_disparity: 0.92,
            accuracy_disparity: 0.95
        },
        group_metrics: {
            group_0: {
                count: 150,
                accuracy: 0.77,
                selection_rate: 0.42,
                false_positive_rate: 0.21,
                false_negative_rate: 0.18
            },
            group_1: {
                count: 120,
                accuracy: 0.81,
                selection_rate: 0.39,
                false_positive_rate: 0.19,
                false_negative_rate: 0.15
            }
        },
        confusion_matrix: [
            [100, 20],
            [30, 150]
        ],
        feature_importance: {
            "age": 0.28,
            "income": 0.22,
            "education": 0.18,
            "location": 0.12,
            "employment": 0.10,
            "marital_status": 0.06,
            "credit_score": 0.04
        }
    });

    // Transform data for visualizations
    const performanceData = Object.entries(modelData.performance).map(([metric, value]) => ({
        name: metric.replace('_', ' ').toUpperCase(),
        value: value
    }));

    const fairnessData = Object.entries(modelData.fairness).map(([metric, value]) => ({
        name: metric.replace(/_/g, ' ').toUpperCase(),
        value: value
    }));

    const groupMetricsData = Object.entries(modelData.group_metrics).map(([group, metrics]) => ({
        name: group.replace('_', ' ').toUpperCase(),
        ...metrics
    }));

    const featureImportanceData = Object.entries(modelData.feature_importance)
        .sort((a, b) => b[1] - a[1])
        .map(([feature, importance]) => ({
            name: feature.replace('_', ' '),
            value: importance
        }));

    // const confusionMatrixData = [
    //     { name: 'True Negative', value: modelData.confusion_matrix[0][0] },
    //     { name: 'False Positive', value: modelData.confusion_matrix[0][1] },
    //     { name: 'False Negative', value: modelData.confusion_matrix[1][0] },
    //     { name: 'True Positive', value: modelData.confusion_matrix[1][1] }
    // ];

    // const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <div className="w-full max-w-6xl mx-auto p-4 bg-white">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="h-64">
                    <p>first chart</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 1]} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>


                {/* <div className="h-64">
                    <p>2th chart</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={confusionMatrixData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {confusionMatrixData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div> */}



                <div className="h-64">
                    <p>3th chart</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={groupMetricsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 1]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="accuracy" fill="#8884d8" name="Accuracy" />
                            <Bar dataKey="selection_rate" fill="#82ca9d" name="Selection Rate" />
                            <Bar dataKey="false_positive_rate" fill="#ffc658" name="False Positive Rate" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(modelData.performance).map(([metric, value]) => (
                        <div key={metric} className="bg-gray-100 p-4 rounded-lg">
                            <h3 className="uppercase text-sm font-medium text-gray-500">{metric.replace('_', ' ')}</h3>
                            <p className="text-2xl font-bold">{(value * 100).toFixed(1)}%</p>
                        </div>
                    ))}
                </div>

                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={groupMetricsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 1]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="accuracy" fill="#8884d8" name="Accuracy" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                    <div className="bg-blue-100 p-4 text-center border">
                        <p className="font-bold">{modelData.confusion_matrix[0][0]}</p>
                        <p className="text-sm">True Negative</p>
                    </div>
                    <div className="bg-red-100 p-4 text-center border">
                        <p className="font-bold">{modelData.confusion_matrix[0][1]}</p>
                        <p className="text-sm">False Positive</p>
                    </div>
                    <div className="bg-red-100 p-4 text-center border">
                        <p className="font-bold">{modelData.confusion_matrix[1][0]}</p>
                        <p className="text-sm">False Negative</p>
                    </div>
                    <div className="bg-blue-100 p-4 text-center border">
                        <p className="font-bold">{modelData.confusion_matrix[1][1]}</p>
                        <p className="text-sm">True Positive</p>
                    </div>
                </div>

            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={fairnessData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 1]} />
                            <YAxis dataKey="name" type="category" width={150} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>



                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={groupMetricsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 1]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="selection_rate" fill="#82ca9d" name="Selection Rate" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>



                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={groupMetricsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 1]} />
                            <Tooltip />
                            <Bar dataKey="false_positive_rate" fill="#ffc658" name="False Positive Rate" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>



                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={groupMetricsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 1]} />
                            <Tooltip />
                            <Bar dataKey="false_negative_rate" fill="#ff8042" name="False Negative Rate" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>




            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={featureImportanceData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>



        </div>
    );
};

export default Test;