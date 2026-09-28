"use client";

import { useEffect, useId, useRef, useState } from "react";

export interface PickedPlace {
  text: string;
  /** Region of the suggestion picked, if one was picked. */
  region: string | null;
}

interface Suggestion {
  value: string;
  detail: string;
  region: string | null;
}

/**
 * Town or postcode, with UK town suggestions from /api/places as you type.
 * Postcodes are not looked up here (they need no suggestions).
 */
export function LocationField({
  value,
  onChange,
  disabled,
  compact = false,
}: {
  value: PickedPlace;
  onChange: (v: PickedPlace) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQuery = useRef("");

  useEffect(() => {
    const q = value.text.trim();
    if (timer.current) clearTimeout(timer.current);
    if (q.length < 2 || /\d/.test(q) || value.region) return;
    timer.current = setTimeout(async () => {
      lastQuery.current = q;
      try {
        const res = await fetch(`/api/places?${new URLSearchParams({ q })}`);
        const data = (await res.json()) as { suggestions?: Suggestion[] };
        if (lastQuery.current !== q) return;
        setItems(data.suggestions ?? []);
        setActive(-1);
      } catch {
        setItems([]);
      }
    }, 220);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value.text, value.region]);

  function pick(s: Suggestion) {
    onChange({ text: s.value, region: s.region });
    setOpen(false);
    setItems([]);
  }

  const typed = value.text.trim();
  const eligible = typed.length >= 2 && !/\d/.test(typed) && !value.region;
  const showList = open && eligible && items.length > 0;

  return (
    <div className="relative">
      <label htmlFor={id} className="field-label">
        Where do you want to work? <span className="font-normal text-mute">(optional)</span>
      </label>
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mute-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </svg>
        <input
          id={id}
          type="text"
          className="field pl-11"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          maxLength={80}
          placeholder="Town or postcode, e.g. Leeds or LS1 4AP"
          value={value.text}
          disabled={disabled}
          onChange={(e) => {
            onChange({ text: e.target.value, region: null });
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (!showList) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => (a + 1) % items.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
            } else if (e.key === "Enter" && active >= 0) {
              e.preventDefault();
              pick(items[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
      </div>
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-hair bg-white py-1 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)]"
        >
          {items.map((s, i) => (
            <li
              key={`${s.value}-${s.detail}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={`cursor-pointer px-4 py-2.5 ${i === active ? "bg-cloud" : "hover:bg-cloud"}`}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(s);
              }}
            >
              <span className="block text-[15px] font-medium text-ink">{s.value}</span>
              {s.detail && <span className="block text-[13px] text-mute">{s.detail}</span>}
            </li>
          ))}
        </ul>
      )}
      {!compact && <p className="field-hint">We search around here, plus remote jobs. Leave it blank to search the whole UK.</p>}
    </div>
  );
}
