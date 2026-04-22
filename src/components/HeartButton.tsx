import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  glow?: boolean;
  variant?: "primary" | "ghost";
}

/**
 * Editorial CTA — kept name "HeartButton" for backward compatibility.
 * Now: dark, sharp, crimson glow on hover. No icons, no hearts.
 */
export const HeartButton = forwardRef<HTMLButtonElement, Props>(
  ({ className, glow, variant = "primary", children, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex items-center justify-center px-10 py-4",
        "font-sans text-[11px] uppercase tracking-[0.35em] font-medium",
        "border transition-spring overflow-hidden",
        variant === "primary" &&
          "bg-primary/90 text-primary-foreground border-primary hover:bg-primary",
        variant === "ghost" &&
          "bg-transparent text-foreground border-foreground/30 hover:border-primary hover:text-primary",
        "hover:shadow-crimson active:scale-[0.98]",
        glow && "animate-ember",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...rest}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 bg-gradient-crimson opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </button>
  )
);
HeartButton.displayName = "HeartButton";
