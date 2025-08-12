import React from 'react'
import { GiHumanTarget } from "react-icons/gi";
import Pagination from './Pagination';
import NextButton from './NextButton';
import BackButton from './BackButton';
const SelectionFrame = ({
    children,
    errorMessage,
    columns,
    fileName,
    handleNextStep,
    handleBackStep,
    itemsPerPage,
    totalPages,
    currentPage,
    setCurrentPage,
    title }) => {
    return (
        <div className="mx-auto md:pt-4 items-center justify-between md:pr-11 md:pl-11 pt-11 w-ful h-full">
            <div className="flex relative w-ful h-full  pb-14 flex-col items-center justify-center  text-white">
                {errorMessage && (
                    <p className="mb-2 text-red-600 absolute top-11">
                        {errorMessage}
                    </p>
                )}

                {/* Display column names if available */}
                {columns.length > 0 && (
                    <div className="items-center justify-center w-full px-4">
                        <div className='mt-3 ml-3'>
                            <p className='absolute top-3 left-3 w-full'>
                                <GiHumanTarget className="w-9 h-9 absolute top-2 right-9" />
                                <span className="text-base text-gray-700 dark:text-white pb-2">
                                    Selected file:
                                    <strong> {fileName}</strong>
                                </span> <br />
                                {title}
                            </p>
                            <div className=" mx-auto mt-3 w-full">

                                {children}

                                {columns.length > itemsPerPage && (
                                    <Pagination
                                        totalPages={totalPages}
                                        currentPage={currentPage}
                                        columns={columns}
                                        setCurrentPage={setCurrentPage} />
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <NextButton handleNextStep={handleNextStep} />

                <BackButton handleBackStep={handleBackStep} />

            </div>
        </div>
    )
}

export default SelectionFrame
