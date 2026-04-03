import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="font-bold text-lg mb-4">
              <span className="text-gray-900">Match</span>
              <span className="text-indigo-600">My</span>
              <span className="text-gray-900">Skills</span>
            </div>
            <p className="text-sm text-gray-500">
              AI-Assisted. Human-Led.
              <br />
              Discover careers you never knew existed.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-3">
              Platform
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/discover"
                  className="text-sm text-gray-500 hover:text-indigo-600"
                >
                  Discover Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs"
                  className="text-sm text-gray-500 hover:text-indigo-600"
                >
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-500 hover:text-indigo-600"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-3">
              For Employers
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about#employers"
                  className="text-sm text-gray-500 hover:text-indigo-600"
                >
                  Post a Job
                </Link>
              </li>
              <li>
                <Link
                  href="/about#how-it-works"
                  className="text-sm text-gray-500 hover:text-indigo-600"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-500 hover:text-indigo-600"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-500 hover:text-indigo-600"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} MatchMySkillset. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
