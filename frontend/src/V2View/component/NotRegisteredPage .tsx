import { useNavigate } from "react-router-dom";

const NotRegisteredPage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
            <h1 className="text-6xl font-extrabold text-red-600 dark:text-red-500 drop-shadow-lg animate-[pulse_0.5s_ease-in-out_infinite]">
                ⚠ Warning
            </h1>
            <h2 className="mt-4 text-2xl font-semibold text-red-500 dark:text-red-400">Email Not Registered</h2>
            <p className="mt-2 text-gray-700 dark:text-gray-300 text-center max-w-md">
                Your email is not registered in our system. Please contact your administrator for assistance.
            </p>
            <button
                onClick={handleLogout}
                className="mt-5 rounded-lg bg-red-500 px-6 py-2 text-white font-medium transition-all duration-300 hover:bg-red-600 hover:shadow-md dark:bg-red-600 dark:hover:bg-red-700"
            >
                Return to Login
            </button>
        </div>

    );
};

export default NotRegisteredPage;
