"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import api, { unwrapList } from "@/lib/api";
import type { Post, PostType } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ key: PostType | "all"; label: string }> = [
  { key: "all", label: "الكل" },
  { key: "news", label: "أخبار" },
  { key: "offer", label: "عروض" },
  { key: "winner", label: "فائزون" },
  { key: "tournament", label: "بطولات" },
  { key: "photo", label: "صور" },
];

export default function NewsPage() {
  const [filter, setFilter] = useState<PostType | "all">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["posts", filter],
    queryFn: async () => {
      const { data } = await api.get("/content/posts/", {
        params: {
          is_published: true,
          ...(filter !== "all" ? { post_type: filter } : {}),
        },
      });
      return unwrapList<Post>(data);
    },
  });

  return (
    <div className="container-page py-10 sm:py-14">
      <SectionHeading
        title="الأخبار والعروض"
        description="آخر منشورات عالم السنوكر: أخبار، عروض، وفائزو البطولات."
      />

      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm border transition",
              filter === f.key
                ? "border-[#D4AF37] bg-[rgba(201,162,39,0.15)] text-[#E8D48B]"
                : "border-white/10 text-[var(--muted)]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-[var(--muted)]">جاري التحميل…</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {(data ?? []).map((post) => (
          <GlassCard key={post.id} hover>
            <div className="flex items-center justify-between gap-2 mb-3">
              <Badge tone="green">{post.post_type_display}</Badge>
              <time className="text-xs text-[var(--muted)]">
                {format(new Date(post.published_at), "d MMM yyyy", {
                  locale: ar,
                })}
              </time>
            </div>
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-sm text-[var(--muted)] leading-7 whitespace-pre-wrap">
              {post.body}
            </p>
          </GlassCard>
        ))}
      </div>

      {!isLoading && data?.length === 0 && (
        <GlassCard className="text-center text-[var(--muted)]">
          لا توجد منشورات في هذا التصنيف.
        </GlassCard>
      )}
    </div>
  );
}
