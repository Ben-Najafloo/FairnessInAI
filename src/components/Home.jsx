import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ProgressContext } from "../ProgressContext";
import { IoDocumentTextOutline } from "react-icons/io5";

const Home = () => {
    const { setProgress } = useContext(ProgressContext); // Access `setProgress`

    const handleGetStarted = () => {
        setProgress(2); // Update to Step 2
    };

    return (
        <div>
            <div className="w-full flex flex-col p-7 items-center justify-center m-auto">
                <h1 className="text-6xl mt-52 text-white font-bold">Fairness in AI</h1>
                <p className="text-xl m-5 text-white">
                    Preprocess data, select modeling techniques, and apply fairness metrics to analyze and mitigate bias.
                </p>
                <div className="flex mt-7">
                    <Link to="/document">
                        <button
                            type="button"
                            onClick={handleGetStarted}
                            className="text-green-500 flex hover:text-green-500 border border-green-500 hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        >
                            <IoDocumentTextOutline className='mr-2' />
                            Document
                        </button>
                    </Link>
                    <Link to="/upload">
                        <button
                            type="button"
                            onClick={handleGetStarted}
                            className="text-green-500 flex hover:text-green-500 border border-green-500 hover:bg-black focus:ring-4 focus:outline-none focus:ring-black font-medium rounded-lg text-sm px-5 py-2.5 text-center ml-2"
                        >
                            Get Started
                            <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                            </svg>
                        </button>
                    </Link>

                </div>
            </div>
        </div>
    );
};

export default Home;
