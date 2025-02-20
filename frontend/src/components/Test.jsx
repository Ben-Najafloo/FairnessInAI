import React from 'react'

const Test = () => {
    return (
        <div>


            <div className="items-center justify-center">
                <h3 class="mb-5 text-xl font-medium text-gray-900 dark:text-white">Choose the Problem Type:</h3>
                <ul class="grid w-full gap-4 md:grid-cols-2">

                    <li>
                        <input type="checkbox" id="regression" value="regression" class="hidden peer" />
                        <label for="regression" class="inline-flex items-center justify-between text-gray-200 w-full pt-2 px-5 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-green-400 hover:text-gray-600  peer-checked:text-green-400 hover:bg-gray-50 ">
                            <div class="block">
                                <div className='flex'>

                                    <div class="w-full ml-4">
                                        <div class="text-xl mb-3 font-semibold">Regression</div>

                                    </div>
                                </div>

                            </div>
                        </label>
                    </li>
                    <li>
                        <input type="checkbox" id="angular-option" value="classification" class="hidden peer" />
                        <label for="angular-option" class="inline-flex items-center justify-between text-gray-200 w-full pt-2 px-5 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-green-400 hover:text-gray-600  peer-checked:text-green-400 hover:bg-gray-50 ">
                            <div class="block">
                                <div className='flex'>

                                    <div class="w-full ml-4">
                                        <div class="text-xl mb-3 font-semibold">Classification</div>

                                    </div>
                                </div>

                            </div>
                        </label>
                    </li>
                    <li>
                        <input type="checkbox" id="regression" value="regression" class="hidden peer" />
                        <label for="regression" class="inline-flex items-center justify-between text-gray-200 w-full pt-2 px-5 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-green-400 hover:text-gray-600  peer-checked:text-green-400 hover:bg-gray-50 ">
                            <div class="block">
                                <div className='flex'>

                                    <div class="w-full ml-4">
                                        <div class="text-xl mb-3 font-semibold">Regression</div>

                                    </div>
                                </div>

                            </div>
                        </label>
                    </li>
                    <li>
                        <input type="checkbox" id="angular-option" value="classification" class="hidden peer" />
                        <label for="angular-option" class="inline-flex items-center justify-between text-gray-200 w-full pt-2 px-5 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-green-400 hover:text-gray-600  peer-checked:text-green-400 hover:bg-gray-50 ">
                            <div class="block">
                                <div className='flex'>

                                    <div class="w-full ml-4">
                                        <div class="text-xl mb-3 font-semibold">Classification</div>

                                    </div>
                                </div>

                            </div>
                        </label>
                    </li>
                </ul>
            </div>

        </div>
    )
}

export default Test
