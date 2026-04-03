import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
        <p>Last updated: April 2026</p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">What we collect</h2>
        <p>When you use our skills assessment tool, we process the text you provide to extract skills and generate career matches. We do not require an account to use this tool.</p>
        <p>If you create an account, we store your email address and any profile information you provide.</p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">How we use your data</h2>
        <ul>
          <li>To provide skills analysis and career matching</li>
          <li>To show you relevant job opportunities</li>
          <li>To improve our matching algorithms (anonymised data only)</li>
          <li>To communicate with you about your account (if registered)</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Your data is never shared</h2>
        <p>We never share your personal data or CV content with employers without your explicit consent. Your skills assessment results are private to you.</p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Third-party services</h2>
        <p>We use Supabase for data storage, Vercel for hosting, and the Anthropic API for AI processing. Job listings are sourced from Adzuna, Reed, and Jooble. We use Google Analytics for anonymous usage statistics.</p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Your rights</h2>
        <p>Under UK GDPR, you have the right to access, correct, or delete your personal data. Contact us at hello@matchmyskillset.com to exercise these rights.</p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Cookies</h2>
        <p>We use essential cookies for authentication and analytics cookies (Google Analytics) to understand how our site is used. You can disable analytics cookies in your browser settings.</p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Contact</h2>
        <p>For any privacy queries, contact us at hello@matchmyskillset.com.</p>
      </div>
    </div>
  );
}
