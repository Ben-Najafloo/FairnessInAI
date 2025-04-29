import React from 'react';
import { TbHelpHexagonFilled } from "react-icons/tb";

const ShowHelp = ({ setShowHelpTarget }) => {
    return (
        <div id="deleteModal" tabIndex="-1" ariaHidden="true" className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full">
            <div className="relative p-4 w-full max-w-md h-full md:h-auto">

                <div className="relative p-5 text-center rounded-lg shadow bg-gray-700">
                    <button type="button" onClick={() => { setShowHelpTarget(false) }} className="text-gray-200 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="deleteModal">
                        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                        <span className="sr-only">Do you need guidance to select a proper TARGET VALUE?</span>
                    </button>
                    <TbHelpHexagonFilled className="text-gray-200 w-11 h-11 mb-3.5 mx-auto" />
                    <div className="mb-4 text-gray-200 text-left text-sm">
                        <p className="mb-4">
                            <span className="font-semibold text-green-500">Target Label:  </span> <br />
                            The target label is the main outcome or prediction of interest in your dataset. In this step, select the target label to specify which result you want to analyze for fairness-such as loan approval, hiring decisions, or academic admission.
                        </p>
                        <p className="mb-4">
                            <span className="font-semibold text-green-500">Sensitive Feature(s):  </span> <br />
                            Sensitive features are the attributes by which you want to compare outcomes, such as gender, race, or age. You can select one or two sensitive features. Choosing two sensitive features allows the application to assess fairness across intersections of groups (for example, by both gender and race).
                        </p>
                        <p className="mb-4">
                            What Happens Next: <br />After selecting your target label and sensitive feature(s), you will be prompted to choose the problem type (Regression or Classification) in the following step.
                        </p>
                        <p className="mb-4">
                            Need More Help? <br />Click the Guidance button on the navigation bar at any time for detailed instructions on how to use the application.
                        </p>
                    </div>
                    <div className="flex justify-center items-center space-x-4">
                        <button type="button" onClick={() => { setShowHelpTarget(false) }}
                            className="flex justify-center items-center mt-3 w-full text-green-500 flex hover:text-green-600 border border-green-500 hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded-lg text-sm px-5 py-2 text-center">
                            Ok
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShowHelp
