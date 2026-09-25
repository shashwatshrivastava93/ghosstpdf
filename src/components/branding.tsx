"use client";

import { Ghost, Shield, Timer, Trash2 } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Ghost className="h-8 w-8 text-violet-400" />
      <span className="text-xl font-bold text-zinc-100">GhostPDF</span>
    </div>
  );
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 hover:bg-zinc-900/60 transition-colors">
      <div className="rounded-xl bg-zinc-800/50 p-3 w-fit mb-4">
        <Icon className="h-5 w-5 text-violet-400" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-200 mb-1">{title}</h3>
      <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}

export function AdPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 flex items-center justify-center ${className}`}
    >
      <p className="text-xs text-zinc-700">Advertisement</p>
    </div>
  );
}

export function Features() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto w-full px-4">
      <FeatureCard
        icon={Shield}
        title="End-to-End Encrypted"
        description="Files are encrypted in your browser. We never see the contents."
      />
      <FeatureCard
        icon={Timer}
        title="Self-Destructing"
        description="You choose the lifetime — from 2 to 60 minutes. After it expires, the file is permanently deleted. No exceptions."
      />
      <FeatureCard
        icon={Trash2}
        title="Zero Traces"
        description="No accounts, no tracking, no personal data. Files are erased forever on expiry — with an automatic audit log."
      />
    </div>
  );
}
