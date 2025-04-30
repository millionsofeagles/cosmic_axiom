import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

function Dashboard() {
    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <p className="text-gray-600 dark:text-gray-400">Manage clients and project scopes.</p>
                </Link>

                {/* Customers Card */}
                <Link to="/customers" className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-700 transition-transform duration-300">
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Engagements</h2>
                    <p className="text-gray-600 dark:text-gray-400">Manage clients and project scopes.</p>
                </Link>
            </div>
        </DashboardLayout>
    );
}

export default Dashboard;
