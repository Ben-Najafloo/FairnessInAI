import React from 'react';
// import LeftDashboard from './LeftDashboard';
import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import LeftDashboard from './LeftDashboard'

const Layout = () => {
    return (

        // <div className="flex">
        //     <div className="flex-none w-80 h-screen bg-slate-300">
        //         {/* <LeftDashboard /> */}
        //     </div>
        //     <div className="grow h-screen bg-gradient-to-b from-gray-500 to-gray-900">

        //     </div>
        // </div>

        <div className="bg-gradient-to-b from-gray-500 to-gray-900 h-screen">
            <Nav />
            <main className="flex">
                <LeftDashboard />
                <div className="mx-auto grow px-4 py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default Layout
