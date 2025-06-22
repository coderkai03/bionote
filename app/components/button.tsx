import React from "react";

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  children,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-white text-gray-700 hover:bg-gray-100 focus:ring-gray-500 border border-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
    success: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

// Icon Button Component
interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
  tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  tooltip,
  className = "",
  children,
  ...props
}) => {
  return (
    <Button
      className={`p-2 aspect-square ${className}`}
      title={tooltip}
      {...props}
    >
      <span className="text-lg">{icon}</span>
      {children}
    </Button>
  );
};

// Animated Bar Component
interface AnimatedBarProps {
  position: "top" | "bottom";
  backgroundColor?: string;
  className?: string;
}

export const AnimatedBar: React.FC<AnimatedBarProps> = ({
  position,
  backgroundColor = "#000000",
  className = "",
}) => (
  <div
    className={`
      absolute ${position === "top" ? "top-0" : "bottom-0"} 
      left-0 right-0 h-16 backdrop-blur-xl z-10 overflow-hidden
      ${className}
    `}
    style={{
      backgroundColor,
      clipPath:
        position === "top"
          ? "polygon(0 0, 100% 0, 10% 100%, 0 100%)"
          : "polygon(100% 0, 100% 0, 100% 100%, 0 100%)",
    }}
  >
    {/* Subtle animated gradient overlay */}
    <div
      className="absolute inset-0 opacity-30"
      style={{
        background:
          position === "top"
            ? "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%)"
            : "linear-gradient(-45deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%)",
        animation:
          position === "top"
            ? "fadeInOut 8s ease-in-out infinite"
            : "fadeInOut 8s ease-in-out infinite 4s",
      }}
    />

    {/* Very subtle pulsing glow */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.02) 0%, transparent 60%)",
        animation:
          position === "top"
            ? "gentlePulse 12s ease-in-out infinite"
            : "gentlePulse 12s ease-in-out infinite 6s",
      }}
    />

    {/* Subtle shimmer effect */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.01) 50%, transparent 100%)",
        animation:
          position === "top"
            ? "subtleShimmer 15s ease-in-out infinite"
            : "subtleShimmer 15s ease-in-out infinite 7.5s",
      }}
    />
  </div>
);

// Loading Dots Component
export const LoadingDots: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={`flex space-x-1 ${className}`}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce shadow-sm"
        style={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>
);

// Error Alert Component
interface ErrorAlertProps {
  title: string;
  message: string;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title,
  message,
  className = "",
}) => (
  <div
    className={`rounded-lg p-4 ${className}`}
    style={{
      background:
        "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)",
      border: "1px solid rgba(239,68,68,0.3)",
      boxShadow:
        "0 4px 15px rgba(239,68,68,0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
    }}
  >
    <div className="flex">
      <div className="flex-shrink-0">
        <svg
          className="h-5 w-5 text-red-400 drop-shadow-sm"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-200 drop-shadow-sm">
          {title}
        </h3>
        <div className="mt-2 text-sm text-red-300">
          <p>{message}</p>
        </div>
      </div>
    </div>
  </div>
);

// Status Indicator Component
interface StatusIndicatorProps {
  isActive: boolean;
  activeText?: string;
  inactiveText?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isActive,
  activeText = "Active",
  inactiveText = "Inactive",
  className = "",
}) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <div
      className={`w-2 h-2 rounded-full transition-all duration-200 ${
        isActive
          ? "bg-green-400 animate-pulse shadow-lg shadow-green-400/50"
          : "bg-gray-500"
      }`}
    />
    <span className="text-sm text-gray-300 drop-shadow-sm">
      {isActive ? activeText : inactiveText}
    </span>
  </div>
);
