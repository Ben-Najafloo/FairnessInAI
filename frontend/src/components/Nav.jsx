import React, { useContext } from 'react';
import { FaBalanceScaleLeft } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { ProgressContext } from '../ProgressContext';

const Nav = () => {
    const { setProgress } = useContext(ProgressContext);

    const goToHome = () => {
        setProgress(0);
    }
    return (
        <nav class="bg-gray-800">
            <div class="mx-auto max-w-7xl  sm:px-6 lg:px-8">
                <div class="flex py-2 items-center justify-between">

                    <div class="flex items-center text-white">
                        <Link to="/" onClick={goToHome}>
                            <div class="shrink-0">
                                <FaBalanceScaleLeft className='w-24 h-12 ' />
                            </div>
                            <h1 className='text-xl'>Assessing Fairness</h1>
                        </Link>
                        <div class="hidden md:block">
                            <div class="ml-20 flex items-baseline space-x-4">

                                <Link to="/" onClick={goToHome} class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Home</Link>
                                <a href="#" class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Team</a>
                                <a href="#" class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Projects</a>
                                <a href="#" class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Help</a>

                            </div>
                        </div>
                    </div>
                    <div class="hidden md:block">
                        <div class="ml-4 flex items-center md:ml-6">
                            <button type="button" class="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                <span class="absolute -inset-1.5"></span>
                                <span class="sr-only">View notifications</span>
                                <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                </svg>
                            </button>


                            <div class="relative ml-3">
                                <div>
                                    <button type="button" class="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                                        <span class="absolute -inset-1.5"></span>
                                        <span class="sr-only">Open user menu</span>
                                        <img class="size-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </nav>
    )
}

export default Nav
