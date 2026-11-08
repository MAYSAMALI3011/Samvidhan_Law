import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./textfields.css";

/* ---------- 1 · OTP code ---------- */
// onComplete(code) may return a Promise<boolean>. true = verified wave, false = shake.
export function OtpInput({ length = 6, label = "Enter the code we sent", onComplete }) {
  const [vals, setVals] = useState(Array(length).fill(""));
  const [state, setState] = useState("idle"); // idle | verified | error
  const refs = useRef([]);

  const finish = async (arr) => {
    if (arr.some((v) => !v)) return setState("idle");
    const ok = onComplete ? await onComplete(arr.join("")) : true;
    setState(ok ? "verified" : "error");
    if (!ok) setTimeout(() => setState("idle"), 600);
  };
  const setAt = (i, v) => {
    const next = [...vals]; next[i] = v; setVals(next); finish(next);
  };
  const onChange = (i, e) => {
    const d = e.target.value.replace(/\D/g, "").slice(-1);
    setAt(i, d);
    if (d && i < length - 1) refs.current[i + 1]?.focus();
  };
  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !vals[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
  };
  const onPaste = (e) => {
    const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!d) return;
    e.preventDefault();
    const next = Array.from({ length }, (_, i) => d[i] || "");
    setVals(next); finish(next);
    refs.current[Math.min(d.length, length - 1)]?.focus();
  };

  return (
    <div className="tf">
      <span className="tf__label" id="otp-label">{label}</span>
      <div className="otp" data-state={state} role="group" aria-labelledby="otp-label">
        {vals.map((v, i) => (
          <input key={i} ref={(el) => (refs.current[i] = el)} className="tf__box otp__cell" style={{ "--i": i }}
            inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} maxLength={1} placeholder=" "
            value={v} aria-label={`Digit ${i + 1}`} onChange={(e) => onChange(i, e)}
            onKeyDown={(e) => onKeyDown(i, e)} onPaste={onPaste} onFocus={(e) => e.target.select()} />
        ))}
      </div>
      <span className="tf__hint" role="status" data-tone={state === "verified" ? "ok" : state === "error" ? "error" : ""}>
        {state === "verified" ? "✓ Verified" : state === "error" ? "That code didn't match. Try again." : ""}
      </span>
    </div>
  );
}

/* ---------- 2 · Card number (UI only) ----------
   Never send raw card data to your own server. In production use Razorpay/Stripe hosted fields
   and use this only as a styling reference. */
export function CardNumberInput({ label = "Card", onChange }) {
  const [num, setNum] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const expRef = useRef(null);
  const digits = num.replace(/\s/g, "");
  const complete = digits.length === 16;

  useEffect(() => { if (complete) setTimeout(() => expRef.current?.focus(), 250); }, [complete]);
  useEffect(() => { onChange?.({ complete: complete && exp.length === 5 && cvc.length >= 3 }); }, [complete, exp, cvc]);

  return (
    <div className="tf">
      <label className="tf__label" htmlFor="card-num">{label}</label>
      <div className="tf__box card" data-complete={complete}>
        <span className="card__chip" aria-hidden />
        <input id="card-num" className="tf__input card__num" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456"
          value={num} onChange={(e) => setNum(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())} />
        <div className="card__extra" aria-hidden={!complete}>
          <input ref={expRef} className="tf__input" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" tabIndex={complete ? 0 : -1}
            value={exp} onChange={(e) => { const d = e.target.value.replace(/\D/g, "").slice(0, 4); setExp(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d); }} />
          <input className="tf__input" inputMode="numeric" autoComplete="cc-csc" placeholder="CVC" tabIndex={complete ? 0 : -1}
            value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} />
        </div>
      </div>
    </div>
  );
}

/* ---------- 3 · Password strength meter ---------- */
export function scorePassword(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p) && p.length >= 10) s++;
  if (/^(password|12345678|qwerty)/i.test(p)) s = Math.min(s, 1);
  return Math.max(p.length ? 1 : 0, Math.min(s, 4));
}
const LABELS = ["", "Weak", "Fair", "Good", "Strong"];

export function PasswordStrength({ label = "New password", value, onChange }) {
  const [inner, setInner] = useState("");
  const [show, setShow] = useState(false);
  const v = value ?? inner;
  const score = useMemo(() => scorePassword(v), [v]);
  const id = useId();
  return (
    <div className="tf">
      <label className="tf__label" htmlFor={id}>{label}</label>
      <input id={id} className="tf__box" type={show ? "text" : "password"} autoComplete="new-password" value={v}
        aria-describedby={`${id}-m`} onChange={(e) => (onChange ? onChange(e.target.value) : setInner(e.target.value))} />
      <div className="meter" data-score={score} id={`${id}-m`}>
        {[1, 2, 3, 4].map((n) => <span key={n} className="meter__seg" data-on={score >= n} />)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button type="button" className="tf__hint" style={{ all: "unset", cursor: "pointer" }} onClick={() => setShow((s) => !s)}>{show ? "Hide" : "Show"} password</button>
        <span className="meter__label" aria-live="polite" style={{ color: score === 4 ? "var(--tf-ok)" : undefined }}>{LABELS[score]}</span>
      </div>
    </div>
  );
}

/* ---------- 4 · Auto-grow textarea ---------- */
export function AutoGrowTextarea({ label = "Note", value, onChange, maxRows = 8, placeholder, onKeyDown }) {
  const ref = useRef(null);
  const [inner, setInner] = useState("");
  const v = value ?? inner;
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.height = "auto";
    const line = parseFloat(getComputedStyle(el).lineHeight) || 24;
    const max = line * maxRows + 24;
    el.style.height = Math.min(el.scrollHeight, max) + "px";
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [v, maxRows]);
  return (
    <div className="tf">
      <label className="tf__label" htmlFor="grow">{label}</label>
      <textarea id="grow" ref={ref} rows={1} className="tf__box grow" value={v} placeholder={placeholder}
        onChange={(e) => (onChange ? onChange(e.target.value) : setInner(e.target.value))} onKeyDown={onKeyDown} />
    </div>
  );
}

/* ---------- 5 · Tag input ---------- */
export function TagInput({ label = "Topics", tags: ctrl, onChange, suggestions = [], max = 10 }) {
  const [inner, setInner] = useState([]);
  const tags = ctrl ?? inner;
  const [text, setText] = useState("");
  const set = (t) => (onChange ? onChange(t) : setInner(t));
  const add = (raw) => {
    const t = raw.trim().replace(/,$/, "").toLowerCase();
    if (t && !tags.includes(t) && tags.length < max) set([...tags, t]);
    setText("");
  };
  const onKey = (e) => {
    if (["Enter", ",", " "].includes(e.key) && text.trim()) { e.preventDefault(); add(text); }
    if (e.key === "Backspace" && !text && tags.length) set(tags.slice(0, -1));
  };
  return (
    <div className="tf">
      <span className="tf__label">{label}</span>
      <div className="tf__box tags" onClick={(e) => e.currentTarget.querySelector("input")?.focus()}>
        {tags.map((t) => (
          <span key={t} className="tags__chip">{t}
            <button type="button" className="tags__x" aria-label={`Remove ${t}`} onClick={() => set(tags.filter((x) => x !== t))}>×</button>
          </span>
        ))}
        <input className="tags__input" value={text} list="tag-suggestions" placeholder={tags.length ? "" : "Type and press Enter"}
          onChange={(e) => setText(e.target.value)} onKeyDown={onKey} onBlur={() => add(text)} aria-label="Add a topic" />
        <datalist id="tag-suggestions">{suggestions.map((s) => <option key={s} value={s} />)}</datalist>
      </div>
      <span className="tf__hint">{tags.length}/{max} · Backspace removes the last one</span>
    </div>
  );
}

/* ---------- 6 · Ghost complete ----------
   getSuggestion(text) -> full string to complete to, or "" */
const DOMAINS = ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com", "icloud.com"];
export const emailSuggestion = (t) => {
  if (!t || typeof t !== "string") return "";
  const at = t.indexOf("@");
  if (at < 1) return "";
  const rest = t.slice(at + 1);
  const hit = DOMAINS.find((d) => d.startsWith(rest) && d !== rest);
  return hit ? t.slice(0, at + 1) + hit : "";
};
export function GhostComplete({ label = "Email", getSuggestion = emailSuggestion, type = "email", value, onChange, placeholder, onKeyDown, id = "ghost" }) {
  const [inner, setInner] = useState("");
  const text = value !== undefined ? value : inner;
  const [filled, setFilled] = useState(false);
  const sug = getSuggestion ? getSuggestion(text) : "";
  const accept = () => {
    if (sug) {
      if (onChange) onChange(sug);
      else setInner(sug);
      setFilled(true);
    }
  };
  return (
    <div className="tf">
      {label && <label className="tf__label" htmlFor={id}>{label}</label>}
      <div className="ghost">
        <div className="tf__box ghost__layer" aria-hidden>{text}<span>{sug && text ? sug.slice(text.length) : ""}</span></div>
        <input id={id} type={type} className="tf__box ghost__input" autoComplete={type === "email" ? "email" : "off"} value={text}
          placeholder={placeholder}
          onChange={(e) => {
            const val = e.target.value;
            setFilled(false);
            if (onChange) onChange(val);
            else setInner(val);
          }}
          onKeyDown={(e) => {
            if (sug && (e.key === "Tab" || (e.key === "ArrowRight" && e.target.selectionStart === text.length))) {
              e.preventDefault();
              accept();
            } else if (onKeyDown) {
              onKeyDown(e);
            }
          }} />
        {sug && <button type="button" className="ghost__tab" onClick={accept} aria-label={`Use ${sug}`}>Tab</button>}
        {filled && <span className="ghost__check" aria-hidden>✓</span>}
      </div>
      <span className="tf__hint" data-tone={filled ? "ok" : ""}>{filled ? "Filled in for you" : sug ? "Press Tab or → to accept" : ""}</span>
    </div>
  );
}
