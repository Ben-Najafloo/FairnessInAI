import React from 'react';
import LeftDashboard from './LeftDashboard'
import { Outlet } from 'react-router-dom';
import img from '../home2.jpg';

const Layout = () => {
    return (
        <div className='flex bg-gradient-to-r from-slate-500 to-slate-800'>
            <LeftDashboard />
            <Outlet />
        </div>
    )
}

export default Layout
// style={{ backgroundImage: `url(${img})`, backgroundSize: "cover" }}