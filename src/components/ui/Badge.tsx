import { getOriginMark } from "../../data/pokemon-dex";
import { assetUrl } from "../../assetUrl";

interface BadgeProps {
  children?: React.ReactNode;
  variant: "shiny" | "event" | "alpha" | "trade" | "ha" | "default";
  icon?: string;
  /** Render as icon-only (no text label) */
  iconOnly?: boolean;
  /** "sm" = bare inline icon (table rows), "md" = circle with background (form preview). Only used when iconOnly is true. */
  size?: "sm" | "md";
  title?: string;
}

const variantClasses: Record<BadgeProps["variant"], string> = {
  shiny: "bg-yellow-100 text-yellow-800",
  event: "bg-orange-100 text-orange-800",
  alpha: "bg-red-100 text-red-800",

  trade: "bg-sky-100 text-sky-800",
  ha: "bg-teal-100 text-teal-800",
  default: "bg-gray-100 text-gray-800",
};

export const BADGE_ICONS = {
  shiny: "/badges/shiny.png",
  alpha: "/badges/alpha.png",

  event: "/badges/event.png",
  trade: "/badges/trade.png",
} as const;

const VARIANT_LABELS: Record<string, string> = {
  shiny: "Shiny",
  event: "Event",
  alpha: "Alpha",

  trade: "Available for Trade",
  ha: "HA",
};

interface IconConfig {
  pixelated: boolean;
  dropShadow: boolean;
}

const ICON_CONFIG: Record<string, IconConfig> = {
  [BADGE_ICONS.shiny]: { pixelated: false, dropShadow: true },
  [BADGE_ICONS.event]: { pixelated: false, dropShadow: true },
  [BADGE_ICONS.alpha]: { pixelated: true, dropShadow: false },
  [BADGE_ICONS.trade]: { pixelated: false, dropShadow: true },
};

/** Standalone badge icon for embedding in buttons, filters, etc. */
export function BadgeIcon({ icon, size = "sm" }: { icon: string; size?: "sm" | "md" }) {
  const config = ICON_CONFIG[icon] ?? { pixelated: false, dropShadow: false };

  const sizeClass = size === "md" ? "w-5 h-5" : "w-4 h-4";

  return (
    <img
      src={assetUrl(icon)}
      alt=""
      className={`${sizeClass}${config.dropShadow ? " drop-shadow" : ""}`}
      style={config.pixelated ? { imageRendering: "pixelated" } : undefined}
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
  );
}

export function Badge({ children, variant, icon, iconOnly, size = "sm", title }: BadgeProps) {
  const label = title ?? VARIANT_LABELS[variant];

  if (iconOnly && icon) {
    if (size === "md") {
      return (
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${variantClasses[variant]}`}
          title={label}
        >
          <BadgeIcon icon={icon} size="md" />
        </span>
      );
    }
    return (
      <span title={label}>
        <BadgeIcon icon={icon} size="sm" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${variantClasses[variant]}`}
      title={label}
    >
      {icon && <BadgeIcon icon={icon} size="sm" />}
      {children}
    </span>
  );
}

/** Consolidated origin-mark display used across table rows, detail views, and form previews. */
export function OriginMarkBadge({
  value,
  showLabel = true,
  size = "sm",
  title,
}: {
  value: string;
  showLabel?: boolean;
  size?: "sm" | "md";
  title?: string;
}) {
  const mark = getOriginMark(value);
  if (!mark) return <>{value}</>;

  const containerSize = size === "md" ? "w-7 h-7" : "w-5 h-5";
  const iconSize = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";
  const textSize = size === "md" ? "text-[9px]" : "text-[7px]";
  const fallbackText = size === "md" ? mark.label : mark.label.slice(0, 2);
  const resolvedTitle = title ?? mark.label;

  const circle = (
    <span
      className={`inline-flex items-center justify-center ${containerSize} rounded-full bg-gray-700 flex-shrink-0`}
      title={resolvedTitle}
    >
      {mark.sprite ? (
        <img src={assetUrl(mark.sprite)} alt={mark.label} className={`${iconSize} drop-shadow`} />
      ) : (
        <span className={`${textSize} font-bold text-gray-100 leading-none`}>{fallbackText}</span>
      )}
    </span>
  );

  if (!showLabel) return circle;

  return (
    <span className="inline-flex items-center gap-1.5">
      {circle}
      {mark.label}
    </span>
  );
}
