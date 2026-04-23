"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type PartnershipInfoProps = {
  name: string;
  inviteCode: string;
};

export function PartnershipInfo({ name, inviteCode }: PartnershipInfoProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignora — browser sem clipboard API
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-border bg-surface p-5 lg:p-6">
      <h2 className="text-sm font-medium text-ink">Parceria</h2>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Nome</span>
        <span className="text-sm text-ink">{name}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Código de convite</span>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "group inline-flex items-center justify-between gap-3 rounded-[12px] border border-border bg-bg px-3 py-2 text-left transition-colors",
            "hover:border-signal/40 hover:bg-signal-faint/40",
          )}
        >
          <span className="font-mono text-sm tracking-wider text-ink">
            {inviteCode}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[11px] font-medium",
              copied ? "text-signal" : "text-muted-foreground",
            )}
          >
            {copied ? (
              <>
                <Check className="size-3.5" strokeWidth={3} /> Copiado
              </>
            ) : (
              <>
                <Copy className="size-3.5" /> Copiar
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
