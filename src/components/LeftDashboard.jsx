import React from 'react';
import Progress from './Progress';
import { FaBalanceScaleLeft } from "react-icons/fa";
import { Link } from 'react-router-dom';

const LeftDashboard = () => {
    return (
        <div className='h-screen w-80 p-7 bg-slate-800'>
            <div className='text-white'>
                <Link to="/">
                    <div className='flex text-2xl mb-7'>
                        <FaBalanceScaleLeft className='w-28 h-16' />
                        <h1 className='ml-5'>Assessing Fairness</h1>
                    </div>
                </Link>
                <p className='text-sm'>Experiment by using your own dataset then, determine the <span className='font-bold'>Label Column, Fairness Metric,</span> and <span className='font-bold'> Sensitive Column</span>  to assess bias and fairness.</p>
            </div>
            <Progress />
        </div>
    )
}

export default LeftDashboard
