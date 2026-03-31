import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const base = "rounded-lg font-medium transition-colors disabled:opacity-50";
    const variants = {
      primary: "bg-primary hover:bg-primary-light text-white",
      secondary: "bg-surface-light hover:bg-gray-700 text-white",
      ghost: "hover:bg-surface-light text-gray-300",
      danger: "bg-red-600 hover:bg-red-700 text-white",
    };
    const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2", lg: "px-6 py-3 text-lg" };

    return (
      <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
