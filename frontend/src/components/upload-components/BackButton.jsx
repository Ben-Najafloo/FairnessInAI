import React from 'react'
import { FaArrowLeftLong } from "react-icons/fa6";
const BackButton = ({ handleBackStep }) => {
    return (
        <div className="absolute bottom-3 left-3">
            <button type="submit"
                onClick={handleBackStep}
                className="text-white flex hover:text-green-500 border border-white hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded text-base px-7 py-2 text-center">
                <FaArrowLeftLong className="mr-3 text-lg " />
                <span className='text-sm'>Back</span>
            </button>
        </div>
    )
}

export default BackButton
