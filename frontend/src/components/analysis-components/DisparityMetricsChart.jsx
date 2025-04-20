import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const DisparityMetricsChart = ({ disparity_metrics }) => {
    if (!disparity_metrics) return null;

    const labels = [
        'False Negative Rate Disparity',
        'False Positive Rate Disparity',
        'Selection Rate Disparity'
    ];

    const values = [
        disparity_metrics.false_negative_rate_disparity,
        disparity_metrics.false_positive_rate_disparity,
        disparity_metrics.selection_rate_disparity
    ];

    const data = {
        labels,
        datasets: [
            {
                label: 'Disparity',
                data: values,
                backgroundColor: [
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)'
                ]
            }
        ]
    };

    const options = {
        indexAxis: 'y', // Horizontal bars
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false,
                text: 'Disparity Metrics',
                color: 'white',
                font: {
                    size: 18
                }
            },
            tooltip: {
                callbacks: {
                    label: context => `${context.parsed.x.toFixed(3)}`
                }
            },
            datalabels: {
                color: 'white',
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                max: 1,
                ticks: {
                    color: 'white'
                },
                title: {
                    display: false,
                    text: 'Disparity Value',
                    color: 'white'
                }
            },
            y: {
                ticks: {
                    color: 'white'
                }
            }
        }
    };

    return <Bar data={data} options={options} />;
};

export default DisparityMetricsChart;
