const tones = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  ASSIGNED: "bg-indigo-50 text-indigo-700",
  OUT_FOR_DELIVERY: "bg-violet-50 text-violet-700",
  DELIVERED: "bg-emerald-50 text-emerald-800",
  CANCELLED: "bg-slate-100 text-slate-500",
  REJECTED: "bg-rose-50 text-rose-700",
  DELIVERY_FAILED: "bg-rose-50 text-rose-700",
};

export function OrderStatusBadge({ status, label }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[status] || "bg-slate-100 text-slate-600"}`}>
      {label || status}
    </span>
  );
}

export function OrderTimeline({ progress }) {
  if (!progress?.steps?.length) return null;

  return (
    <ol className="grid gap-3 sm:grid-cols-5">
      {progress.steps.map((step, index) => (
        <li key={step.key} className="flex items-center gap-3 sm:block">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              step.state === "done"
                ? "bg-[#1f9d55] text-white"
                : step.state === "active"
                  ? "bg-white text-[#1f9d55] ring-2 ring-[#1f9d55]"
                  : step.state === "stopped"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-slate-100 text-slate-400"
            }`}
          >
            {step.state === "done" ? "✓" : index + 1}
          </span>
          <span className={`mt-0 text-xs font-medium sm:mt-2 sm:block ${step.state === "upcoming" ? "text-slate-400" : "text-slate-700"}`}>
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

export const orderMoney = (value) =>
  `${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)} MAD`;
