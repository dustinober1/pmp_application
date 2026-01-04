import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import {
    getJson,
    getStorageInfo,
    setJson,
} from "@/lib/storage";
import type { FlashcardProgress } from "@/lib/spaced";
import type { PracticeHistory, Streak } from "@/lib/stats";

const Footer = dynamic(
    () => import("@/components/Footer").then((mod) => mod.Footer),
    {
        ssr: false,
        loading: () => <div className="h-20" />,
    },
);

export default function SettingsPage() {
    const [exportStatus, setExportStatus] = useState<{
        type: "idle" | "success" | "error";
        message: string;
    }>({ type: "idle", message: "" });

    const [importStatus, setImportStatus] = useState<{
        type: "idle" | "success" | "error";
        message: string;
    }>({ type: "idle", message: "" });

    const [storageInfo, setStorageInfo] = useState<ReturnType<
        typeof getStorageInfo
    > | null>(null);

    // Load storage info on mount
    useEffect(() => {
        setStorageInfo(getStorageInfo());
    }, []);

    // Export all progress data
    const handleExport = () => {
        try {
            // Collect all PMP data from localStorage
            const exportData = {
                version: 1,
                exportDate: new Date().toISOString(),
                data: {
                    flashcardProgress: getJson<Record<string, FlashcardProgress>>(
                        "flashcard_progress",
                        {},
                    ),
                    practiceHistory: getJson<PracticeHistory>(
                        "practice_history",
                        { attempts: [] },
                    ),
                    streak: getJson<Streak>("streak", {
                        current: 0,
                        longest: 0,
                        lastActiveISO: null,
                    }),
                    version: getJson<number>("version", 1),
                },
            };

            // Create and download the file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `pmp-study-pro-backup-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setExportStatus({
                type: "success",
                message: "Data exported successfully! Check your downloads folder.",
            });

            // Clear success message after 5 seconds
            setTimeout(() => {
                setExportStatus({ type: "idle", message: "" });
            }, 5000);
        } catch (error) {
            setExportStatus({
                type: "error",
                message: `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
        }
    };

    // Import progress data
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const importedData = JSON.parse(content);

                // Validate structure
                if (!importedData.data) {
                    throw new Error("Invalid backup file format");
                }

                // Restore data to localStorage
                if (importedData.data.flashcardProgress) {
                    setJson(
                        "flashcard_progress",
                        importedData.data.flashcardProgress,
                    );
                }
                if (importedData.data.practiceHistory) {
                    setJson("practice_history", importedData.data.practiceHistory);
                }
                if (importedData.data.streak) {
                    setJson("streak", importedData.data.streak);
                }
                if (importedData.data.version) {
                    setJson("version", importedData.data.version);
                }

                setImportStatus({
                    type: "success",
                    message: "Data imported successfully! Refresh to see your progress.",
                });

                // Refresh storage info
                setStorageInfo(getStorageInfo());

                // Clear success message after 5 seconds
                setTimeout(() => {
                    setImportStatus({ type: "idle", message: "" });
                }, 5000);
            } catch (error) {
                setImportStatus({
                    type: "error",
                    message: `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                });
            }
        };

        reader.readAsText(file);
        // Reset file input
        event.target.value = "";
    };

    // Clear all data
    const handleClearData = () => {
        if (
            confirm(
                "Are you sure you want to clear all progress? This action cannot be undone.",
            )
        ) {
            try {
                const { clearAllData } = require("@/lib/storage");
                clearAllData();
                setStorageInfo(getStorageInfo());
                alert("All data has been cleared.");
            } catch (error) {
                alert(`Failed to clear data: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        }
    };

    return (
        <div className="min-h-screen">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold mb-8 text-md-on-surface">
                    Settings
                </h1>

                {/* Data Management Section */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-4 text-md-on-surface">
                        Data Management
                    </h2>
                    <p className="text-md-on-surface-variant mb-6">
                        Export your progress to transfer to another device or browser, or
                        import a backup to restore your data.
                    </p>

                    <div className="grid gap-4">
                        {/* Export Card */}
                        <div className="card p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-2 text-md-on-surface">
                                        Export Progress
                                    </h3>
                                    <p className="text-sm text-md-on-surface-variant mb-4">
                                        Download all your study progress as a JSON file. Use this
                                        to backup your data or transfer to another device/browser.
                                    </p>
                                    {exportStatus.message && (
                                        <div
                                            className={`text-sm p-3 rounded ${exportStatus.type === "success"
                                                ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                                                : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                                                }`}
                                        >
                                            {exportStatus.message}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleExport}
                                    className="btn btn-primary ml-4 whitespace-nowrap"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2 inline"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                        />
                                    </svg>
                                    Export Data
                                </button>
                            </div>
                        </div>

                        {/* Import Card */}
                        <div className="card p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-2 text-md-on-surface">
                                        Import Progress
                                    </h3>
                                    <p className="text-sm text-md-on-surface-variant mb-4">
                                        Upload a backup JSON file to restore your progress. This
                                        will merge with existing data.
                                    </p>
                                    {importStatus.message && (
                                        <div
                                            className={`text-sm p-3 rounded ${importStatus.type === "success"
                                                ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                                                : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                                                }`}
                                        >
                                            {importStatus.message}
                                        </div>
                                    )}
                                </div>
                                <label className="btn btn-outline ml-4 whitespace-nowrap cursor-pointer">
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleImport}
                                        className="hidden"
                                    />
                                    <svg
                                        className="w-4 h-4 mr-2 inline"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                        />
                                    </svg>
                                    Import Data
                                </label>
                            </div>
                        </div>

                        {/* Clear Data Card */}
                        <div className="card p-6 border-l-4 border-red-500">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-2 text-md-on-surface">
                                        Clear All Data
                                    </h3>
                                    <p className="text-sm text-md-on-surface-variant mb-4">
                                        Permanently delete all your progress. This action cannot be
                                        undone.
                                    </p>
                                </div>
                                <button
                                    onClick={handleClearData}
                                    className="btn bg-red-600 hover:bg-red-700 text-white ml-4 whitespace-nowrap"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2 inline"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                    Clear Data
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Storage Info Section */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-4 text-md-on-surface">
                        Storage Information
                    </h2>
                    <div className="card p-6">
                        {storageInfo && (
                            <dl className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm text-md-on-surface-variant">
                                        Items Stored
                                    </dt>
                                    <dd className="text-2xl font-bold text-md-on-surface">
                                        {storageInfo.keys}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-md-on-surface-variant">
                                        Storage Used
                                    </dt>
                                    <dd className="text-2xl font-bold text-md-on-surface">
                                        {(storageInfo.bytesUsed / 1024).toFixed(2)} KB
                                    </dd>
                                </div>
                            </dl>
                        )}
                    </div>
                </section>

                {/* Help Section */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-md-on-surface">
                        Tips & Best Practices
                    </h2>
                    <div className="card p-6 space-y-4">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center text-sm font-semibold">
                                1
                            </div>
                            <div>
                                <p className="text-md-on-surface">
                                    <strong>Regular Backups:</strong> Export your progress weekly
                                    or after major study sessions.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center text-sm font-semibold">
                                2
                            </div>
                            <div>
                                <p className="text-md-on-surface">
                                    <strong>Device Transfers:</strong> Export on one device,
                                    then import on another to continue studying.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center text-sm font-semibold">
                                3
                            </div>
                            <div>
                                <p className="text-md-on-surface">
                                    <strong>Browser Compatibility:</strong> Progress is stored in
                                    localStorage, which is browser-specific. Use export/import to
                                    switch between Chrome, Firefox, Safari, etc.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center text-sm font-semibold">
                                4
                            </div>
                            <div>
                                <p className="text-md-on-surface">
                                    <strong>File Storage:</strong> Keep your backup files in a
                                    safe location like cloud storage or external drive.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
}
