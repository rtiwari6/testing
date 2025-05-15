'use client'
import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Radar } from 'react-chartjs-2'
import confetti from 'canvas-confetti'
import {
    Chart,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    CategoryScale,
    Tooltip,
    Legend
} from 'chart.js'

// Register ChartJS components
Chart.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    CategoryScale,
    Tooltip,
    Legend
)

export default function FeedbackVisualization({ feedback }: { feedback: Feedback }) {
    const [activeTab, setActiveTab] = useState(0)
    const [progress, setProgress] = useState(0)
    const radarRef = useRef(null)
    const hasCelebratedRef = useRef(false)

    // Animation for progress bar
    useEffect(() => {
        setProgress(0)
        const target = feedback.categoryScores[activeTab].score
        const interval = setInterval(() => {
            setProgress(prev => Math.min(prev + 2, target))
        }, 30)
        return () => clearInterval(interval)
    }, [activeTab, feedback])

    useEffect(() => {
        if (!hasCelebratedRef.current && feedback.categoryScores.some(c => c.score >= 50)) {
            hasCelebratedRef.current = true
            confetti({ particleCount: 150, spread: 200, origin: { y: 0.6 }, zIndex: 9999 })
        }
    }, [feedback])

    // Enhanced hover animation for radar chart
    useEffect(() => {
        const chart = radarRef.current
        if (!chart) return

        const handleHover = (e) => {
            const points = chart.getElementsAtEventForMode(
                e,
                'nearest',
                { intersect: true },
                false
            )

            if (points.length) {
                const canvas = e.target
                canvas.style.transform = 'scale(1.02)'
                canvas.style.transition = 'transform 0.3s ease'
            } else {
                const canvas = e.target
                canvas.style.transform = 'scale(1)'
            }
        }

        const canvas = chart.canvas
        canvas.addEventListener('mousemove', handleHover)

        return () => {
            canvas.removeEventListener('mousemove', handleHover)
        }
    }, [])

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">

            {/* Tab Selector - Mobile Responsive */}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                {feedback.categoryScores.map((category, i) => (
                    <motion.button
                        key={i}
                        onClick={() => setActiveTab(i)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`px-3 py-1 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm ${
                            activeTab === i
                                ? 'bg-success-100 text-dark-100 font-bold'
                                : 'bg-dark-200 text-light-100 hover:bg-dark-300'
                        }`}
                    >
                        {category.name}
                    </motion.button>
                ))}
            </div>

            {/* Radar Chart Container with Hover Effect */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-dark-300/50 p-4 sm:p-6 rounded-xl border border-primary-200/20 hover:shadow-lg transition-shadow"
            >
                <div className="h-[300px] sm:h-[400px]">
                    <Radar
                        ref={radarRef}
                        data={{
                            labels: feedback.categoryScores.map(c => c.name),
                            datasets: [
                                {
                                    label: 'Your Performance',
                                    data: feedback.categoryScores.map(c => c.score),
                                    backgroundColor: 'rgba(74, 222, 128, 0.3)',
                                    borderColor: '#4ADE80',
                                    borderWidth: 2,
                                    pointBackgroundColor: '#4ADE80',
                                    pointBorderColor: '#fff',
                                    pointRadius: 4,
                                    pointHoverRadius: 8,
                                    pointHoverBorderWidth: 2,
                                    tension: 0.3
                                }
                            ]
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                r: {
                                    angleLines: {
                                        display: true,
                                        color: 'rgba(255, 255, 255, 0.1)'
                                    },
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                    },
                                    suggestedMin: 0,
                                    suggestedMax: 100,
                                    pointLabels: {
                                        color: '#D6E0FF',
                                        font: {
                                            size: window.innerWidth < 640 ? 10 : 14,
                                            weight: '500'
                                        },
                                        padding: window.innerWidth < 640 ? 10 : 15
                                    },
                                    ticks: {
                                        display: false,
                                        stepSize: 20
                                    }
                                }
                            },
                            plugins: {
                                legend: {
                                    display: false
                                },
                                tooltip: {
                                    enabled: true,
                                    backgroundColor: '#1A1C20',
                                    titleColor: '#D6E0FF',
                                    bodyColor: '#D6E0FF',
                                    borderColor: '#4B4D4F',
                                    borderWidth: 1,
                                    padding: 12,
                                    usePointStyle: true,
                                    callbacks: {
                                        label: (context) => `${context.raw}/100`
                                    }
                                }
                            },
                            onHover: (e) => {
                                const chart = radarRef.current
                                if (chart) {
                                    const canvas = chart.canvas
                                    const points = chart.getElementsAtEventForMode(
                                        e,
                                        'nearest',
                                        { intersect: true },
                                        false
                                    )
                                    canvas.style.cursor = points.length ? 'pointer' : 'default'
                                }
                            }
                        }}
                    />
                </div>
            </motion.div>

            {/* Score Progress */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
            >
                <div className="flex justify-between text-light-100 text-sm sm:text-base">
                    <span className="font-medium">Skill Level</span>
                    <span className="font-bold">{progress}/100</span>
                </div>
                <div className="h-2 sm:h-3 bg-dark-300 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#4ADE80] to-[#3B82F6]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                </div>
            </motion.div>

            {/* Feedback Content with Staggered Animations */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                {/* Evaluation Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                >
                    <h3 className="text-lg sm:text-xl font-semibold text-primary-100">Evaluation</h3>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-light-100 leading-relaxed text-sm sm:text-base"
                    >
                        {feedback.categoryScores[activeTab].comment}
                    </motion.p>
                </motion.div>

                {/* Recommendations with Staggered Animation */}
                <motion.div className="space-y-3">
                    <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg sm:text-xl font-semibold text-primary-100"
                    >
                        Recommendations
                    </motion.h3>
                    <motion.ul className="space-y-2 sm:space-y-3">
                        {feedback.areasForImprovement.map((item, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    delay: 0.5 + (i * 0.15),
                                    type: "spring",
                                    stiffness: 100
                                }}
                                className="flex items-start gap-2 sm:gap-3"
                            >
                                <motion.div
                                    className="size-1.5 mt-2 sm:mt-2.5 bg-success-100 rounded-full flex-shrink-0"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5 + (i * 0.15) + 0.1 }}
                                />
                                <motion.span
                                    className="text-light-100 text-sm sm:text-base"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 + (i * 0.15) + 0.2 }}
                                >
                                    {item}
                                </motion.span>
                            </motion.li>
                        ))}
                    </motion.ul>
                </motion.div>
            </motion.div>
        </div>
    )
}
