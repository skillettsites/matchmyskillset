import { redirect } from "next/navigation";

// Results used to live here in sessionStorage. They now have their own
// private link (/results/<token>), so old bookmarks go back to the start.
export default function OldResultsPage() {
  redirect("/discover");
}
