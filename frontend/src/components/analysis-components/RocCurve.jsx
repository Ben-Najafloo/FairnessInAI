import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Title
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

const RocCurve = ({ roc_curve }) => {
    if (!roc_curve || !roc_curve.fpr || !roc_curve.tpr) return null;

    const { fpr, tpr } = roc_curve;

    const fprRounded = fpr.map(v => parseFloat(v.toFixed(1)));
    const tprRounded = tpr.map(v => parseFloat(v.toFixed(1)));


    const data = {
        labels: fprRounded,
        datasets: [
            {
                label: 'ROC Curve',
                data: fprRounded.map((f, i) => ({ x: f, y: tprRounded[i] })),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                fill: false,
                pointRadius: 4
            },
            {
                label: 'Random Classifier (baseline)',
                data: fprRounded.map(f => ({ x: f, y: f })),
                borderColor: 'rgba(200, 200, 200, 0.5)',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: false,
                text: 'ROC Curve',
                color: 'white',
                font: {
                    size: 18
                }
            },
            legend: {
                labels: {
                    color: 'white'
                }
            },
            tooltip: {
                mode: 'nearest',
                intersect: false
            },
            datalabels: {
                color: 'white',
            }
        },
        scales: {
            x: {
                type: 'linear',
                min: 0,
                max: 1,
                ticks: {
                    color: 'white'
                },
                title: {
                    display: true,
                    text: 'False Positive Rate (FPR)',
                    color: 'white'
                }
            },
            y: {
                min: 0,
                max: 1,
                ticks: {
                    color: 'white'
                },
                title: {
                    display: true,
                    text: 'True Positive Rate (TPR)',
                    color: 'white'
                }
            }
        }
    };

    return <Line data={data} options={options} />;
};

export default RocCurve;
