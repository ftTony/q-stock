type Props = {
  className?: string;
};

/** Simple robot / AI assistant glyph. */
export function IconRobot({ className = "h-5 w-5" }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v2.5" />
      <circle cx="12" cy="2.25" r="0.9" fill="currentColor" stroke="none" />
      <rect x="5" y="6.5" width="14" height="10" rx="3.2" />
      <circle cx="9.25" cy="11.25" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="14.75" cy="11.25" r="1.15" fill="currentColor" stroke="none" />
      <path d="M9.5 14.25h5" />
      <path d="M3.5 11h1.5M19 11h1.5" />
      <path d="M9 16.5v2.25a1.75 1.75 0 0 0 1.75 1.75h2.5A1.75 1.75 0 0 0 15 18.75V16.5" />
    </svg>
  );
}
