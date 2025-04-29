import React from 'react';
import { FaArrowRightLong, FaArrowLeftLong } from "react-icons/fa6";
import regImg from '../../img/reg2.png';
import claImg from '../../img/class2.png';
const ProblemTypeCo = ({ problemType, problemErrorMessage, setProblemTypeColumn, problemTypeColumn, handleSubmit, backToSensitiveColumn }) => {
    return (
        <div className="mx-auto md:pt-4 items-center justify-between md:pr-11 md:pl-11 pt-11 w-ful h-full">
            {problemType && (

                <div className="flex relative w-ful h-full pb-9 flex-col items-center justify-center bg-gray-700 text-white">
                    {problemErrorMessage && (
                        <p className="mb-2 text-red-600">
                            {problemErrorMessage}
                        </p>
                    )}
                    <div className="items-center justify-center md:pr-11 md:pl-11">
                        <h3 className="mb-3 text-base text-gray-900 dark:text-white">Choose the Problem Type:</h3>
                        <ul className="grid w-full gap-6 md:grid-cols-2">
                            <li>
                                <input
                                    type="radio"
                                    id="regression"
                                    onChange={(e) => setProblemTypeColumn(e.target.value)}
                                    value="regression"
                                    checked={problemTypeColumn === "regression"}
                                    className="hidden peer" />
                                <label for="regression" className="inline-flex items-center justify-between text-gray-200 w-full p-5 border border-gray-200 rounded-lg cursor-pointer peer-checked:border-green-400 hover:text-gray-600  peer-checked:text-green-400 hover:bg-gray-50 peer-checked:bg-gray-800">
                                    <div className="block">
                                        <div className='flex'>
                                            <img src={regImg} className="mb-2 w-20 h-20" alt="ax" />
                                            <div className="w-full ml-4">
                                                <div className="text-xl mb-3 font-semibold">Regression</div>
                                                <p className="text-sm">Predicts a continuous output based on input features.</p>
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </li>
                            <li>
                                <input
                                    type="radio"
                                    id="classification"
                                    onChange={(e) => setProblemTypeColumn(e.target.value)}
                                    value="classification"
                                    checked={problemTypeColumn === "classification"}
                                    className="hidden peer" />
                                <label for="classification" className="inline-flex items-center justify-between text-gray-200 w-full p-5 border border-gray-200 rounded-lg cursor-pointer peer-checked:border-green-400 hover:text-gray-600  peer-checked:text-green-400 hover:bg-gray-50 peer-checked:bg-gray-800">
                                    <div className="block">
                                        <div className='flex'>
                                            <img src={claImg} className="mb-2 w-20 h-20" alt="ax" />
                                            <div className="w-full ml-4">
                                                <div className="text-xl mb-3 font-semibold">Classification</div>
                                                <p className="text-sm">Categorizes inputs into discrete classes or labels.</p>
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </li>
                        </ul>
                    </div>
                    <div className="absolute bottom-3 right-3">
                        <button type="submit"
                            onClick={handleSubmit}
                            className="text-white flex hover:text-green-500 border border-white hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded text-base px-7 py-2 text-center">
                            <span className='text-sm'>Next</span>
                            <FaArrowRightLong className="ml-3 text-lg" />
                        </button>
                    </div>

                    <div className="absolute bottom-3 left-3">
                        <button type="submit"
                            onClick={backToSensitiveColumn}
                            className="text-white flex hover:text-green-500 border border-white hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded text-base px-7 py-2 text-center">
                            <FaArrowLeftLong className="mr-3 text-lg " />
                            <span className='text-sm'>Back</span>
                        </button>
                    </div>

                </div>

            )}
        </div>
    )
}

export default ProblemTypeCo
