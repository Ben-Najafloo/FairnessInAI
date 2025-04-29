import React, { useContext, useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { ProgressContext } from '../../ProgressContext';
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
    const { closeSidebar } = useContext(ProgressContext);
    const chartRef = useRef();
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            if (chartRef.current?.chart) {
                console.log('Destroy and rebuild chart');
                const chart = chartRef.current.chart;
                chart.destroy();  // Force destroy
                chart.update();   // Re-initialize with new dimensions
            }
        });

        const container = chartRef.current?.canvas?.parentNode;
        if (container) {
            resizeObserver.observe(container);
        }

        return () => {
            if (container) {
                resizeObserver.unobserve(container);
            }
        };
    }, []);

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
        maintainAspectRatio: false,
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


    return (
        <div className="w-full h-[420px] relative">
            <Line key={closeSidebar ? 'collapsed' : 'expanded'} ref={chartRef} data={data} options={options} />
        </div>
    );
};

export default RocCurve;
