import React, { useRef, useEffect } from 'react';
import { IoIosInformationCircle } from "react-icons/io";

const AskHelp = ({ fileName, setHelpPopUpTarget, handleTargetHelp }) => {

    const timeoutId = useRef(null);
    useEffect(() => {
        timeoutId.current = setTimeout(() => {
            if (!fileName) {
                setHelpPopUpTarget(true);
            }
        }, 6000);
        return () => {
            if (timeoutId.current) {
                clearTimeout(timeoutId.current);
            }
        };
    }, [fileName]);

    return (
        <div id="deleteModal" tabIndex="-1" ariaHidden="true" className="overflow-y-auto overflow-x-hidden fixed top-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full">
            <div className="relative p-4 w-full max-w-md h-full md:h-auto">

                <div className="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                    <button type="button" onClick={() => { setHelpPopUpTarget(false) }} className="text-gray-200 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="deleteModal">
                        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                        <span className="sr-only">Do you need guidance to select a proper TARGET VALUE?</span>
                    </button>
                    <IoIosInformationCircle className="text-gray-200 w-11 h-11 mb-3.5 mx-auto" />
                    <p className="mb-5 text-gray-200">Would you like some help choosing an appropriate <br /> TARGET LABLE?</p>
                    <div className="flex justify-center items-center space-x-4">
                        <button type="submit" onClick={handleTargetHelp} className="text-green-500 flex hover:text-green-500 border border-green-500 hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded-lg text-base px-5 py-2 text-center">
                            Yes, I need
                        </button>
                        <button type="button" onClick={() => { setHelpPopUpTarget(false) }} className="text-white flex hover:text-white border border-white hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded-lg text-base px-5 py-2 text-center">
                            No, I am fine
                        </button>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default AskHelp
