export type DrawingTool =
  | "none"
  | "segment"
  | "rayLine"
  | "straightLine"
  | "horizontalStraightLine"
  | "verticalStraightLine"
  | "parallelStraightLine"
  | "fibonacciLine"
  | "priceLine"
  | "brush";

const iconClass = "h-4 w-4";

function Svg({
  children,
  className = iconClass,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function DrawingToolIcon({
  tool,
  className = iconClass,
}: {
  tool: DrawingTool | "clear";
  className?: string;
}) {
  switch (tool) {
    case "none":
      return (
        <Svg className={className}>
          <path d="M8 11V6.5a1.5 1.5 0 0 1 3 0V11" />
          <path d="M11 10.5V5.5a1.5 1.5 0 0 1 3 0V11" />
          <path d="M14 10V7a1.5 1.5 0 0 1 3 0v6.5a5 5 0 0 1-5 5H11a5 5 0 0 1-4.5-2.7L5 13.5a1.5 1.5 0 0 1 2.5-1.6L8 13" />
        </Svg>
      );
    case "segment":
      return (
        <Svg className={className}>
          <circle cx="6" cy="18" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
          <path d="M7.2 16.8 16.8 7.2" />
        </Svg>
      );
    case "rayLine":
      return (
        <Svg className={className}>
          <circle cx="6" cy="18" r="1.5" fill="currentColor" stroke="none" />
          <path d="M7.2 16.8 20 4" />
          <path d="M16.5 4H20v3.5" />
        </Svg>
      );
    case "straightLine":
      return (
        <Svg className={className}>
          <path d="M4 20 20 4" />
        </Svg>
      );
    case "horizontalStraightLine":
      return (
        <Svg className={className}>
          <path d="M3 12h18" />
        </Svg>
      );
    case "verticalStraightLine":
      return (
        <Svg className={className}>
          <path d="M12 3v18" />
        </Svg>
      );
    case "parallelStraightLine":
      return (
        <Svg className={className}>
          <path d="M5 19 15 5" />
          <path d="M9 19 19 5" />
        </Svg>
      );
    case "fibonacciLine":
      return (
        <Svg className={className}>
          <path d="M4 5h16M4 10h16M4 14h16M4 19h16" />
          <path d="M8 5v14" strokeDasharray="2 2" />
        </Svg>
      );
    case "priceLine":
      return (
        <Svg className={className}>
          <path d="M3 12h12" />
          <rect x="15" y="9" width="6" height="6" rx="1" />
        </Svg>
      );
    case "brush":
      return (
        <Svg className={className}>
          <path d="M4 20c2-1 3-3 4-5l9-9a2.1 2.1 0 0 1 3 3l-9 9c-2 1-4 2-7 2z" />
          <path d="M14 7l3 3" />
        </Svg>
      );
    case "clear":
      return (
        <Svg className={className}>
          <path d="M4 7h16" />
          <path d="M9 7V5h6v2" />
          <path d="M7 7l1 12h8l1-12" />
        </Svg>
      );
    default:
      return null;
  }
}
