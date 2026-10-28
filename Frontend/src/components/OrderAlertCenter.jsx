import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  flushQueuedSounds,
  playSound,
  readPlayedSounds,
  rememberPlayedSound,
  soundEnabled,
} from "../services/sounds";

const FRESH_MS = 10 * 60 * 1000;

function OrderAlertCenter({ userId, sound, load, markRead, hrefFor, onBadge, onArrive }) {
  const [items, setItems] = useState([]);
  const announced = useRef(new Set());
  const loadRef = useRef(load);
  const markReadRef = useRef(markRead);
  const onBadgeRef = useRef(onBadge);
  const onArriveRef = useRef(onArrive);
  loadRef.current = load;
  markReadRef.current = markRead;
  onBadgeRef.current = onBadge;
  onArriveRef.current = onArrive;

  useEffect(() => {
    if (!userId) return undefined;
    let active = true;

    const announce = async (notifications) => {
      let arrived = false;
      for (const item of notifications) {
        if (!announced.current.has(item.id)) {
          announced.current.add(item.id);
          arrived = true;
        }
        if (readPlayedSounds(userId).has(item.id)) continue;
        const fresh = Date.now() - new Date(item.createdAt).getTime() <= FRESH_MS;
        if (!fresh || !soundEnabled()) {
          rememberPlayedSound(userId, item.id);
          continue;
        }
        const heard = await playSound(sound, item.id);
        if (heard) rememberPlayedSound(userId, item.id);
      }
      if (arrived) onArriveRef.current?.();
    };

    const poll = async () => {
      try {
        const result = await loadRef.current();
        if (!active) return;
        const notifications = result.notifications || [];
        setItems(notifications.slice(0, 3));
        if (typeof result.badge === "number") onBadgeRef.current?.(result.badge);
        await announce(notifications);
      } catch {
        // Keep the current order screens usable if the alert request fails.
      }
    };

    const onPointer = async () => {
      const heard = await flushQueuedSounds();
      heard.forEach((id) => rememberPlayedSound(userId, id));
    };

    poll();
    const timer = window.setInterval(poll, 12000);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [userId, sound]);

  if (!items.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[min(100%-2rem,22rem)] flex-col gap-2">
      {items.map((item) => (
        <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
          <p className="mt-1 text-sm text-slate-600">{item.text}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            {item.orderId ? (
              <Link to={hrefFor(item)} className="text-xs font-semibold text-[#1f9d55]">
                Voir la commande
              </Link>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => {
                setItems((current) => current.filter((entry) => entry.id !== item.id));
                markReadRef.current?.(item.id)?.catch(() => {});
              }}
              className="text-xs font-medium text-slate-500"
            >
              Fermer
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default OrderAlertCenter;
