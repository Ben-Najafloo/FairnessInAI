import React from 'react';
import LeftDashboard from './LeftDashboard';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (

        <div className="flex">
            <div className="flex-none w-80 h-screen bg-slate-300">
                <LeftDashboard />
            </div>
            <div className="grow h-screen bg-gradient-to-b from-gray-500 to-gray-900">
                <Outlet />
            </div>
        </div>
    )
}

export default Layout
