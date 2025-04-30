import DarkModeToggle from "../components/DarkModeToggle";
import Sidebar from "../components/Sidebar";

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-y-auto">
                <header className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    {/* Left side: App Title + Cosmic Icon */}
                    <div className="flex items-center gap-4">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/3212/3212608.png"
                            alt="Cosmic Icon"
                            className="w-10 h-10"
                        />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cosmic Axiom</h1>
                    </div>

                    {/* Right side: DarkMode Toggle + Logout */}
                    <div className="flex items-center gap-4">
                        <DarkModeToggle />
                        <button
                            className="text-2x1 text-red-500 hover:text-red-600 transition"
                        >
                            Logout
                        </button>

                    </div>
                </header>

                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
