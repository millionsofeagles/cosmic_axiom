import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const sectionFields = [
    { key: "executiveSummary", label: "Executive Summary" },
    { key: "methodology", label: "Methodology" },
    { key: "toolsAndTechniques", label: "Tools and Techniques" },
    { key: "conclusion", label: "Conclusion" },
];

const SettingsPanel = () => {
    const [template, setTemplate] = useState({});
    const [expanded, setExpanded] = useState({});
    const [saving, setSaving] = useState(false);

    const token = localStorage.getItem("token");

    const fetchTemplate = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_SATELLITE_URL}/reports/default-template`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setTemplate(data);
        } catch (err) {
            console.error("Failed to load template settings", err);
        }
    };

    useEffect(() => {
        fetchTemplate();
    }, []);

    const toggleExpand = (key) => {
        setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChange = (key, value) => {
        if (value.length <= 1000) {
            setTemplate((prev) => ({ ...prev, [key]: value }));
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await fetch(`${import.meta.env.VITE_SATELLITE_URL}/reports/default-template`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(template),
            });
            alert("Template saved.");
        } catch (err) {
            console.error("Failed to save template", err);
            alert("Failed to save. Check console for details.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4 text-gray-800 dark:text-gray-200">
            <h3 className="text-lg font-bold">Default Report Template</h3>

            {sectionFields.map(({ key, label }) => (
                <div key={key} className="border border-gray-300 dark:border-gray-600 rounded">
                    <button
                        onClick={() => toggleExpand(key)}
                        className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                        <span className="font-medium">{label}</span>
                        {expanded[key] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {expanded[key] && (
                        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <textarea
                                className="w-full p-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none"
                                rows={6}
                                maxLength={1000}
                                value={template[key] || ""}
                                onChange={(e) => handleChange(key, e.target.value)}
                            />
                            <div className="text-xs text-right text-gray-400 px-3 pb-2">
                                {template[key]?.length || 0}/1000 characters
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm disabled:opacity-50"
                disabled={saving}
            >
                {saving ? "Saving..." : "Save Template"}
            </button>
        </div>
    );
};

export default SettingsPanel;
