import React from 'react';
// import LeftDashboard from './LeftDashboard';
import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import LeftDashboard from './LeftDashboard'

const Layout = () => {
    return (

        <div className="bg-gradient-to-b from-gray-500 to-gray-900 h-screen">
            <Nav className="h-1/5" />
            <main className="md:flex h-4/5">
                <LeftDashboard />
                <div className="w-full h-full mx-auto px-4 pt-6 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default Layout
