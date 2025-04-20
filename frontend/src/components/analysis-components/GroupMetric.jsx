import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Legend,
    Tooltip,
    Title
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip, Title);

const GroupMetric = ({ group_metrics }) => {
    if (!group_metrics) return null;

    const allGroups = Object.keys(group_metrics);
    const groups = allGroups.slice(0, 5); // Limit to first 5 groups

    const accuracy = groups.map(
        key => (group_metrics?.[key]?.accuracy ?? 0).toFixed(2)
    );
    const fpr = groups.map(
        key => (group_metrics?.[key]?.false_positive_rate ?? 0).toFixed(2)
    );
    const fnr = groups.map(
        key => (group_metrics?.[key]?.false_negative_rate ?? 0).toFixed(2)
    );
    const selectionRate = groups.map(
        key => (group_metrics?.[key]?.selection_rate ?? 0).toFixed(2)
    );
    const count = groups.map(
        key => (group_metrics?.[key]?.count ?? 0).toFixed(2)
    );


    const data = {
        labels: groups,
        datasets: [
            {
                label: 'Accuracy',
                data: accuracy,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                yAxisID: 'y'
            },
            {
                label: 'False Positive Rate',
                data: fpr,
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                yAxisID: 'y'
            },
            {
                label: 'False Negative Rate',
                data: fnr,
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
                yAxisID: 'y'
            },
            {
                label: 'Selection Rate',
                data: selectionRate,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                yAxisID: 'y'
            },
            {
                label: 'Count',
                data: count,
                backgroundColor: 'rgba(255, 159, 64, 0.7)',
                yAxisID: 'y1' // Secondary axis
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: 'white'
                }
            },
            title: {
                display: false,
                text: 'Fairness Metrics by Group',
                color: 'white',
                font: {
                    size: 18
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false
            },
            datalabels: {
                color: 'white',
            }
        },
        scales: {
            x: {
                ticks: {
                    color: 'white'
                },
                title: {
                    display: true,
                    text: 'Groups',
                    color: 'white'
                }
            },
            y: {
                beginAtZero: true,
                max: 1,
                position: 'left',
                ticks: {
                    color: 'white'
                },
                title: {
                    display: true,
                    text: 'Rate-based Metrics',
                    color: 'white'
                }
            },
            y1: {
                beginAtZero: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false
                },
                ticks: {
                    color: 'white'
                },
                title: {
                    display: true,
                    text: 'Count',
                    color: 'white'
                }
            }
        }
    };

    return <Bar data={data} options={options} />;
};

export default GroupMetric;
