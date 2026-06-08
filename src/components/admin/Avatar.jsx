import { initials } from "../../lib/format";

export default function Avatar({ name, size = "md" }) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-white/8 font-semibold text-alliance-light/80 ${sizes[size]}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
