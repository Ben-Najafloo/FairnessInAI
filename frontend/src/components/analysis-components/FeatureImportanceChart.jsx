import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend, ChartDataLabels);

const FeatureImportanceChart = ({ feature_importance }) => {
    if (!feature_importance) return <p className="text-gray-100">Feature importance not available.</p>;

    const safeFeatureImportance = feature_importance || {};
    // Convert the object to an array and sort descending based on importance
    const sortedImportance = Object.entries(safeFeatureImportance).sort((a, b) => b[1] - a[1]);

    // Get the top 10 features
    const top10 = sortedImportance.slice(0, 5);

    // Map the top 10 to extract labels and their associated importance values
    const labels = top10.map(([feature]) => feature);
    const dataValues = top10.map(([, importance]) => importance);

    const data = {
        labels,
        datasets: [
            {
                label: 'Feature Importance',
                data: dataValues,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        indexAxis: 'y',
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    drawBorder: false,
                    display: false
                },
                ticks: {
                    display: false
                }
            },
            y: {
                grid: {
                    display: false,
                    drawBorder: false,
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: 'white'
                },

            }
        },
        // elements: {
        //     bar: {
        //         barThickness: 4,
        //     },
        // },
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            datalabels: {
                display: true,
                color: 'white',
                anchor: 'end',
                align: 'end',
                formatter: (value) => `${value.toFixed(2)}`,
                font: {
                    weight: 'bold',
                    size: 12
                },
                padding: {
                    right: 6
                }
            }
        },
    };

    return (
        <div style={{ height: '350px' }}>
            <Bar data={data} options={options} />
        </div>
    );
};

export default FeatureImportanceChart;
