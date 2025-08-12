import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const questions = [
    "What’s your role?",
    "How big is your team?",
    "What’s your main goal?"
];

export default function Test() {
    const [step, setStep] = useState(0);

    const next = () => setStep((prev) => Math.min(prev + 1, questions.length - 1));
    const prev = () => setStep((prev) => Math.max(prev - 1, 0));

    return (
        <div className="container">
            <AnimatePresence mode="wait">
                <motion.div
                    className="w-96 h-56 bg-white text-black"
                    key={step}
                    initial={{ x: 200, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -200, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                    <h2>{questions[step]}</h2>
                    <button onClick={prev} disabled={step === 0}>Back</button>
                    <button onClick={next} disabled={step === questions.length - 1}>Next</button>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
