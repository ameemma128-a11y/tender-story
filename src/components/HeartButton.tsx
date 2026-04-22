import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  glow?: boolean;
  icon?: boolean;
}

export const HeartButton = forwardRef<HTMLButtonElement, Props>(
  ({ className, glow, icon = true, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full",
        "font-serif text-lg tracking-wide bg-gradient-rose text-primary-foreground",
        "shadow-soft hover:shadow-glow transition-spring hover:scale-[1.03] active:scale-[0.98]",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        glow && "animate-pulse-glow",
        className
      )}
      {...rest}
    >
      {icon && <Heart className="w-5 h-5 fill-primary-foreground/80" />}
      {children}
    </button>
  )
);
HeartButton.displayName = "HeartButton";
