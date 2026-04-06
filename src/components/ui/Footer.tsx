import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
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
              <li><Link href="/discover" className="text-sm text-gray-500 hover:text-indigo-600">Discover Careers</Link></li>
              <li><Link href="/jobs" className="text-sm text-gray-500 hover:text-indigo-600">Browse Jobs</Link></li>
              <li><Link href="/quiz" className="text-sm text-gray-500 hover:text-indigo-600">Career Quiz</Link></li>
              <li><Link href="/pricing" className="text-sm text-gray-500 hover:text-indigo-600">Pricing</Link></li>
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-indigo-600">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-3">
              Career Change
            </h3>
            <ul className="space-y-2">
              <li><Link href="/career-change-at-30" className="text-sm text-gray-500 hover:text-indigo-600">Career Change at 30</Link></li>
              <li><Link href="/career-change-at-50" className="text-sm text-gray-500 hover:text-indigo-600">Career Change at 50</Link></li>
              <li><Link href="/career-change-no-experience" className="text-sm text-gray-500 hover:text-indigo-600">No Experience</Link></li>
              <li><Link href="/career-change-from-teaching" className="text-sm text-gray-500 hover:text-indigo-600">From Teaching</Link></li>
              <li><Link href="/career-change-from-nursing" className="text-sm text-gray-500 hover:text-indigo-600">From Nursing</Link></li>
              <li><Link href="/how-to-write-a-cv-for-career-change" className="text-sm text-gray-500 hover:text-indigo-600">CV for Career Change</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-3">
              Popular Guides
            </h3>
            <ul className="space-y-2">
              <li><Link href="/jobs-for-introverts" className="text-sm text-gray-500 hover:text-indigo-600">Jobs for Introverts</Link></li>
              <li><Link href="/work-from-home-jobs" className="text-sm text-gray-500 hover:text-indigo-600">Work from Home Jobs</Link></li>
              <li><Link href="/high-paying-jobs-no-degree" className="text-sm text-gray-500 hover:text-indigo-600">High Paying, No Degree</Link></li>
              <li><Link href="/highest-paying-careers-uk" className="text-sm text-gray-500 hover:text-indigo-600">Highest Paying UK</Link></li>
              <li><Link href="/best-side-hustles-uk" className="text-sm text-gray-500 hover:text-indigo-600">Best Side Hustles</Link></li>
              <li><Link href="/what-job-is-right-for-me" className="text-sm text-gray-500 hover:text-indigo-600">What Job Is Right for Me?</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-3">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-indigo-600">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-500 hover:text-indigo-600">Terms of Service</Link></li>
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
