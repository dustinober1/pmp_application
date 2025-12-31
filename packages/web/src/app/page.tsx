export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-3xl">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    PMP Study Application
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                    Your comprehensive study platform for the 2026 PMP certification exam
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-3xl mb-3">📚</div>
                        <h3 className="text-lg font-semibold mb-2">Study Guides</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Comprehensive content organized by PMI domains and tasks
                        </p>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-3xl mb-3">🎴</div>
                        <h3 className="text-lg font-semibold mb-2">Flashcards</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Spaced repetition learning for key concepts and terminology
                        </p>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-3xl mb-3">✅</div>
                        <h3 className="text-lg font-semibold mb-2">Practice Questions</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Exam-style questions with detailed explanations
                        </p>
                    </div>
                </div>

                <div className="mt-12 flex gap-4 justify-center">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Get Started
                    </button>
                    <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        Learn More
                    </button>
                </div>
            </div>
        </main>
    );
}
