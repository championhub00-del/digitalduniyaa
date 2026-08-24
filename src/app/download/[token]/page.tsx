import Link from "next/link";
import { redirect } from "next/navigation";
import { getDownloadUrlAction } from "@/lib/shop-actions";

interface Props {
  params: Promise<{ token: string }>;
}

export const metadata = {
  title: "Download",
  robots: { index: false, follow: false },
};

export default async function DownloadPage({ params }: Props) {
  const { token } = await params;
  const result = await getDownloadUrlAction(token);

  if (!result.success || !result.fileUrl) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl border border-[var(--border)] p-8 shadow-sm">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-[#0f172a] mb-2">Download Not Available</h1>
          <p className="text-sm text-slate-500 mb-6">{result.error || "Invalid or expired link."}</p>
          <Link href="/shop" className="text-[#0ea5e9] font-bold hover:underline">
            Browse Products →
          </Link>
        </div>
      </div>
    );
  }

  redirect(result.fileUrl);
}
