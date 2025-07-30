import React from 'react'
import { FaArrowRightLong } from "react-icons/fa6";
const NextButton = ({ handleNextStep }) => {
    return (
        <div className="absolute bottom-3 right-3">
            <button type="submit"
                onClick={handleNextStep}
                className="text-white flex hover:text-green-500 border border-white hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded text-base px-7 py-2 text-center">
                <span className='text-sm'>Next</span>
                <FaArrowRightLong className="ml-3 text-lg" />
            </button>
        </div>
    )
}

export default NextButton
