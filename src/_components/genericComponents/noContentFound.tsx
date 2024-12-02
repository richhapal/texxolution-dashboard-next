import { SearchX } from "lucide-react";

interface NoContentFoundProps {
  message?: string;
}

export default function NoContentFound({
  message = "No content found",
}: NoContentFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        <SearchX className="w-16 h-16 text-gray-400" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">{message}</h2>
      <p className="text-gray-500 mb-4">
        {`We couldn't find any content matching your criteria.`}
      </p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </button>
    </div>
  );
}
