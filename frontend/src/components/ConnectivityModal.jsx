import { useState } from "react";
import { X, Wifi, Terminal, FileText, Upload } from "lucide-react";

function ConnectivityModal({ isOpen, onClose, onAdd }) {
    const [scanType, setScanType] = useState("nmap");
    const [title, setTitle] = useState("Network Connectivity Tests");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await onAdd({
                type: "connectivity",
                title: title || `${scanType.toUpperCase()} Scan Results`,
                content: content || "",
                scanType: scanType
            });

            // Reset form
            setTitle("Network Connectivity Tests");
            setContent("");
            setScanType("nmap");
            onClose();
        } catch (error) {
            console.error("Error adding connectivity section:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadTemplate = () => {
        switch (scanType) {
            case "nmap":
                setContent(`# Nmap Scan Results

## Command Used:
\`\`\`bash
nmap -sV -sC -p- -oA scan_results [TARGET_IP]
\`\`\`

## Open Ports:
PORT     STATE  SERVICE  VERSION
22/tcp   open   ssh      OpenSSH 8.2p1
80/tcp   open   http     Apache httpd 2.4.41
443/tcp  open   ssl/http Apache httpd 2.4.41
3306/tcp open   mysql    MySQL 5.7.32

## Service Details:
[Add detailed service enumeration results here]

## Notable Findings:
- [List any interesting findings from the scan]
`);
                break;
            case "masscan":
                setContent(`# Masscan Results

## Command Used:
\`\`\`bash
masscan -p1-65535 --rate=1000 -oL scan.txt [TARGET_IP/RANGE]
\`\`\`

## Discovered Ports:
Discovered open port 22/tcp on [IP]
Discovered open port 80/tcp on [IP]
Discovered open port 443/tcp on [IP]
Discovered open port 8080/tcp on [IP]

## Follow-up Enumeration:
[Add results from detailed service enumeration]

## Summary:
- Total hosts scanned: [NUMBER]
- Live hosts found: [NUMBER]
- Total open ports: [NUMBER]
`);
                break;
            case "custom":
                setContent(`# Custom Connectivity Test Results

## Test Methodology:
[Describe the testing approach used]

## Tools Used:
- [List tools and versions]

## Target Information:
- IP Range: [IP_RANGE]
- Domains: [DOMAINS]
- Test Date: ${new Date().toISOString().split('T')[0]}

## Results:
[Document your findings here]

## Recommendations:
[Any recommendations based on findings]
`);
                break;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" onClick={onClose} />
                
                <div className="inline-block w-full max-w-2xl px-6 py-4 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Wifi className="w-5 h-5 text-green-600" />
                            Add Connectivity Test Results
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Scan Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Scan Type
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setScanType("nmap")}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        scanType === "nmap"
                                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                                    }`}
                                >
                                    <Terminal className="w-5 h-5 mx-auto mb-1 text-green-600" />
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Nmap</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setScanType("masscan")}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        scanType === "masscan"
                                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                                    }`}
                                >
                                    <Terminal className="w-5 h-5 mx-auto mb-1 text-green-600" />
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Masscan</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setScanType("custom")}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        scanType === "custom"
                                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                                    }`}
                                >
                                    <FileText className="w-5 h-5 mx-auto mb-1 text-green-600" />
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Custom</p>
                                </button>
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Section Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., External Network Scan Results"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Scan Results
                                </label>
                                <button
                                    type="button"
                                    onClick={loadTemplate}
                                    className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-1"
                                >
                                    <Upload className="w-3 h-3" />
                                    Load Template
                                </button>
                            </div>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={12}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 font-mono text-sm"
                                placeholder="Paste your scan results here..."
                                required
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Tip: Use the "Load Template" button to get a formatted template for your scan type
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !content.trim()}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Adding..." : "Add Connectivity Section"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ConnectivityModal;