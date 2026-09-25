export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink-soft">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-brand" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
