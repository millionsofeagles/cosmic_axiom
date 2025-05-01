import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserManagement from "../components/admin/UserManagement";
import DashboardLayout from "../layouts/DashboardLayout";

const tabs = ["Users", "Sessions", "System Health", "Audit Log", "Settings"];

const SystemAdmin = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Users");
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

    }, [navigate]);

    const renderTabContent = () => {
        switch (activeTab) {
            case "Users":
                return <UserManagement/>
            case "Sessions":
                return <div className="text-sm text-gray-300">Active Sessions overview coming soon...</div>;
            case "System Health":
                return <div className="text-sm text-gray-300">System Health checks coming soon...</div>;
            case "Audit Log":
                return <div className="text-sm text-gray-300">Audit log entries will be displayed here.</div>;
            case "Settings":
                return <div className="text-sm text-gray-300">System-wide settings configuration coming soon.</div>;
            default:
                return null;
        }
    };

    return (
        <DashboardLayout>
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">System Administration</h2>
                <div className="flex gap-4 mb-6 border-b border-gray-700 pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`text-sm px-3 py-1 border-b-2 transition font-medium ${
                                activeTab === tab
                                    ? "border-indigo-500 text-indigo-500"
                                    : "border-transparent text-gray-400 hover:text-gray-300"
                            }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-gray-800 rounded-lg p-6 shadow-inner">
                    {renderTabContent()}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SystemAdmin;
