import { useState } from "react";

function ConnectivityForm({ onSubmit }) {
    const [results, setResults] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ results });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <textarea
                value={results}
                onChange={(e) => setResults(e.target.value)}
                placeholder="Paste Nmap, Masscan, Ping Sweep, or Traceroute results here..."
                rows="6"
                required
                className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white whitespace-pre-wrap"
            />
            <button
                type="submit"
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded transition"
            >
                Add Connectivity
            </button>
        </form>
    );
}

export default ConnectivityForm;
