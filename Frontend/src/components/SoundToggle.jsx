import { useEffect, useState } from "react";
import { setSoundEnabled, soundEnabled } from "../services/sounds";

function SoundToggle() {
  const [enabled, setEnabled] = useState(soundEnabled);

  useEffect(() => {
    const sync = () => setEnabled(soundEnabled());
    window.addEventListener("atlaspara-sound", sync);
    return () => window.removeEventListener("atlaspara-sound", sync);
  }, []);

  const toggle = () => {
    const next = !soundEnabled();
    setSoundEnabled(next);
    setEnabled(next);
    window.dispatchEvent(new CustomEvent("atlaspara-sound"));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
        enabled
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      {enabled ? "Son activé" : "Son coupé"}
    </button>
  );
}

export default SoundToggle;
