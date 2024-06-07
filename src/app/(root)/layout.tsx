"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminPanelLayout from "~/components/admin-panel-layout";
import { useAuthStore } from "~/hooks/use-auth";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { account } = useAuthStore();
  useEffect(() => {
    if (account === null) {
      router.push("/sign-in");
    }
  }, [account]);
  return <AdminPanelLayout>{children}</AdminPanelLayout>;
}
