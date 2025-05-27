import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SettingsPanel from "../components/admin/SettingsPanel";
import SystemHealth from "../components/admin/SystemHealth";
import UserManagement from "../components/admin/UserManagement";
import ApiKeyManager from "../components/admin/ApiKeyManager";
import DashboardLayout from "../layouts/DashboardLayout";

const tabs = ["Users", "API Keys", "Sessions", "System Health", "Audit Log", "Settings"];

const SystemAdmin = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Users");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    const renderTabContent = () => {
        switch (activeTab) {
            case "Users":
                return <UserManagement />;
            case "API Keys":
                return <ApiKeyManager />;
            case "Sessions":
                return <div className="text-sm text-gray-700 dark:text-gray-300">Active Sessions overview coming soon...</div>;
            case "System Health":
                return <SystemHealth />;
            case "Audit Log":
                return <div className="text-sm text-gray-700 dark:text-gray-300">Audit log entries will be displayed here.</div>;
            case "Settings":
                return <SettingsPanel />;
            default:
                return null;
        }
    };

    return (
        <DashboardLayout>
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">System Administration</h2>
                <div className="flex gap-4 mb-6 border-b border-gray-300 dark:border-gray-700 pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`text-sm px-3 py-1 border-b-2 font-medium transition-all ${
                                activeTab === tab
                                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                            }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-inner border border-gray-200 dark:border-gray-700">
                    {renderTabContent()}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SystemAdmin;
