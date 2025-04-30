import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/" replace />;
    }

    try {
        const decoded = jwtDecode(token);
        const now = Math.floor(Date.now() / 1000);

        if (decoded.exp < now) {
            // Token is expired
            localStorage.removeItem("token");
            return <Navigate to="/login" replace />;
        }

        return children;
    } catch (err) {
        // Invalid token
        localStorage.removeItem("token");
        return <Navigate to="/login" replace />;
    }
};

export default PrivateRoute;
