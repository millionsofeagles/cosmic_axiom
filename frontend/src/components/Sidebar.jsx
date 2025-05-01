import {
    Book, ChevronLeft, ChevronRight,
    FileText,
    Handshake,
    LayoutDashboard,
    Settings,
    Users
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    return (
        <aside
            className={`${
                collapsed ? "w-20" : "w-64"
            } bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 h-screen p-4 flex flex-col transition-all duration-300`}
        >
            {/* Collapse Toggle Button */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={toggleSidebar}
                    className="text-gray-600 dark:text-gray-300 hover:text-indigo-500"
                >
                    {collapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
                </button>
            </div>

            {/* Menu Items */}
            <nav className="flex flex-col gap-6">
                <Link to="/dashboard" className="flex items-center gap-4 hover:text-indigo-500">
                    <LayoutDashboard size={20} />
                    {!collapsed && <span>Dashboard</span>}
                </Link>

                <Link to="/reports" className="flex items-center gap-4 hover:text-indigo-500">
                    <FileText size={20} />
                    {!collapsed && <span>Reports</span>}
                </Link>

                <Link to="/findings" className="flex items-center gap-4 hover:text-indigo-500">
                    <Book size={20} />
                    {!collapsed && <span>Findings</span>}
                </Link>

                <Link to="/engagements" className="flex items-center gap-4 hover:text-indigo-500">
                    <Users size={20} />
                    {!collapsed && <span>Engagements</span>}
                </Link>

                <Link to="/customers" className="flex items-center gap-4 hover:text-indigo-500">
                    <Handshake size={20} />
                    {!collapsed && <span>Customers</span>}
                </Link>

                <Link to="/admin" className="flex items-center gap-4 hover:text-indigo-500">
                    <Settings size={20} />
                    {!collapsed && <span>System Admin</span>}
                </Link>
            </nav>
        </aside>
    );
};

export default Sidebar;
