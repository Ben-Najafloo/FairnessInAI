import React, { useContext } from 'react';
import Progress from './Progress';
import { ProgressContext } from '../ProgressContext';

const LeftDashboard = () => {
    const { progress, setProgress } = useContext(ProgressContext);

    const goToHome = () => {
        setProgress(0);
    }

    return (
        <div className=' w-96 p-5 pl-9'>
            {progress > 0 && (
                <>
                    <div className='text-white h-24 mb-11'>
                        <p className='text-sm'>Experiment by using your own dataset then, determine the <span className='font-bold'>Target Label,</span> and <span className='font-bold'> Sensitive Column</span>  to assess bias and fairness.</p>
                    </div>
                    <Progress />
                </>
            )}
        </div>
    )
}

export default LeftDashboard
