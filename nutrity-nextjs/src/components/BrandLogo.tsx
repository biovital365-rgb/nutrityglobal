type BrandLogoProps = {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ compact = false, inverse = false, className = "", priority = false }: BrandLogoProps) {
  const src = compact
    ? inverse ? "/brand/nutrity-symbol-micro-negative.svg" : "/brand/nutrity-symbol-micro.svg"
    : inverse ? "/brand/nutrity-logo-horizontal-negative.svg" : "/brand/nutrity-logo-horizontal.svg";

  return (
    <img
      src={src}
      alt="Nutrity Global"
      className={className}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
