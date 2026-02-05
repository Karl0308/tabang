import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h1 className="text-7xl font-extrabold text-red-500 dark:text-red-400 animate-bounce">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white shadow-md transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Go Home
      </Link>
    </div>
  );
}
