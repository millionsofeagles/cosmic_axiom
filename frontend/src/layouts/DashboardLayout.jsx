import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (err) {
                console.error("Invalid token", err);
                localStorage.removeItem("token");
                navigate("/");
            }
        }
    }, [navigate]);

    const handleLogout = async () => {
        const token = localStorage.getItem("token");
        try {
            await fetch(`${import.meta.env.VITE_SATELLITE_URL}/users/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
        } catch (err) {
            console.warn("Logout request failed:", err);
        }
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-900">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-y-auto">
                {/* White top header with subtle border */}
                <header className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/3212/3212608.png"
                            alt="Cosmic Icon"
                            className="w-10 h-10"
                        />
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                            Cosmic Axiom
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-red-500 hover:text-red-600 transition"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Main content area with gray background */}
                <main className="flex-1 p-8 bg-gray-200 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
