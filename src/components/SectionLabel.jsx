export default function SectionLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-alliance-yellow">
      <span className="h-px w-8 bg-alliance-yellow" />
      {children}
    </span>
  );
}
