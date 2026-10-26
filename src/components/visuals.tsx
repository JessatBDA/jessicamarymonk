export function Brushstroke({ variant = 0 }: { variant?: number }) {
  return (
    <svg
      className="brush"
      viewBox="0 0 1200 60"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter
          id={`rough-${variant}`}
          x="-2%"
          y="-40%"
          width="104%"
          height="180%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".06 .3"
            numOctaves="3"
            seed={variant + 3}
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" />
        </filter>
      </defs>
      <path
        d={
          variant % 2
            ? "M5 39 C150 40 270 14 420 25 S700 43 850 20 S1070 26 1195 15 L1180 24 C1050 35 1000 16 850 30 S620 44 420 33 S170 45 5 42Z"
            : "M0 41 C130 38 225 7 320 14 C390 18 350 52 408 41 S670 5 760 23 S940 39 1010 20 C1040 6 1038 36 1070 29 S1165 30 1200 10 C1170 40 1090 35 1060 35 S1020 17 1010 29 C950 49 830 37 760 31 S560 29 410 50 C350 59 390 19 320 21 S90 44 0 41Z"
        }
        fill="currentColor"
        filter={`url(#rough-${variant})`}
      />
    </svg>
  );
}
export function ImagePlaceholder({
  label,
  shape = "landscape",
  number,
}: {
  label: string;
  shape?: "landscape" | "portrait" | "square";
  number?: string;
}) {
  return (
    <div
      className={`image-placeholder ${shape}`}
      role="img"
      aria-label={`${label} — photograph to be supplied`}
    >
      <span className="placeholder-number" aria-hidden="true">
        {number}
      </span>
      <svg viewBox="0 0 90 70" aria-hidden="true">
        <path
          d="M7 53 Q24 19 40 41 T82 18 M10 60 Q45 50 81 59 M28 13 Q38 5 44 17 T60 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
      <span>{label}</span>
      <small>Photograph to be supplied</small>
    </div>
  );
}
