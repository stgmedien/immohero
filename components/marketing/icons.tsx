import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

function withProps({ size = 22, strokeWidth = 1.5, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function CameraIcon(props: IconProps) {
  return (
    <svg {...withProps(props)}>
      <rect x="2.5" y="6.5" width="19" height="13" rx="2.5" />
      <circle cx="12" cy="13" r="3.5" />
      <path d="M8 6.5l1.2-2.2h5.6L16 6.5" />
    </svg>
  );
}

export function DroneIcon(props: IconProps) {
  return (
    <svg {...withProps(props)}>
      <circle cx="5" cy="5" r="2.2" />
      <circle cx="19" cy="5" r="2.2" />
      <circle cx="5" cy="19" r="2.2" />
      <circle cx="19" cy="19" r="2.2" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
      <path d="M9 12h-2.5M15 12H17.5M12 9V6.5M12 15V17.5" />
    </svg>
  );
}

export function SphereIcon(props: IconProps) {
  return (
    <svg {...withProps(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <ellipse cx="12" cy="12" rx="3.5" ry="8.5" />
      <path d="M3.5 12h17" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...withProps(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10 8.5l5 3.5-5 3.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PlanIcon(props: IconProps) {
  return (
    <svg {...withProps(props)}>
      <rect x="3" y="3" width="18" height="18" rx="1.5" />
      <path d="M3 10h7v11M10 14h11M14 14v7" />
    </svg>
  );
}

export function CubeIcon(props: IconProps) {
  return (
    <svg {...withProps(props)}>
      <path d="M12 3l9 5v8l-9 5-9-5V8z" />
      <path d="M3 8l9 5 9-5M12 13v10" />
    </svg>
  );
}

export function ScanIcon(props: IconProps) {
  return (
    <svg {...withProps(props)}>
      <path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3" />
      <path d="M4 12h16" />
    </svg>
  );
}

export function TextIcon(props: IconProps) {
  return (
    <svg {...withProps(props)}>
      <path d="M5 5h14M5 12h14M5 19h9" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...withProps(props)}>
      <path d="M4 12.5l5 5 11-12" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...withProps(props)}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg {...withProps({ ...props })}>
      <path d="M12 3l2.6 5.3 5.9.9-4.3 4.2 1 5.8L12 16.8 6.8 19.2l1-5.8L3.5 9.2l5.9-.9z" />
    </svg>
  );
}

export const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  camera: CameraIcon,
  drone: DroneIcon,
  sphere: SphereIcon,
  play: PlayIcon,
  plan: PlanIcon,
  cube: CubeIcon,
  scan: ScanIcon,
  text: TextIcon,
  check: CheckIcon,
  arrow: ArrowRightIcon,
  star: StarIcon,
};

export function ServiceIcon({ name, ...props }: { name: string } & IconProps) {
  const Comp = ICON_MAP[name] ?? CameraIcon;
  return <Comp {...props} />;
}
