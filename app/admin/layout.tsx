"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Settings,
  FileText,
  GraduationCap,
  Award,
  Briefcase,
  Phone,
  BarChart3,
  BookOpen,
  Palette,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSettings } from "@/components/providers";

const adminNavItems = [
  { href: "/admin", labelKey: "admin.layout.dashboard", icon: BarChart3 },
  { href: "/admin/projects", labelKey: "admin.layout.projects", icon: FileText },
  { href: "/admin/education", labelKey: "admin.layout.education", icon: GraduationCap },
  { href: "/admin/certificates", labelKey: "admin.layout.certificates", icon: Award },
  { href: "/admin/skills", labelKey: "admin.layout.skills", icon: Palette },
  { href: "/admin/experience", labelKey: "admin.layout.experience", icon: Briefcase },
  { href: "/admin/contact", labelKey: "admin.layout.contact", icon: Phone },
  { href: "/admin/training", labelKey: "admin.layout.training", icon: BookOpen },
  { href: "/admin/settings", labelKey: "admin.layout.settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useSettings()
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // ⚠️ لو في صفحة login، ما نعمل redirect ولا نرجّع null
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return; // important

    if (status === "loading") return;
    if (!session) router.push("/admin/login");
  }, [session, status, router, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>; // صفحة login بدون حماية
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            {t("admin.layout.title")}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {t("admin.layout.welcome")}, {session.user?.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t("admin.layout.signOut")}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-73px)] border-r bg-card">
          <nav className="p-4">
            <ul className="space-y-2">
              {adminNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      "text-muted-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
