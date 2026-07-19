"use client";

import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => login(username, password),
    onSuccess: () => {
      toast.success("مرحباً بك في لوحة الإدارة");
      router.replace("/admin");
    },
    onError: () => toast.error("بيانات الدخول غير صحيحة"),
  });

  return (
    <div className="min-h-[100svh] flex items-center justify-center px-4 py-12 felt-pattern">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <GlassCard strong className="space-y-5">
          <div className="text-center">
            <Image
              src="/logo.svg"
              alt="عالم السنوكر"
              width={56}
              height={56}
              className="mx-auto mb-3"
            />
            <h1 className="font-display text-3xl gold-text">دخول الإدارة</h1>
            <p className="text-sm text-[var(--muted)] mt-2">
              لوحة تحكم عالم السنوكر
            </p>
          </div>

          <Input
            label="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <Input
            label="كلمة المرور"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <Button
            className="w-full"
            size="lg"
            loading={mutation.isPending}
            leftIcon={<Lock className="size-4" />}
            onClick={() => mutation.mutate()}
          >
            تسجيل الدخول
          </Button>
        </GlassCard>
      </motion.div>
    </div>
  );
}
