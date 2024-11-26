import React from 'react';
import { FaHandPointRight } from "react-icons/fa";


const ContinueMessage = () => {
  return (
    <div className='items-center justify-center mt-5'>
      <h1 className='text-green-600'>Perfect!</h1>
      <p>
        Now set the value for
        <br />
        <span className='italic font-bold'>Label Column, Fairness Metric, and Sensitive Column</span>
        <br />
        in the next table.
        <FaHandPointRight className='inline ml-2 ' />
      </p>
    </div>
  )
}

export default ContinueMessage
