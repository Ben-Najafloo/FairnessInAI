import React, { useContext, useRef, useEffect } from 'react';
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
import { ProgressContext } from '../../ProgressContext';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const DisparityMetricsChart = ({ disparity_metrics }) => {
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

    if (!disparity_metrics) return null;



    const labels = [
        'FN Rate Disparity',
        'FP Rate Disparity',
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
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
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
                align: 'end',
                formatter: function (value) {
                    // Format the value to two decimal places
                    return value.toFixed(2);
                }
            }
        },
        elements: {
            bar: {
                barThickness: 5,
            },
        },
        maintainAspectRatio: false,
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

    return (
        <div className="w-full h-[350px] relative">
            <Bar key={closeSidebar ? 'collapsed' : 'expanded'} ref={chartRef} data={data} options={options} />
        </div>
    );
};

export default DisparityMetricsChart;
