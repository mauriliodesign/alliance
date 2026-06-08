import { initials, colorFromString } from "../../lib/format";

export default function Avatar({ name, size = "md" }) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${sizes[size]}`}
      style={{ backgroundColor: colorFromString(name) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
