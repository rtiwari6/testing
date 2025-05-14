'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Radar } from 'react-chartjs-2'
import { Chart, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js'

// Register ChartJS components
Chart.register(RadialLinearScale, PointElement, LineElement, Filler)

export default function FeedbackVisualization({ feedback }: { feedback: Feedback }) {
    const [activeTab, setActiveTab] = useState(0)
    const [progress, setProgress] = useState(0)

    // Animation for progress bar
    useEffect(() => {
        setProgress(0)
        const target = feedback.categoryScores[activeTab].score
        const interval = setInterval(() => {
            setProgress(prev => Math.min(prev + 2, target))
        }, 30)
        return () => clearInterval(interval)
    }, [activeTab])

    // Radar chart config
    const radarData = {
        labels: feedback.categoryScores.map(c => c.name),
        datasets: [{
            data: feedback.categoryScores.map(c => c.score),
            backgroundColor: 'rgba(202, 197, 254, 0.2)',
            borderColor: '#CAC5FE',
            borderWidth: 2
        }]
    }

    return (
        <div className="space-y-8">
            {/* Tab Selector */}
            <div className="flex flex-wrap gap-2 justify-center">
                {feedback.categoryScores.map((category, i) => (
                    <motion.button
                        key={i}
                        onClick={() => setActiveTab(i)}
                        whileHover={{ scale: 1.05 }}
                        className={`px-4 py-2 rounded-full text-sm ${
                            activeTab === i
                                ? 'bg-primary-200 text-dark-100'
                                : 'bg-dark-200 text-primary-200'
                        }`}
                    >
                        {category.name}
                    </motion.button>
                ))}
            </div>

            {/* Radar Chart */}
            <div className="h-64">
                <Radar
                    data={radarData}
                    options={{
                        scales: {
                            r: {
                                angleLines: { display: false },
                                suggestedMin: 0,
                                suggestedMax: 100,
                                ticks: { display: false }
                            }
                        }
                    }}
                />
            </div>

            {/* Animated Progress Bar */}
            <div>
                <div className="flex justify-between mb-2">
                    <span>Skill Level</span>
                    <span>{progress}/100</span>
                </div>
                <div className="h-3 bg-dark-300 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary-100 to-primary-200"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.7 }}
                    />
                </div>
            </div>

            {/* Animated Feedback */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
            >
                <h3 className="text-xl font-semibold">Evaluation</h3>
                <p className="text-light-100">{feedback.categoryScores[activeTab].comment}</p>

                <h3 className="text-xl font-semibold">Recommendations</h3>
                <ul className="space-y-3">
                    {feedback.areasForImprovement.map((item, i) => (
                        <motion.li
                            key={i}
                            initial={{ x: -20 }}
                            animate={{ x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-2"
                        >
                            <div className="size-1.5 mt-2 bg-primary-200 rounded-full flex-shrink-0" />
                            <span>{item}</span>
                        </motion.li>
                    ))}
                </ul>
            </motion.div>
        </div>
    )
}