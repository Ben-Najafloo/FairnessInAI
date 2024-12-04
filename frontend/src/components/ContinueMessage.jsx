import React from 'react';
import { FaHandPointDown } from "react-icons/fa";


const ContinueMessage = () => {
  return (
    <div className='items-center justify-center mt-5'>
      <h1 className='text-green-600 font-bold'>Perfect!</h1>
      <p>
        Now set the value for

        <span className='italic font-bold'>Label Column, and Sensitive Column</span>
        <br />
        in the below boxes.
        <FaHandPointDown className='inline ml-2 ' />
      </p>
    </div>
  )
}

export default ContinueMessage
