import React, { useContext } from 'react';
import Progress from './Progress';
import { ProgressContext } from '../ProgressContext';
import Status from './Status';

const LeftDashboard = () => {
    const { progress } = useContext(ProgressContext);

    return (
        <div className=' w-96 py-5 pl-9'>
            {progress < 2 ? (
                <div className='text-white h-56'>
                    <p className='text-sm'>Experiment by using your own dataset then, determine the <span className='font-bold'>Target Label,</span> and <span className='font-bold'> Sensitive Column</span>  to assess bias and fairness.</p>
                </div>
            ) : (
                <Status />
            )}

            <Progress />

        </div>
    )
}

export default LeftDashboard
