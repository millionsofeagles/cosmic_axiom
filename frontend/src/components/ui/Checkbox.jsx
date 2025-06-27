import { Check } from "lucide-react";

const Checkbox = ({ checked, onChange, className = "", ...props }) => {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="sr-only peer"
                {...props}
            />
            <div className={`
                w-4 h-4 
                bg-white 
                border-2 border-gray-300 
                rounded 
                peer-focus:ring-2 peer-focus:ring-indigo-500 peer-focus:ring-offset-1
                peer-checked:bg-indigo-600 peer-checked:border-indigo-600
                transition-all duration-200
                ${className}
            `}>
                <Check 
                    size={12} 
                    className={`
                        absolute top-0.5 left-0.5
                        text-white
                        transition-opacity duration-200
                        ${checked ? 'opacity-100' : 'opacity-0'}
                    `}
                    strokeWidth={3}
                />
            </div>
        </label>
    );
};

export default Checkbox;