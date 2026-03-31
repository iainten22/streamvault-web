import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => (
    <div className="space-y-1">
      {label && <label className="block text-sm text-gray-400">{label}</label>}
      <input
        ref={ref}
        className={`w-full px-3 py-2 bg-surface-light border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary ${error ? "border-red-500" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  ),
);
Input.displayName = "Input";
