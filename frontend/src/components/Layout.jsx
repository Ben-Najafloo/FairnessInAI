import React, { useContext } from 'react';
// import LeftDashboard from './LeftDashboard';
import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import LeftDashboard from './LeftDashboard';
import { ProgressContext } from '../ProgressContext';
import { MdArrowForwardIos, MdArrowBackIosNew } from "react-icons/md";


const Layout = () => {
    const { closeSidebar, setCloseSidebar } = useContext(ProgressContext);
    const handleCloseSideBar = () => {
        setCloseSidebar(!closeSidebar)
    }

    return (
        <div className="bg-gradient-to-b from-gray-500 to-gray-900 h-screen">
            <Nav className="h-1/5" />

            <main className="md:flex h-4/5">
                {!closeSidebar && (
                    <LeftDashboard />
                )}
                <div className='h-full flex items-center'>
                    <button onClick={handleCloseSideBar} className="text-white hover:text-gray-800 inline-flex items-center text-2xl">
                        {closeSidebar ? (
                            <>
                                <MdArrowForwardIos />
                            </>
                        ) : (
                            <>
                                <MdArrowBackIosNew />
                            </>
                        )}
                    </button>
                </div>
                <div className="w-full h-full mt-4 mx-auto sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default Layout
