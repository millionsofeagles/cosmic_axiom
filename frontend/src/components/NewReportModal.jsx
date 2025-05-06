import { useEffect, useState } from "react";

function NewReportModal({ isOpen, onClose, onSubmit, engagement }) {
    const [title, setTitle] = useState("");

    useEffect(() => {
        if (engagement) {
            const start = new Date(engagement.startDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
            setTitle(`${engagement.customer} ${start} Pentest Report`);
        }
    }, [engagement]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(title);
    };

    if (!isOpen || !engagement) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Create Report</h3>
                <form onSubmit={handleSubmit}>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Report Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 mb-4 border border-gray-300 rounded dark:bg-gray-900 dark:text-white dark:border-gray-700"
                        required
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                            Create Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewReportModal;
