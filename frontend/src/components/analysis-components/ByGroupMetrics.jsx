import React, { useState, useMemo, useContext, useRef, useEffect } from 'react';
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
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const ByGroupMetrics = ({ byGroupMetrics, metricType = 'false_negative_rate', maxPoints = 100 }) => {
    const [selectedMetric, setSelectedMetric] = useState(metricType);

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




    const chartData = useMemo(() => {
        const dataObj = byGroupMetrics[selectedMetric] || {};
        const groupedData = {};
        let isNumericX = true;

        Object.entries(dataObj).forEach(([key, value]) => {
            const parts = key.replace(/[()']/g, '').split(',').map(s => s.trim());
            if (value === null || value === undefined || parts.length < 2) return;

            const group = parts[0];
            const subGroup = parts[1];
            const parsedX = parseFloat(subGroup);
            if (isNaN(parsedX)) isNumericX = false;

            if (!groupedData[group]) groupedData[group] = [];
            const y = typeof value === 'number' ? Number(value.toFixed(2)) : null;
            groupedData[group].push({ x: isNaN(parsedX) ? subGroup : parsedX, y });
        });

        const allLabels = [...new Set(Object.values(groupedData).flat().map(p => p.x))];

        return {
            labels: isNumericX ? allLabels.sort((a, b) => a - b) : allLabels,
            datasets: Object.entries(groupedData).map(([group, points], index) => ({
                label: group,
                data: points.map(p => ({ x: p.x, y: p.y })),
                borderColor: `hsl(${index * 90}, 70%, 50%)`,
                backgroundColor: `hsl(${index * 90}, 70%, 50%)`,
                tension: 0.3,
                fill: false,
            })),
            isNumericX,
        };
    }, [byGroupMetrics, selectedMetric, maxPoints]);


    return (
        <div className="w-full" style={{ height: '400px' }}>
            <div className="mb-2">
                <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)} className="p-2 border rounded">
                    {Object.keys(byGroupMetrics).map(metric => (
                        <option key={metric} value={metric}>{metric}</option>
                    ))}
                </select>
            </div>
            <div className="w-full h-[400px] relative">
                <Line
                    key={closeSidebar ? 'collapsed' : 'expanded'}
                    ref={chartRef}
                    data={chartData}
                    options={
                        {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: true,
                                    labels: {
                                        color: 'white'
                                    }
                                },
                                datalabels: {
                                    display: false,
                                    color: 'white',
                                },
                            },
                            scales: {
                                x: {
                                    title:
                                    {
                                        display: false,
                                        text: 'Sex',
                                        color: 'white'
                                    },
                                    ticks: {
                                        color: 'white'
                                    },
                                },
                                y: {
                                    title:
                                    {
                                        display: true,
                                        text: selectedMetric,
                                        color: 'white'
                                    },
                                    ticks: {
                                        color: 'white'
                                    },
                                }
                            }
                        }
                    } height={400} />
            </div>
        </div>
    );
};

export default ByGroupMetrics;
