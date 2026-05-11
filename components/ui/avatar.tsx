"use client";
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & { size?: number }
>(({ className, size = 28, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative inline-flex shrink-0 overflow-hidden rounded-full",
      className,
    )}
    style={{ width: size, height: size, ...props.style }}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

export const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & { color?: string }
>(({ className, color, style, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase tracking-wider text-white",
      !color && "bg-brand-grad",
      className,
    )}
    style={{ background: color, ...style }}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export function AvatarStack({
  users,
  size = 28,
  max = 4,
}: {
  users: { id: string; name: string; image?: string | null; color?: string }[];
  size?: number;
  max?: number;
}) {
  const visible = users.slice(0, max);
  const hidden = Math.max(0, users.length - max);

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((u) => {
        const initials = u.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        return (
          <Avatar
            key={u.id}
            size={size}
            className="ring-2 ring-[var(--color-bg-elev)]"
            title={u.name}
          >
            {u.image ? <AvatarImage src={u.image} alt={u.name} /> : null}
            <AvatarFallback color={u.color}>{initials}</AvatarFallback>
          </Avatar>
        );
      })}
      {hidden > 0 && (
        <Avatar size={size} className="ring-2 ring-[var(--color-bg-elev)]">
          <AvatarFallback color="var(--color-ink-4)">+{hidden}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
