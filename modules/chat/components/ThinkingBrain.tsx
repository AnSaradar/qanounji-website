"use client";

interface ThinkingBrainProps {
  className?: string;
  size?: number; // px
}

export function ThinkingBrain({ className = "", size = 16 }: ThinkingBrainProps) {
  const dim = `${size}px`;
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label="AI is thinking">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-blue-400/20 dark:bg-blue-300/20 blur-md animate-pulse" style={{ width: dim, height: dim }} />
        <svg
          className="relative z-10 text-blue-500 dark:text-blue-400 animate-pulse"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: dim, height: dim }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div className="flex space-x-1 rtl:space-x-reverse">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70 dark:bg-blue-400/70 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70 dark:bg-blue-400/70 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70 dark:bg-blue-400/70 animate-bounce" />
      </div>
    </div>
  );
}


