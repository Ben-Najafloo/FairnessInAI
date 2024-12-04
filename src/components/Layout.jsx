import React from 'react';
import LeftDashboard from './LeftDashboard';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        // <div className='flex bg-gradient-to-r from-slate-500 to-slate-800'>
        //     <div className="" >

        //     </div>

        //     <div className="h-screen group py-8 antialiased dark:bg-gray-900 md:py-16">

        //     </div>
        // </div>

        <div class="flex">
            <div class="flex-none w-80 h-screen bg-slate-300">
                <LeftDashboard />
            </div>
            <div class="grow h-screen bg-slate-600">
                <Outlet />
            </div>
        </div>
    )
}

export default Layout
