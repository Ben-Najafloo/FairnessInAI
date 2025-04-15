// import React, { useContext } from "react";
// import { ProgressContext } from "../ProgressContext";
// import BeatLoader from "react-spinners/BeatLoader";

// const Progress = () => {
//     const { progress } = useContext(ProgressContext); // Access progress from Context

//     const steps = ["Get Started", "Data Uploaded", "Target Label Selection", "Sensitive feature Selection", "Problem Type Selection", "Analysis", "Training", "Review", "Confirmation"];

//     return (
//         <div className="space-y-2">
//             <h1 className="text-white">Progress Steps:</h1>
//             <ol className="space-y-2 text-sm">
//                 {steps.map((step, index) => (
//                     <li key={index}>
//                         <div
//                             className={`p-2 border rounded ${index + 1 === progress
//                                 ? "text-blue-700 bg-blue-100 border-blue-300"
//                                 : index + 1 < progress
//                                     ? "text-green-200 border-green-200"
//                                     : "text-white border-white"
//                                 }`}
//                             role="alert"
//                         >
//                             <div className="flex items-center justify-between">
//                                 <h3 className="font-medium flex items-center">
//                                     {index + 1}. {step}
//                                     {/* Add Spinner for Current Step */}
//                                     {index + 1 === progress && (
//                                         <span className="mr-2">
//                                             <BeatLoader size={8} color="#3b82f6" className="ml-2" />
//                                         </span>
//                                     )}

//                                 </h3>
//                                 {/* Check Icon for Completed Steps */}
//                                 {index + 1 < progress && (
//                                     <svg
//                                         className="w-4 h-4"
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         fill="none"
//                                         viewBox="0 0 16 12"
//                                     >
//                                         <path
//                                             stroke="currentColor"
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             strokeWidth="2"
//                                             d="M1 5.917 5.724 10.5 15 1.5"
//                                         />
//                                     </svg>
//                                 )}
//                             </div>
//                         </div>
//                     </li>
//                 ))}
//             </ol>
//         </div>
//     );
// };

// export default Progress;

import React, { useContext } from "react";
import { ProgressContext } from "../ProgressContext";
import BeatLoader from "react-spinners/BeatLoader";
import { CheckCircle2, Circle } from 'lucide-react';

const Progress = () => {
    const { progress } = useContext(ProgressContext); // Access progress from Context
    const steps = ["Get Started", "Data Uploaded", "Problem Specifications", "Analysis", "Training", "Review", "Confirmation"];

    return (
        <div className="space-y-2">
            <h1 className="text-white mb-5">Progress Steps:</h1>
            <div className="space-y-1">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                        <div className="flex flex-col items-center">
                            {index < progress - 1 ? (
                                <CheckCircle2 className="text-green-500 h-5 w-5" />
                            ) : index === progress - 1 ? (
                                <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                    {index + 1}
                                </div>
                            ) : (
                                <Circle className="text-gray-300 h-5 w-5" />
                            )}

                            {index < steps.length - 1 && (
                                <div className={`w-0.5 h-6 ${index < progress - 1 ? "bg-green-100" : "bg-gray-200"}`} />
                            )}
                        </div>

                        <div className={`text-sm pb-1 ${index === progress - 1 ? "font-medium text-blue-600" : index < progress - 1 ? "text-gray-100" : "text-gray-400"}`}>
                            {step}
                            {index === progress - 1 && (
                                <div className="inline-flex ml-2">
                                    <BeatLoader size={5} color="#3b82f6" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Progress

