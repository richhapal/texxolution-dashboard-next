import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] bg-gradient-to-r from-blue-50 to-indigo-100 px-4">
      <div className="relative mb-8">
        <svg
          className="w-64 h-64 animate-float"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#93C5FD"
            d="M39.5,-65.3C50.2,-55.2,57.1,-42.8,62.6,-29.8C68.1,-16.8,72.2,-3.2,71.3,10.4C70.5,24,64.7,37.6,55.3,48.5C45.9,59.4,32.9,67.6,18.8,71.6C4.7,75.6,-10.5,75.3,-24.1,70.8C-37.8,66.3,-49.9,57.6,-58.5,46.2C-67.1,34.8,-72.3,20.7,-73.5,6.2C-74.7,-8.3,-72,-23.2,-64.6,-35C-57.2,-46.8,-45.1,-55.5,-32.8,-64.6C-20.5,-73.7,-7.9,-83.2,3.8,-88.8C15.6,-94.5,31.2,-96.3,39.5,-65.3Z"
            transform="translate(100 100)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-white">404</span>
        </div>
      </div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Page Not Found
      </h1>
      <p className="text-xl text-gray-600 text-center mb-8 max-w-md">
        {`Oops! The page you're looking for seems to have floated away. Let's
        bring you back to solid ground.`}
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-300 text-center"
        >
          Return Home
        </Link>
        <Link
          href="/contact"
          className="px-6 py-2 border border-blue-600 text-blue-600 font-semibold rounded-md hover:bg-blue-50 transition-colors duration-300 text-center"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
