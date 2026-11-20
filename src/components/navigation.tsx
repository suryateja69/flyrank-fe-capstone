"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  AudioLines,
  CircleHelp,
  FlaskConical,
  LayoutGrid,
  MessageSquareText,
  Settings2,
} from "lucide-react";
const links = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/discovery", label: "Project discovery", icon: MessageSquareText },
  { href: "/settings", label: "Workspace settings", icon: Settings2 },
  { href: "/playground", label: "Component lab", icon: FlaskConical },
];
export function Navigation() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <span className="brand-symbol">
          <AudioLines size={23} />
        </span>
        LeadDesk<span className="brand-dot">®</span>
      </Link>
      <div className="workspace-tag">
        <span className="workspace-monogram">ST</span>
        <div>
          <strong>Surya’s workspace</strong>
          <span>Agency discovery</span>
        </div>
      </div>
      <span className="nav-caption">WORKSPACE</span>
      <nav aria-label="Main navigation">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={pathname === href ? "nav-link selected" : "nav-link"}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card">
          <CircleHelp size={20} />
          <strong>Built for better beginnings.</strong>
          <p>Turn a project idea into a clear next step.</p>
          <Link href="/about">
            How LeadDesk works <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="user-profile">
          <span className="user-avatar">ST</span>
          <div>
            <strong>Surya Teja</strong>
            <small>FlyRank capstone</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
