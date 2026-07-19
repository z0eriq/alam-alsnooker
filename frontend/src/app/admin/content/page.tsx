"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Select } from "@/components/ui/Select";
import api, { unwrapList } from "@/lib/api";
import type { Post, PostType } from "@/lib/types";

const emptyPost = {
  title: "",
  body: "",
  post_type: "news" as PostType,
  is_published: true,
  is_featured: false,
};

export default function AdminContentPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyPost);
  const [editing, setEditing] = useState<Post | null>(null);

  const postsQuery = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data } = await api.get("/content/posts/");
      return unwrapList<Post>(data);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { data } = await api.patch(`/content/posts/${editing.id}/`, form);
        return data;
      }
      const { data } = await api.post("/content/posts/", form);
      return data;
    },
    onSuccess: () => {
      toast.success(editing ? "تم تحديث المنشور" : "تم النشر");
      setForm(emptyPost);
      setEditing(null);
      void qc.invalidateQueries({ queryKey: ["admin-posts"] });
      void qc.invalidateQueries({ queryKey: ["posts"] });
      void qc.invalidateQueries({ queryKey: ["home-posts"] });
    },
    onError: () => toast.error("تعذر حفظ المنشور"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/content/posts/${id}/`);
    },
    onSuccess: () => {
      toast.success("تم الحذف");
      void qc.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: () => toast.error("تعذر الحذف"),
  });

  const startEdit = (p: Post) => {
    setEditing(p);
    setForm({
      title: p.title,
      body: p.body,
      post_type: p.post_type,
      is_published: p.is_published,
      is_featured: p.is_featured,
    });
  };

  return (
    <div className="space-y-8">
      <SectionHeading
        title="المحتوى"
        description="نشر أخبار، عروض، فائزين، وصور النادي."
      />

      <GlassCard strong className="space-y-3 max-w-2xl">
        <h3 className="text-[#E8D48B] font-semibold">
          {editing ? "تعديل منشور" : "منشور جديد"}
        </h3>
        <Select
          label="النوع"
          value={form.post_type}
          onChange={(e) =>
            setForm((f) => ({ ...f, post_type: e.target.value as PostType }))
          }
          options={[
            { value: "news", label: "خبر" },
            { value: "offer", label: "عرض" },
            { value: "winner", label: "فائز" },
            { value: "tournament", label: "إعلان بطولة" },
            { value: "photo", label: "صورة" },
          ]}
        />
        <Input
          label="العنوان"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <label className="block space-y-1.5">
          <span className="text-sm text-[#E8D48B]">المحتوى</span>
          <textarea
            className="w-full min-h-32 rounded-xl bg-[#07110e] border border-[rgba(201,162,39,0.22)] px-3 py-2 text-sm text-[#f5f2ea] outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[rgba(212,175,55,0.2)]"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
        </label>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_published: e.target.checked }))
              }
            />
            منشور
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_featured: e.target.checked }))
              }
            />
            مميز
          </label>
        </div>
        <div className="flex gap-2">
          <Button
            loading={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {editing ? "حفظ" : "نشر"}
          </Button>
          {editing && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditing(null);
                setForm(emptyPost);
              }}
            >
              إلغاء
            </Button>
          )}
        </div>
      </GlassCard>

      <div className="space-y-3">
        {(postsQuery.data ?? []).map((p) => (
          <GlassCard
            key={p.id}
            className="flex flex-col sm:flex-row sm:items-start justify-between gap-3"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge tone="green">{p.post_type_display}</Badge>
                {!p.is_published && <Badge tone="muted">مسودة</Badge>}
                {p.is_featured && <Badge tone="gold">مميز</Badge>}
              </div>
              <p className="font-semibold">{p.title}</p>
              <p className="text-sm text-[var(--muted)] line-clamp-2 mt-1">
                {p.body}
              </p>
              <p className="text-xs text-[var(--muted)] mt-2">
                {format(new Date(p.published_at), "d MMM yyyy HH:mm", {
                  locale: ar,
                })}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => startEdit(p)}>
                تعديل
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  if (confirm("حذف المنشور؟")) deleteMutation.mutate(p.id);
                }}
              >
                حذف
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
