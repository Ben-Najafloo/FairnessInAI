import React, { useContext } from "react";
import { ProgressContext } from "../ProgressContext";
import BeatLoader from "react-spinners/BeatLoader";

const Progress = () => {
    const { progress } = useContext(ProgressContext); // Access progress from Context

    const steps = ["Get Started", "Dataset Uploaded", "Analysis", "Review", "Confirmation"];

    return (
        <div className="space-y-4 mt-9">
            <h1>Progress Steps:</h1>
            <ol className="space-y-3 text-sm">
                {steps.map((step, index) => (
                    <li key={index}>
                        <div
                            className={`p-2 border rounded-lg ${index + 1 === progress
                                ? "text-blue-700 bg-blue-100 border-blue-300"
                                : index + 1 < progress
                                    ? "text-green-700 bg-green-50 border-green-300"
                                    : "text-gray-900 bg-gray-100 border-gray-300"
                                }`}
                            role="alert"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium flex items-center">
                                    {index + 1}. {step}
                                    {/* Add Spinner for Current Step */}
                                    {index + 1 === progress && (
                                        <span className="mr-2">
                                            <BeatLoader size={8} color="#3b82f6" className="ml-2" />
                                        </span>
                                    )}

                                </h3>
                                {/* Check Icon for Completed Steps */}
                                {index + 1 < progress && (
                                    <svg
                                        className="w-4 h-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 16 12"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M1 5.917 5.724 10.5 15 1.5"
                                        />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
};

export default Progress;
