"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Compass, Plus, User } from "@phosphor-icons/react";

const tabs = [
  { href: "/", label: "início", icon: House },
  { href: "/explorar", label: "explorar", icon: Compass },
  { href: "/criar", label: "criar", icon: Plus },
  { href: "/perfil", label: "perfil", icon: User },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 pb-5 z-50">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} className="flex flex-col items-center gap-1">
            <Icon
              size={22}
              weight={active ? "fill" : "regular"}
              className={active ? "text-purple-600" : "text-gray-300"}
            />
            <span className={`text-xs font-bold ${active ? "text-purple-600" : "text-gray-300"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}