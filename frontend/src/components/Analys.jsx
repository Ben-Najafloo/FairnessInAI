import React, { useContext, useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ProgressContext } from '../ProgressContext';
import { FaCheck, FaGoogleDrive } from "react-icons/fa";
import { FaRegShareFromSquare, FaFilePdf } from "react-icons/fa6";
import { MdEmail, MdOutlineQrCodeScanner } from "react-icons/md";
import { IoMdHome } from "react-icons/io";


// download
import jsPDF from "jspdf";
import html2canvas from "html2canvas";



const Analys = () => {
    const location = useLocation();
    const { result } = location.state || {}; // Get result from location state
    const { setProgress } = useContext(ProgressContext);
    const [isShared, setIsShared] = useState(false);
    // setProgress(6);

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress(6);
        }, 3000);

        return () => clearTimeout(timer);
    }, [setProgress]);

    const handleSharing = () => {
        setProgress(7);
        setIsShared(!isShared);
    };

    const handlePDFDownload = async () => {
        const input = document.getElementById("analysis-section"); // The section to capture as PDF
        if (!input) {
            console.error("Element to capture not found");
            return;
        }

        try {
            // Use html2canvas to capture the DOM element
            const canvas = await html2canvas(input);
            const imgData = canvas.toDataURL("image/png");

            // Initialize jsPDF
            const pdf = new jsPDF("p", "mm", "a4");

            // Calculate image dimensions for the PDF
            const imgWidth = 190; // Adjust as needed
            const pageHeight = 297; // A4 page height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            // Add image to the PDF and handle page breaks
            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Save the PDF
            pdf.save("Analysis_Report.pdf");
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };



    if (!result) {
        return <p>No results available. Please start training.</p>;
    }

    // Extract the evaluation object and message from the result
    const { evaluation, message } = result;
    const {
        fairness_score,
        performance_score,
        fairness_metric,
        performance_metric,
        non_numeric_columns,
        algorithm,
        sensitive_label_mapping,
        sensitive_test
    } = evaluation || {};

    return (
        <div className='pl-5 pt-5 pr-5 relative '>

            <div class="lg:flex lg:items-center lg:justify-between">
                <div class="min-w-0 flex-1">
                    <div class="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                        <div class="mt-2 flex items-center text-sm text-gray-200">
                            <svg class="mr-1.5 size-5 shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" />
                            </svg>
                            Closing on January 9, 2020
                        </div>
                    </div>
                </div>
                <div class="mt-5 flex lg:ml-4 lg:mt-0">
                    <span class="hidden sm:block">
                        <Link to="/"
                            className="text-blue-500 flex border-2 border-blue-500 hover:bg-primary-800 hover:ring-4 hover:ring-primary-300 font-medium rounded text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 hover:outline-none dark:hover:ring-primary-800">
                            <IoMdHome className="mr-3 text-xl" />Home
                        </Link>
                    </span>

                    <span class="ml-3 hidden sm:block">
                        <button onClick={handleSharing} className="text-red-500 flex border-2 border-red-500 hover:bg-primary-800 hover:ring-4 hover:ring-primary-300 font-medium rounded text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 hover:outline-none dark:hover:ring-primary-800">
                            Get Report <FaRegShareFromSquare className="ml-3 text-xl" />
                        </button>
                    </span>

                </div>
            </div>
            {/* sharing report */}
            {isShared && (
                <div id="deleteModal" className="absolute top-15 right-10 justify-center items-center">
                    <div className="relative p-4 w-full max-w-md h-full md:h-auto">

                        <div className="relative text-center bg-white rounded-lg shadow dark:bg-gray-700 sm:p-5">
                            <button type="button" onClick={handleSharing} className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="deleteModal">
                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                <span className="sr-only">Close modal</span>
                            </button>

                            <table className='text-left'>
                                <tr>
                                    <td className='pb-2 w-36 text-white'>Download</td>
                                    <td className='pb-2 w-52 text-white'>Share</td>
                                </tr>
                                <tr>
                                    <td className='w-36'>
                                        <button onClick={handlePDFDownload}
                                            className="text-white  text-center hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-full border-2 border-white text-sm px-3.5 py-3.5  dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                                            <FaFilePdf className="text-xl" />
                                        </button>
                                    </td>
                                    <td className='w-52 flex'>
                                        <button
                                            className="text-white  text-center hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-full border-2 border-white text-sm px-3.5 py-3.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                                            <FaGoogleDrive className="text-xl" />
                                        </button>
                                        <button
                                            className="text-white ml-4  text-center hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-full border-2 border-white text-sm px-3.5 py-3.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                                            <MdEmail className="text-xl" />
                                        </button>
                                        <button
                                            className="text-white ml-4  text-center hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-full border-2 border-white text-sm px-3.5 py-3.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                                            <MdOutlineQrCodeScanner className="text-xl" />
                                        </button>
                                    </td>
                                </tr>
                            </table>



                        </div>
                    </div>
                </div>
            )}

            <div className='h-[610px] max-h-[630px] overflow-auto mt-4'>
                <section id="analysis-section" className="px-24 pt-7 pb-2 antialiased mb-7 bg-gray-800 py-4 rounded-lg">

                    <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">

                        <div className="mb-4 flex items-center justify-between gap-4 md:mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Training Result</h2>

                            <div className="flex text-green-500 items-center text-base font-medium text-primary-700 hover:underline dark:text-primary-500">
                                <span className='mr-2'>{message}</span>
                                <FaCheck />
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            <div className="items-center rounded border border-green-400 bg-white px-4 py-2  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                <span className="text-base mr-4 text-gray-900 dark:text-white">Fairness Score:</span>
                                <span className="text-sm text-gray-900 dark:text-white">{fairness_score !== undefined ? fairness_score : 'N/A'}</span>
                            </div>
                            <div className="items-center rounded border border-green-400 bg-white px-4 py-2  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                <span className="text-base mr-4 text-gray-900 dark:text-white">Performance Score:</span>
                                <span className="text-sm text-gray-900 dark:text-white">{performance_score !== undefined ? performance_score : 'N/A'}</span>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-2">
                            <div className="items-center rounded border border-green-400 bg-white px-4 py-2  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                <span className="text-base text-gray-900 dark:text-white">Fairness Metric:</span><br />
                                <span className="text-sm text-gray-900 dark:text-white">{fairness_metric !== undefined ? fairness_metric : 'N/A'}</span>
                            </div>
                            <div className="items-center rounded border border-green-400 bg-white px-4 py-2  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                <span className="text-base text-gray-900 dark:text-white">Performance Metric:</span><br />
                                <span className="text-sm text-gray-900 dark:text-white"> {performance_metric !== undefined ? performance_metric : 'N/A'}</span>
                            </div>
                            <div className="items-center rounded border border-green-400 bg-white px-4 py-2  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                <span className="text-base text-gray-900 dark:text-white">Algorithm:</span><br />
                                <span className="text-sm text-gray-900 dark:text-white">{algorithm}</span>
                            </div>
                        </div>
                        <div className="grid gap-4 grid-cols-1 mt-2">
                            <div className="items-center rounded border border-green-400 bg-white px-4 py-2  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                <span className="text-base text-gray-900 dark:text-white">One-hot encoded columns:</span><br />
                                <span className="text-sm text-gray-900 dark:text-white">{non_numeric_columns && non_numeric_columns.length > 0 ? non_numeric_columns.join(' , ') : 'N/A'} </span>
                            </div>
                        </div>

                        {/* oooooo <br />oooooo <br />oooooo <br />oooooo <br />oooooo <br />oooooo <br />oooooo <br />oooooo <br /> */}
                    </div>

                    <div className="grid gap-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 mt-2 ">
                        <div className="items-center rounded border border-green-400 bg-white px-4 py-2  dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                            <span className="text-base  text-gray-900 dark:text-white">Sensitive Label Mapping:</span><br />
                            <ul>
                                {Object.entries(sensitive_label_mapping).map(([label, value]) => (
                                    <li key={label}
                                        className="text-sm text-gray-900 dark:text-white">
                                        <span>{label}:</span> <span className='ml-3'>{value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>


                        <span className="text-base text-gray-900 dark:text-white mt-5">Sensitive Test Values:</span>
                        <div className="flex items-center justify-center ">
                            <div className="container mx-auto p-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-2">
                                    {sensitive_test.map((value, index) => (
                                        <div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={index}
                                            className="px-1 py-1 border rounded shadow-md bg-white hover:shadow-lg transition duration-200"
                                        >
                                            <div className="text-sm mb-1 text-gray-700">Test Result {index + 1}: {value}</div>

                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </section>

            </div>
        </div>
    );
};










export default Analys;
