import React from 'react'
import Nav from './Nav';
import { useState } from 'react';
import { MdDeveloperMode, MdVideoCameraFront } from "react-icons/md";

import { GiFilmProjector } from "react-icons/gi";
import { RiPresentationFill } from "react-icons/ri";
import { PiStudentFill } from "react-icons/pi";
import { SiInstructure } from "react-icons/si";

import * as data from '../document/data.json';

const Document = () => {
    const [aboutContent, setAboutContent] = useState('select the Tab');
    const [skillLevel, setSkillLevel] = useState();
    const [skilltitle, setSkillTitle] = useState();
    const [skillInfo, setSkillInfo] = useState(false);
    const [skillDescription, setSkillDescription] = useState();

    const { aboutMe } = data;
    const { description } = aboutMe[0];

    const handleAboutTopic = (topic) => {
        setAboutContent(topic);
    };

    const handleSkillInfo = (level, title, description) => {
        setSkillLevel(level);
        setSkillTitle(title);
        setSkillDescription(description);
        setSkillInfo(true);
    }

    return (
        <div className=" bg-gradient-to-b from-gray-500 to-gray-900">
            <Nav className="h-1/10 flex" />
            <div className="flex h-[603px] overflow-auto w-full mt-2">

                <div className="flex h-full pl-4 w-1/4">
                    <div className="rounded w-full bg-white text-sm/6 shadow-lg ring-1 ring-gray-900">
                        <div className="p-2">
                            <div className="group relative flex gap-x-3 rounded-lg hover:bg-gray-50">
                                <div className="mt-1 flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                                    <RiPresentationFill className="size-6 text-gray-600 group-hover:text-indigo-600" />
                                </div>
                                <div className="pt-4">
                                    <button onClick={() => handleAboutTopic('introduction')} className="font-semibold text-gray-900 group-hover:text-indigo-600">
                                        Introduction
                                        <span className="absolute inset-0"></span>
                                    </button>
                                </div>
                            </div>
                            <div className="group relative flex gap-x-3 rounded-lg hover:bg-gray-50">
                                <div className="mt-1 flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                                    <SiInstructure className="size-6 text-gray-600 group-hover:text-indigo-600" />
                                </div>
                                <div className="pt-4">
                                    <button onClick={() => handleAboutTopic('process')} className="font-semibold text-gray-900 group-hover:text-indigo-600">
                                        User Guide
                                        <span className="absolute inset-0"></span>
                                    </button>
                                </div>
                            </div>
                            <div className="group relative flex gap-x-3 rounded-lg hover:bg-gray-50">
                                <div className="mt-1 flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                                    <PiStudentFill className="size-6 text-gray-600 group-hover:text-indigo-600" />
                                </div>
                                <div className="pt-4">
                                    <button onClick={() => handleAboutTopic('section-3')} className="font-semibold text-gray-900 group-hover:text-indigo-600">
                                        Section-3
                                        <span className="absolute inset-0"></span>
                                    </button>

                                </div>
                            </div>
                            <div className="group relative flex gap-x-3 rounded-lg hover:bg-gray-50">
                                <div className="mt-1 flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                                    <MdDeveloperMode className="size-6 text-gray-600 group-hover:text-indigo-600" />
                                </div>
                                <div className="pt-4">
                                    <button onClick={() => handleAboutTopic('section-4')} className="font-semibold text-gray-900 group-hover:text-indigo-600">
                                        Section-4
                                        <span className="absolute inset-0"></span>
                                    </button>

                                </div>
                            </div>
                            <div className="group relative flex gap-x-3 rounded-lg hover:bg-gray-50">
                                <div className="mt-1 flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                                    <GiFilmProjector className="size-6 text-gray-600 group-hover:text-indigo-600" />
                                </div>
                                <div className="pt-4">
                                    <button onClick={() => handleAboutTopic('section-5')} className="font-semibold text-gray-900 group-hover:text-indigo-600">
                                        Section-5
                                        <span className="absolute inset-0"></span>
                                    </button>

                                </div>
                            </div>
                            <div className="group relative flex gap-x-3 rounded-lg hover:bg-gray-50">
                                <div className="mt-1 flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                                    <MdVideoCameraFront className="size-6 text-gray-600 group-hover:text-indigo-600" />
                                </div>
                                <div className="pt-4">
                                    <button onClick={() => handleAboutTopic('section-6')} className="font-semibold text-gray-900 group-hover:text-indigo-600">
                                        Section-6
                                        <span className="absolute inset-0"></span>
                                    </button>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Introduction */}
                {aboutContent === 'introduction' && (
                    <div className="flex px-4 w-3/4">
                        <div className="rounded w-full bg-white text-sm/6 shadow-lg ring-1 ring-gray-900/5  h-[603px] overflow-auto">
                            <div className="p-4">
                                <div className=" py-4">
                                    <div className="w-full m-3  px-4">
                                        {description.map((item, index) => (
                                            <><p key={index} className="text-base  text-gray-900 dark:text-black">{item}</p><br /></>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* process */}
                {aboutContent === 'process' && (
                    <div className="flex px-4 w-3/4">
                        <div className="rounded w-full bg-white text-sm/6 shadow-lg ring-1 ring-gray-900/5  h-[603px] overflow-auto">
                            <div className="p-4 ">
                                <div className=" py-4 m-3 px-4">
                                    <h1 className="mb-2 text-xl font-semibold text-gray-900">Fairness Assessment Process</h1>

                                    <div className="step ">
                                        <h2 className="mb-2 text-lg font-semibold text-gray-900">Step 1: Data Upload</h2>
                                        <ul className="space-y-1 text-gray-700 list-disc list-inside">
                                            <li>Upload dataset (CSV, JSON formats supported)</li>
                                            <li>Select target variable</li>
                                            <li>Choose sensitive attributes for fairness analysis</li>
                                        </ul>
                                    </div>

                                    <div className="step">
                                        <h2 className="mb-2 text-lg font-semibold text-gray-900">Step 2: Data Processing</h2>
                                        <ul className="space-y-1 text-gray-700 list-disc list-inside">
                                            <li>Handles missing values</li>
                                            <li>Balances class distribution</li>
                                            <li>Encodes categorical variables</li>
                                        </ul>
                                    </div>

                                    <div className="step">
                                        <h2 className="mb-2 text-lg font-semibold text-gray-900">Step 3: Model Selection & Training</h2>
                                        <ul className="space-y-1 text-gray-700 list-disc list-inside">
                                            <li><strong>Automatic Mode:</strong> The tool selects the best model</li>
                                            <li><strong>Manual Mode:</strong> Users can choose from classifiers like Logistic Regression, Random Forest, SVM, etc.</li>
                                            <li>Evaluation metrics: Accuracy, F1-score, Precision, Recall</li>
                                        </ul>
                                    </div>

                                    <div className="step">
                                        <h2 className="mb-2 text-lg font-semibold text-gray-900">Step 4: Fairness Metrics Calculation</h2>
                                        <ul className="space-y-1 text-gray-700 list-disc list-inside">
                                            <li><strong>Demographic Parity:</strong> Measures fairness by checking if different groups receive positive outcomes at similar rates.</li>
                                            <li><strong>Equalized Odds:</strong> Ensures similar true positive and false positive rates across groups.</li>
                                            <li><strong>Disparate Impact:</strong> Compares decision-making impact across groups.</li>
                                        </ul>
                                    </div>

                                    <div className="step">
                                        <h2 className="mb-2 text-lg font-semibold text-gray-900">Step 5: Results & Visualization</h2>
                                        <ul className="space-y-1 text-gray-700 list-disc list-inside">
                                            <li>Displays fairness metrics using bar charts and dashboards</li>
                                            <li>Provides insights into potential bias</li>
                                            <li>Suggests mitigation strategies</li>
                                        </ul>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {/* section-3 */}
                {aboutContent === 'section-3' && (
                    <div className="flex px-4 w-3/4">
                        <div className="rounded w-full bg-white text-sm/6 shadow-lg ring-1 ring-gray-900/5  h-[603px] overflow-auto">
                            <div className="p-4">
                                <div class="bg-white py-4 m-3  px-4">
                                    <div>
                                        Section-3
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {/* section-4 */}
                {aboutContent === 'section-4' && (
                    <div className="flex px-4 w-3/4">
                        <div className="rounded w-full bg-gray-200 text-sm/6 shadow-lg ring-1 ring-gray-900/5  h-[603px] overflow-auto">
                            <div className="p-4">
                                <div class=" py-4 m-3  px-4">
                                    Section-4

                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {/* section-5 */}
                {aboutContent === 'section-5' && (
                    <div className="flex px-4 w-3/4">
                        <div className="rounded w-full bg-gray-200 text-sm/6 shadow-lg ring-1 ring-gray-900/5  h-[603px] overflow-auto">
                            <div className="p-4">
                                <div class=" py-4 m-3  px-4">
                                    Section-5

                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {/* section-6 */}
                {aboutContent === 'section-6' && (
                    <div className="flex px-4 w-3/4">
                        <div className="rounded w-full bg-gray-200 text-sm/6 shadow-lg ring-1 ring-gray-900/5  h-[603px] overflow-auto">
                            <div className="p-4">
                                <div class=" py-4 m-3  px-4">
                                    Section-6

                                </div>

                            </div>
                        </div>
                    </div>
                )}

            </div >


        </div>
    )
}

export default Document
