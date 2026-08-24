"use client";

import { useState, useTransition } from "react";
import { addCommentAction } from "@/lib/actions";
import { MessageCircle, Send, User } from "lucide-react";

interface Comment {
  _id: string;
  name: string;
  content: string;
  createdAt: string;
}

interface Props {
  blogId: string;
  initialComments: Comment[];
}

export default function CommentSection({ blogId, initialComments }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await addCommentAction(blogId, name, text);
      if (result.success) {
        const newComment: Comment = {
          _id: Date.now().toString(),
          name: name.trim(),
          content: text.trim(),
          createdAt: new Date().toISOString(),
        };
        setComments((prev) => [newComment, ...prev]);
        setName("");
        setText("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(result.error || "Failed to post comment.");
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9] grid place-items-center">
          <MessageCircle className="size-5" />
        </div>
        <div>
          <h3 className="font-bold text-[#0f172a] text-lg">
            Comments ({comments.length})
          </h3>
          <p className="text-xs text-slate-400">Share your thoughts below</p>
        </div>
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-3">
        {success && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
            ✓ Your comment has been posted!
          </div>
        )}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors"
        />
        <textarea
          required
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your comment..."
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors resize-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0ea5e9] text-white text-sm font-semibold hover:bg-[#0284c7] transition-colors disabled:opacity-60"
        >
          <Send className="size-4" />
          {isPending ? "Posting..." : "Post Comment"}
        </button>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6">
            No comments yet. Be the first to comment!
          </p>
        )}
        {comments.map((c) => (
          <div key={c._id} className="flex gap-3 p-4 rounded-xl bg-[#f8fafc] border border-[var(--border)]">
            <div className="size-9 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] grid place-items-center shrink-0">
              <User className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-[#0f172a]">{c.name}</span>
                <span className="text-xs text-slate-400">
                  {new Date(c.createdAt).toLocaleDateString("en-PK", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
