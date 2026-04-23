import Image from "next/image";

import { cn } from "@/lib/utils";

type AvatarProps = {
  name: string | null;
  url: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZE_CLASSES = {
  sm: "size-9 text-sm",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-2xl lg:size-20 lg:text-3xl",
} as const;

const IMAGE_SIZE_PX = {
  sm: 36,
  md: 40,
  lg: 48,
  xl: 80,
} as const;

export function Avatar({ name, url, size = "md", className }: AvatarProps) {
  const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-signal-faint font-semibold text-ink",
        SIZE_CLASSES[size],
        className,
      )}
    >
      {url ? (
        <Image
          src={url}
          alt={name ?? "Avatar"}
          width={IMAGE_SIZE_PX[size]}
          height={IMAGE_SIZE_PX[size]}
          className="size-full object-cover"
          unoptimized
        />
      ) : (
        <span aria-hidden>{initial}</span>
      )}
    </span>
  );
}
