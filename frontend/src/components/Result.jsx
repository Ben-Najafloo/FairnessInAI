import React, { useState } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import { useSpring, animated } from 'react-spring';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const Result = () => {
    const [dataPoints, setDataPoints] = useState([
        { y: 20, label: "Airfare" },
        { y: 24, label: "Food & Drinks" },
        { y: 20, label: "Accommodation" },
        { y: 14, label: "Transportation" },
        { y: 12, label: "Activities" },
        { y: 10, label: "Misc" }
    ]);

    // Animation properties using react-spring
    const props = useSpring({
        opacity: 1,
        from: { opacity: 0 },
        config: { duration: 2000 }
    });

    const options = {
        animationEnabled: true,
        exportEnabled: true,
        theme: "light2",
        title: {
            text: "Trip Expenses"
        },
        data: [{
            type: "pie",
            indexLabelFontSize: 16,
            startAngle: -90,
            dataPoints
        }]
    };

    return (
        <div className='pt-7 pl-16'>
            <animated.div style={props}>
                <CanvasJSChart options={options} />
            </animated.div>
        </div>
    );
};

export default Result;