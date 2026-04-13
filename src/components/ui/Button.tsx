import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "default" | "danger" | "success" | "warning";
type ButtonRank = "primary" | "secondary" | "tertiary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  rank?: ButtonRank;
  selected?: boolean;
}

const variantColors: Record<ButtonVariant, { primary: string; secondary: string; tertiary: string; selected: string }> = {
  default: {
    primary: "bg-blue-600 text-white shadow-sm hover:bg-blue-700",
    secondary: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50",
    tertiary: "text-blue-600 border border-transparent hover:text-blue-800 hover:border-blue-200 hover:bg-blue-50",
    selected: "bg-blue-50 border border-blue-300 text-blue-700",
  },
  danger: {
    primary: "bg-red-600 text-white shadow-sm hover:bg-red-700",
    secondary: "border border-red-300 bg-transparent text-red-600 hover:bg-red-50",
    tertiary: "text-red-600 border border-transparent hover:border-red-200 hover:bg-red-50",
    selected: "bg-red-50 border border-red-300 text-red-700",
  },
  success: {
    primary: "bg-green-600 text-white shadow-sm hover:bg-green-700",
    secondary: "border border-green-300 bg-transparent text-green-600 hover:bg-green-50",
    tertiary: "text-green-600 border border-transparent hover:border-green-200 hover:bg-green-50",
    selected: "bg-green-50 border border-green-300 text-green-700",
  },
  warning: {
    primary: "bg-yellow-500 text-white shadow-sm hover:bg-yellow-600",
    secondary: "border border-yellow-300 bg-transparent text-yellow-600 hover:bg-yellow-50",
    tertiary: "text-yellow-600 border border-transparent hover:border-yellow-200 hover:bg-yellow-50",
    selected: "bg-yellow-50 border border-yellow-300 text-yellow-700",
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variant = "default",
  rank = "primary",
  selected = false,
  className,
  children,
  ...props
}, ref) {
  const base = "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const style = selected ? variantColors[variant].selected : variantColors[variant][rank];
  const classes = [base, style, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  );
});
