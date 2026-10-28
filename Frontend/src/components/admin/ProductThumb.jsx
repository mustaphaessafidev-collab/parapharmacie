import { useState } from "react";

function ProductThumb({ src, name, large = false }) {
  const [failed, setFailed] = useState(false);
  const size = large ? "h-40 w-40 text-2xl" : "h-12 w-12 text-sm";

  if (!src || failed) {
    return (
      <span
        className={`flex ${size} shrink-0 items-center justify-center rounded-xl bg-slate-100 font-medium text-slate-400`}
      >
        {(name || "P").slice(0, 1).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className={`${size} shrink-0 rounded-xl object-cover`}
    />
  );
}

export default ProductThumb;
