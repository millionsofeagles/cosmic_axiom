import { useEffect, useState } from "react";

const DarkModeToggle = () => {
    const [isDark, setIsDark] = useState(() => 
        localStorage.getItem("theme") === "dark"
    );

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded"
        >
            {isDark ? "Light Mode" : "Dark Mode"}
        </button>
    );
};

export default DarkModeToggle;
