import { useEffect, useState } from "react";
import findingsTestData from "../../test_data/findingsData";

function FindingForm({ onSubmit }) {
    const [mode, setMode] = useState("select");
    const [form, setForm] = useState({
        title: '',
        description: '',
        risk: '',
        recommendation: '',
        affectedSystems: '',
        proofImages: []
    });
    const [selectedFindingId, setSelectedFindingId] = useState("");

    useEffect(() => {
        if (mode === "select" && selectedFindingId) {
            const finding = findingsTestData.find(f => f.id === parseInt(selectedFindingId));
            if (finding) {
                setForm({
                    title: finding.title,
                    description: finding.description,
                    risk: finding.severity,
                    recommendation: '',
                    affectedSystems: '',
                    proofImages: []
                });
            }
        }
    }, [selectedFindingId, mode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleFileChange = async (e) => {
        const files = e.target.files;
        const newImages = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (event) => {
                newImages.push(event.target.result);
                if (newImages.length === files.length) {
                    setForm((prev) => ({
                        ...prev,
                        proofImages: [...prev.proofImages, ...newImages]
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const processedFinding = {
            ...form,
            affectedSystems: form.affectedSystems
                .split(',')
                .map((sys) => sys.trim())
                .filter(Boolean)
        };
        onSubmit(processedFinding);

        // Reset after submit
        setSelectedFindingId("");
        setForm({ title: '', description: '', risk: '', recommendation: '', affectedSystems: '', proofImages: [] });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            {/* Mode Switcher */}
            <div className="flex gap-4 mb-4">
                <button
                    type="button"
                    onClick={() => setMode("select")}
                    className={`px-4 py-2 rounded border ${
                        mode === "select"
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                >
                    Select Existing
                </button>
                <button
                    type="button"
                    onClick={() => setMode("create")}
                    className={`px-4 py-2 rounded border ${
                        mode === "create"
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                >
                    Create New
                </button>
            </div>

            {/* Select Existing */}
            {mode === "select" && (
                <div className="space-y-4">
                    <select
                        value={selectedFindingId}
                        onChange={(e) => setSelectedFindingId(e.target.value)}
                        className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                    >
                        <option value="">Select a Finding...</option>
                        {findingsTestData.map((finding) => (
                            <option key={finding.id} value={finding.id}>
                                {finding.title} ({finding.severity})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Create New */}
            {mode === "create" && (
                <div className="space-y-4">
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Finding Title"
                        required
                        className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Finding Description"
                        rows="3"
                        required
                        className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                        name="risk"
                        value={form.risk}
                        onChange={handleChange}
                        placeholder="Risk Level (e.g., High, Medium, Low)"
                        required
                        className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <textarea
                        name="recommendation"
                        value={form.recommendation}
                        onChange={handleChange}
                        placeholder="Recommendation"
                        rows="2"
                        required
                        className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
            )}

            {/* Affected Systems */}
            <div className="space-y-2">
                <label className="block text-sm text-gray-700 dark:text-gray-300">
                    Affected Systems (comma-separated)
                </label>
                <input
                    name="affectedSystems"
                    value={form.affectedSystems}
                    onChange={handleChange}
                    placeholder="e.g. 10.0.0.1, server.domain.com"
                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
            </div>

            {/* Upload Proof */}
            <div className="space-y-2">
                <label className="block text-sm text-gray-700 dark:text-gray-300">
                    Upload Proof Screenshots (optional)
                </label>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-700 dark:text-gray-300"
                />
            </div>

            {/* Submit */}
            <button
                type="submit"
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded transition"
            >
                Add Finding
            </button>
        </form>
    );
}

export default FindingForm;
