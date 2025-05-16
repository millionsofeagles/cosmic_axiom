import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

function Dashboard() {
    const [cves, setCves] = useState([]);
    const [cveError, setCveError] = useState(false);

    useEffect(() => {
        const fetchCVEs = async () => {
            try {
                const res = await fetch("https://cve.circl.lu/api/last");
                if (!res.ok) throw new Error("Failed to fetch CVEs");
                const data = await res.json();
                setCves(data.slice(0, 5));
            } catch (err) {
                console.error("CVE fetch failed:", err);
                setCveError(true);
            }
        };
        fetchCVEs();
    }, []);

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Reports Card */}
                <Link to="/reports" className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-700 transition-transform duration-300">
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Reports</h2>
                    <p className="text-gray-600 dark:text-gray-400">Manage penetration testing reports.</p>
                </Link>

                {/* Findings Card */}
                <Link to="/findings" className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-700 transition-transform duration-300">
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Findings</h2>
                    <p className="text-gray-600 dark:text-gray-400">Reusable vulnerability findings library.</p>
                </Link>

                {/* Engagements Card */}
                <Link to="/engagements" className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-700 transition-transform duration-300">
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Engagements</h2>
                    <p className="text-gray-600 dark:text-gray-400">Manage project scoping and timelines.</p>
                </Link>

                {/* Customers Card */}
                <Link to="/customers" className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-700 transition-transform duration-300">
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Customers</h2>
                    <p className="text-gray-600 dark:text-gray-400">View client information and contacts.</p>
                </Link>
            </div>

            {/* CVE Feed */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent CVEs</h3>
                {cveError ? (
                    <p className="text-sm text-red-500">Unable to fetch latest CVEs at this time.</p>
                ) : (
                    <ul className="space-y-2">
                        {cves.map((cve) => (
                            <li key={cve.id}>
                                <a
                                    href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cve.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-indigo-600 hover:underline"
                                >
                                    {cve.id}: {cve.summary.slice(0, 100)}{cve.summary.length > 100 ? "..." : ""}
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </DashboardLayout>
    );
}

export default Dashboard;
