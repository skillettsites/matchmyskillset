import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Page not found</h1>
      <p className="text-gray-500 mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/"
          className="bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/discover"
          className="border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Discover Careers
        </Link>
      </div>
    </div>
  );
}
