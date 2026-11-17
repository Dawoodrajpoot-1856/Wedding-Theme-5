"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Volume2,
  VolumeX,
  Heart,
  CheckCircle,
  Gift,
  Sparkles,
  Palette,
  CalendarPlus,
  Share2,
  Copy,
} from "lucide-react";

/* =========================================================================
   ✅ SIRF YAHAN SE SAB KUCH CHANGE KARO (names, date, venue, program, kahani)
   - Date ISO format mein hai: "YYYY-MM-DDTHH:mm:ss+05:00" (+05:00 = Pakistan time)
   - Countdown khud Walima ki taraf chalta hai
   - Rang URL se bhi badal sakte ho:  /card?theme=emerald&to=Ahmed
   ========================================================================= */
const WEDDING = {
  groomName: "Ali",
  groomParents: "Son of Mr. & Mrs. Ahmed",
  brideName: "Ayesha",
  brideParents: "Daughter of Mr. & Mrs. Hassan",

  defaultTheme: "royal" as ThemeKey, // royal | emerald | midnight | blush
  showThemePicker: true, // final card bhejte waqt false kar do
  whatsapp: "923001234567", // RSVP is number par WhatsApp se jayega (country code ke sath, + ke baghair)
  musicSrc: "/sajna.mp3",

  events: [
    {
      id: "walima",
      title: "Walima",
      tagline: "Dua aur dawat",
      start: "2026-12-29T19:00:00+05:00",
      venue: "Royal Palm Golf & Country Club",
      address: "Bab-e-Azam Grand Marquee, Canal Bank Road, Lahore",
      mapsLink: "https://maps.google.com",
      program: [
        { time: "06:30 PM", label: "Mehmanon ka istiqbal" },
        { time: "07:00 PM", label: "Dulha dulhan ki aamad" },
        { time: "07:30 PM", label: "Dua aur khana" },
        { time: "09:30 PM", label: "Rukhsati" },
      ],
    },
  ],

  // Hamari kahani (apni asli baatein likh dein)
  story: [
    {
      when: "Pehli mulaqat",
      text: "Ek chhoti si mulaqat jo zindagi ka sab se khoobsurat mod bani.",
    },
    {
      when: "Rishta",
      text: "Dono khandaanon ne dilon ke saath haath bhi milaye.",
    },
    { when: "Nikkah", text: "Allah ke naam par hum ek ho gaye." },
    {
      when: "Walima",
      text: "Ab aap sab ki duaon ke saath nayi zindagi ka aaghaz.",
    },
  ],

  // Mehmanon ke liye hidayat
  guidelines: [
    { title: "Libaas", text: "Rawayati ya formal libaas pasand kiya jaye ga." },
    { title: "Parking", text: "Venue ke andar parking mojood hai." },
    { title: "Waqt", text: "Barae meherbani waqt par tashreef layein." },
  ],
};

/* ============================ THEMES (RANG) ============================ */
type ThemeKey = "royal" | "emerald" | "midnight" | "blush";

const THEMES: Record<
  ThemeKey,
  { name: string; dot: string; petals: string[]; vars: Record<string, string> }
> = {
  royal: {
    name: "Royal Maroon",
    dot: "#8E1F2A",
    petals: ["#F3C9CB", "#FFF2D1", "#E8C87A", "#FFFFFF"],
    vars: {
      "--bg1": "#FFFFFF",
      "--bg2": "#EFE4D2",
      "--paper": "#FFFDF9",
      "--paper2": "#F8EEDC",
      "--ink": "#2C1E16",
      "--muted": "#7A6451",
      "--accent": "#8E1F2A",
      "--accent2": "#5E1119",
      "--on-accent": "#FFF8EE",
      "--gold": "#B8902F",
      "--line": "rgba(184,144,47,.45)",
      "--env": "#F3E7D0",
    },
  },
  emerald: {
    name: "Emerald Nikkah",
    dot: "#0F5B45",
    petals: ["#CFE8D6", "#F6EBC4", "#C2A04A", "#FFFFFF"],
    vars: {
      "--bg1": "#F7FBF7",
      "--bg2": "#D8E8DB",
      "--paper": "#FBFEFB",
      "--paper2": "#E4F0E6",
      "--ink": "#10261C",
      "--muted": "#4F6B5C",
      "--accent": "#0F5B45",
      "--accent2": "#093A2C",
      "--on-accent": "#F4FBF6",
      "--gold": "#B08D3C",
      "--line": "rgba(176,141,60,.5)",
      "--env": "#DCEADF",
    },
  },
  midnight: {
    name: "Midnight Gold",
    dot: "#1B2347",
    petals: ["#E3C77A", "#F2E8C9", "#8D9AD1", "#FFFFFF"],
    vars: {
      "--bg1": "#1E2750",
      "--bg2": "#0A0E1F",
      "--paper": "#151B36",
      "--paper2": "#1E2648",
      "--ink": "#F4ECD8",
      "--muted": "#B5B1A4",
      "--accent": "#D9B45A",
      "--accent2": "#A8842F",
      "--on-accent": "#14192F",
      "--gold": "#E3C77A",
      "--line": "rgba(227,199,122,.45)",
      "--env": "#1B2347",
    },
  },
  blush: {
    name: "Rose Blush",
    dot: "#B0476A",
    petals: ["#F8CFD9", "#FFE9D6", "#E7A4B8", "#FFFFFF"],
    vars: {
      "--bg1": "#FFFFFF",
      "--bg2": "#F7DDE3",
      "--paper": "#FFFAFA",
      "--paper2": "#FBE6EA",
      "--ink": "#3A1F2B",
      "--muted": "#8A6070",
      "--accent": "#B0476A",
      "--accent2": "#7F2748",
      "--on-accent": "#FFF6F8",
      "--gold": "#C28F72",
      "--line": "rgba(194,143,114,.5)",
      "--env": "#F8E2E7",
    },
  },
};

/* ============================ HELPERS ============================ */
const PK = "Asia/Karachi";
const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: PK,
  }).format(new Date(iso));
const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: PK,
  }).format(new Date(iso));

const gcalLink = (e: (typeof WEDDING.events)[number]) => {
  const s = new Date(e.start);
  const end = new Date(s.getTime() + 4 * 3600 * 1000);
  const f = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const t = `${e.title} - ${WEDDING.groomName} & ${WEDDING.brideName}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    t,
  )}&dates=${f(s)}/${f(end)}&location=${encodeURIComponent(
    `${e.venue}, ${e.address}`,
  )}`;
};

/* ============================ SCRATCH BOX ============================ */
function ScratchBox({ onRevealed }: { onRevealed: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const done = useRef(false);
  const [revealed, setRevealed] = useState(false);

  const paintCover = useCallback(() => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || done.current) return;
    const { width: w, height: h } = c;
    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#E5C158");
    g.addColorStop(0.3, "#FFF3CC");
    g.addColorStop(0.55, "#C49A2D");
    g.addColorStop(0.8, "#F7E6AE");
    g.addColorStop(1, "#997316");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(90,60,5,.45)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.fillStyle = "#4A3205";
    ctx.textAlign = "center";
    ctx.font = "bold 14px 'Cinzel Decorative', serif";
    ctx.fillText("✧ SCRATCH HERE ✧", w / 2, h / 2 - 2);
    ctx.font = "italic 14px 'Cormorant Garamond', serif";
    ctx.fillText("Ungli ya mouse se ragdein", w / 2, h / 2 + 20);
  }, []);

  useEffect(() => {
    paintCover();
  }, [paintCover]);

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const r = c.getBoundingClientRect();
    const k = c.width / r.width;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(
      (e.clientX - r.left) * k,
      (e.clientY - r.top) * k,
      20,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  };

  const checkProgress = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || done.current) return;
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 64) {
      total++;
      if (data[i] === 0) clear++;
    }
    if (clear / total > 0.35) {
      done.current = true;
      setRevealed(true);
      onRevealed();
    }
  };

  return (
    <div className="scratch">
      <div className="scratch-under">
        <Sparkles size={18} color="#8E1F2A" />
        <h4>VIP Guest Table Reserved</h4>
        <p>“Aap ki tashreef hamari nayi zindagi ka sab se qeemti tohfa hai.”</p>
      </div>
      <canvas
        ref={canvasRef}
        width={330}
        height={125}
        style={{
          opacity: revealed ? 0 : 1,
          pointerEvents: revealed ? "none" : "auto",
        }}
        onPointerDown={(e) => {
          drawing.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          scratch(e);
        }}
        onPointerMove={(e) => drawing.current && scratch(e)}
        onPointerUp={() => {
          drawing.current = false;
          checkProgress();
        }}
        onPointerCancel={() => (drawing.current = false)}
      />
    </div>
  );
}

/* ============================ MAIN COMPONENT ============================ */
export default function WeddingCard() {
  const [themeKey, setThemeKey] = useState<ThemeKey>(WEDDING.defaultTheme);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [guest, setGuest] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [ameen, setAmeen] = useState(0);

  // RSVP
  const [name, setName] = useState("");
  const [count, setCount] = useState("1");
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const theme = THEMES[themeKey];

  // URL se ?theme=emerald&to=Ahmed padho + ameen count
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("theme") as ThemeKey | null;
    if (t && THEMES[t]) setThemeKey(t);
    const to = p.get("to");
    if (to) {
      setGuest(to);
      setName(to);
    }
    try {
      setAmeen(Number(localStorage.getItem("wedding_ameen") || 0));
    } catch {}
  }, []);

  // Live clock (har second)
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const nextEvent =
    now === null
      ? null
      : (WEDDING.events.find((e) => Date.parse(e.start) > now) ?? null);
  const allDone = now !== null && !nextEvent;
  const diff =
    nextEvent && now !== null ? Date.parse(nextEvent.start) - now : 0;
  const parts = {
    Days: Math.floor(diff / 86400000),
    Hours: Math.floor(diff / 3600000) % 24,
    Mins: Math.floor(diff / 60000) % 60,
    Secs: Math.floor(diff / 1000) % 60,
  };

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const petals = useCallback(() => {
    for (let i = 0; i < 70; i++) {
      const el = document.createElement("div");
      const s = Math.random() * 12 + 8;
      Object.assign(el.style, {
        position: "fixed",
        left: Math.random() * 100 + "vw",
        top: "-25px",
        width: s + "px",
        height: s * 1.3 + "px",
        background:
          theme.petals[Math.floor(Math.random() * theme.petals.length)],
        borderRadius: "80% 0 80% 0",
        zIndex: "99999",
        pointerEvents: "none",
        opacity: "0.95",
        transition:
          "transform 3.8s cubic-bezier(.2,.8,.25,1), opacity 3.8s ease",
      });
      document.body.appendChild(el);
      setTimeout(() => {
        el.style.transform = `translate(${Math.random() * 220 - 110}px,105vh) rotate(${Math.random() * 720}deg)`;
        el.style.opacity = "0";
      }, 20);
      setTimeout(() => el.remove(), 3900);
    }
  }, [theme]);

  const openCard = () => {
    if (opening) return;
    setOpening(true);
    audioRef.current
      ?.play()
      .then(() => setPlaying(true))
      .catch(() => {});
    setTimeout(() => {
      setUnlocked(true);
      petals();
    }, 1100);
  };

  const toggleMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  };

  const sayAmeen = () => {
    const n = ameen + 1;
    setAmeen(n);
    try {
      localStorage.setItem("wedding_ameen", String(n));
    } catch {}
    if (n === 1 || n % 10 === 0) petals();
  };

  const copyAddress = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flash("Address copy ho gaya");
    } catch {
      flash("Copy nahi ho saka");
    }
  };

  const shareCard = async () => {
    const url = window.location.href.split("?")[0];
    const text = `${WEDDING.groomName} & ${WEDDING.brideName} ki Walima ka dawat naama`;
    try {
      if (navigator.share) {
        await navigator.share({ title: text, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      flash("Card ka link copy ho gaya");
    } catch {}
  };

  const submitRSVP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const msg =
      `Assalam o Alaikum! ${name.trim()} ` +
      (attending === "yes"
        ? `inshaAllah Walima mein shamil hoon ga/gi (${count} mehman).`
        : "afsos, shamil nahi ho sakoon ga/gi.") +
      (note.trim() ? ` ${note.trim()}` : "");
    try {
      localStorage.setItem(
        "wedding_rsvp",
        JSON.stringify({ name, count, attending, note }),
      );
    } catch {}
    setSent(true);
    petals();
    window.open(
      `https://wa.me/${WEDDING.whatsapp}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  const initials = `${WEDDING.groomName[0]}${WEDDING.brideName[0]}`;

  return (
    <div
      className="wc-root"
      style={{
        ...(theme.vars as React.CSSProperties),
        padding: unlocked ? "56px 14px 110px" : "16px",
      }}
    >
      <audio ref={audioRef} src={WEDDING.musicSrc} loop preload="auto" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Great+Vibes&family=Amiri:wght@700&display=swap"
      />
      <style>{CSS}</style>
      <div className="wc-bg" />

      {/* Theme picker */}
      {WEDDING.showThemePicker && (
        <div className="picker">
          <button
            className="pill"
            onClick={() => setPickerOpen((v) => !v)}
            aria-label="Change colours"
          >
            <Palette size={16} />
            <span>{theme.name}</span>
          </button>
          {pickerOpen && (
            <div className="picker-list">
              {(Object.keys(THEMES) as ThemeKey[]).map((k) => (
                <button
                  key={k}
                  className={"swatch" + (k === themeKey ? " on" : "")}
                  onClick={() => {
                    setThemeKey(k);
                    setPickerOpen(false);
                  }}
                  title={THEMES[k].name}
                >
                  <i style={{ background: THEMES[k].dot }} />
                  {THEMES[k].name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Music */}
      {unlocked && (
        <button className="pill music" onClick={toggleMusic}>
          {playing ? <Volume2 size={17} /> : <VolumeX size={17} />}
          <span>{playing ? "Music on" : "Music off"}</span>
        </button>
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      {/* ================= ENVELOPE ================= */}
      <AnimatePresence>
        {!unlocked && (
          <motion.div
            className="env"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 1.25,
              filter: "blur(14px)",
              transition: { duration: 0.8 },
            }}
            transition={{ duration: 0.9 }}
            onClick={openCard}
            role="button"
            aria-label="Open invitation"
          >
            <div className="env-dots" />
            <div className="env-left" />
            <div className="env-right" />
            <div className="env-bottom" />
            <div className="env-names">
              <span className="script">
                {WEDDING.groomName} & {WEDDING.brideName}
              </span>
              <small>Walima ka dawat naama</small>
            </div>
            <motion.div
              className="env-flap"
              animate={opening ? { rotateX: 180 } : { rotateX: 0 }}
              transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
            />
            <motion.div
              className="seal"
              animate={
                opening
                  ? { scale: 0, opacity: 0, y: -20 }
                  : { scale: [1, 1.06, 1] }
              }
              transition={
                opening
                  ? { duration: 0.4 }
                  : { duration: 2.6, repeat: Infinity }
              }
            >
              <span className="script">{initials}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= CARD ================= */}
      {unlocked && (
        <motion.div
          className="card"
          initial={{ opacity: 0, scale: 0.7, filter: "blur(12px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="frame1" />
          <div className="frame2" />

          <main className="main">
            <div className="bismillah">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            {guest && <p className="dear">Dear {guest},</p>}

            {/* HERO */}
            <div className="hero">
              <div className="ring" />
              <div className="ring r2" />
              <div className="mono">
                <span className="script">{initials}</span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                  style={{ display: "inline-flex" }}
                >
                  <Heart size={18} fill="var(--accent)" stroke="none" />
                </motion.span>
              </div>
            </div>

            <h1 className="script name">{WEDDING.groomName}</h1>
            <p className="parents">{WEDDING.groomParents}</p>
            <span className="script amp">&</span>
            <h1 className="script name">{WEDDING.brideName}</h1>
            <p className="parents">{WEDDING.brideParents}</p>

            <p className="invite">
              Aap ko apni Walima ki khushiyon mein shamil hone ki dil se dawat
              dete hain
            </p>

            <div className="orn">
              <i />
              <b>✦</b>
              <i />
            </div>

            {/* COUNTDOWN */}
            <section className="block">
              <h3 className="label">
                {allDone
                  ? "Alhamdulillah, jashan mukammal hua"
                  : nextEvent
                    ? `${nextEvent.title} mein baqi`
                    : "Waqt ginte hue"}
              </h3>
              {!allDone && (
                <div className="count">
                  {Object.entries(parts).map(([l, v]) => (
                    <div key={l} className="cbox">
                      <strong>
                        {now === null ? "--" : String(v).padStart(2, "0")}
                      </strong>
                      <span>{l}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* EVENT + PROGRAM */}
            <section className="block">
              <h2 className="title">Walima ki Dawat</h2>
              <div className="events">
                {WEDDING.events.map((ev) => (
                  <article key={ev.id} className="ev next">
                    <h3 className="ev-title">{ev.title}</h3>
                    <p className="tag">{ev.tagline}</p>
                    <div className="meta">
                      <span>
                        <Calendar size={16} />
                        {fmtDate(ev.start)}
                      </span>
                      <span>
                        <Clock size={16} />
                        {fmtTime(ev.start)}
                      </span>
                    </div>
                    <div className="venue">
                      <MapPin size={16} />
                      <div>
                        <b>{ev.venue}</b>
                        <small>{ev.address}</small>
                      </div>
                    </div>
                    <div className="btns">
                      <a
                        className="btn"
                        href={ev.mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Navigation size={14} /> Raasta dekhein
                      </a>
                      <button
                        className="btn ghost"
                        onClick={() =>
                          copyAddress(`${ev.venue}, ${ev.address}`)
                        }
                      >
                        <Copy size={14} /> Address copy
                      </button>
                      <a
                        className="btn ghost"
                        href={gcalLink(ev)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <CalendarPlus size={14} /> Calendar mein add
                      </a>
                    </div>

                    <h4 className="sub">Shaam ka program</h4>
                    <ul className="tl">
                      {ev.program.map((p) => (
                        <li key={p.time}>
                          <i />
                          <b>{p.time}</b>
                          <span>{p.label}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            {/* DUA */}
            <section className="block dua">
              <h2 className="title">Dulha Dulhan ke liye Dua</h2>
              <p className="arabic">
                بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي
                خَيْرٍ
              </p>
              <p className="tarjuma">
                Allah aap ko barkat de, aap par barkat nazil farmaye aur aap
                dono ko khair mein jama rakhe.
              </p>
              <button className="btn" onClick={sayAmeen}>
                <Heart size={14} /> Ameen
              </button>
              <p className="hint" style={{ marginTop: 10 }}>
                {ameen > 0
                  ? `Aap ne ${ameen} baar ameen kaha. JazakAllah.`
                  : "Dua ke liye ameen par tap karein."}
              </p>
            </section>

            {/* STORY */}
            <section className="block">
              <h2 className="title">Hamari Kahani</h2>
              <ul className="tl story">
                {WEDDING.story.map((s) => (
                  <li key={s.when}>
                    <i />
                    <b>{s.when}</b>
                    <span>{s.text}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* SCRATCH */}
            <section className="block dashed">
              <h3 className="label">
                <Gift size={16} /> Khaas paigham
              </h3>
              <p className="hint">Card ko ragdein aur apna paigham dekhein</p>
              <ScratchBox onRevealed={petals} />
            </section>

            {/* GUIDELINES */}
            <section className="block">
              <h2 className="title">Mehmanon ke liye</h2>
              <div className="guides">
                {WEDDING.guidelines.map((g) => (
                  <div key={g.title} className="guide">
                    <b>{g.title}</b>
                    <span>{g.text}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* RSVP */}
            <section className="block rsvp">
              <h2 className="title">Aap ka jawab</h2>
              {!sent ? (
                <form onSubmit={submitRSVP}>
                  <input
                    required
                    placeholder="Aap ka poora naam"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <div className="seg">
                    <button
                      type="button"
                      className={attending === "yes" ? "on" : ""}
                      onClick={() => setAttending("yes")}
                    >
                      InshaAllah aaunga/aaungi
                    </button>
                    <button
                      type="button"
                      className={attending === "no" ? "on" : ""}
                      onClick={() => setAttending("no")}
                    >
                      Nahi aa sakoon ga/gi
                    </button>
                  </div>
                  {attending === "yes" && (
                    <select
                      value={count}
                      onChange={(e) => setCount(e.target.value)}
                    >
                      <option value="1">1 mehman</option>
                      <option value="2">2 mehman</option>
                      <option value="3">3 mehman</option>
                      <option value="4+">4 ya zyada (family)</option>
                    </select>
                  )}
                  <textarea
                    rows={2}
                    placeholder="Dulha dulhan ke liye dua ya paigham (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <button className="btn big" type="submit">
                    WhatsApp par jawab bhejein
                  </button>
                </form>
              ) : (
                <div className="thanks">
                  <CheckCircle size={40} color="var(--accent)" />
                  <h3>Shukriya, {name}!</h3>
                  <p>
                    Aap ka jawab bhej diya gaya hai. Hum aap ke muntazir hain.
                  </p>
                </div>
              )}
            </section>

            <div className="orn" style={{ marginTop: 36 }}>
              <i />
              <b>✦</b>
              <i />
            </div>
            <p className="thanks-line">
              Aap ki tashreef hamare liye baais-e-izzat hogi
            </p>
            <p className="foot">
              <span className="script">
                {WEDDING.groomName} & {WEDDING.brideName}
              </span>
            </p>
          </main>
        </motion.div>
      )}
    </div>
  );
}

/* ============================ STYLES ============================ */
const CSS = `
.wc-root{min-height:100vh;position:relative;overflow-x:hidden;display:flex;justify-content:center;align-items:flex-start;color:var(--ink);font-family:'Cormorant Garamond',serif;transition:background .5s,color .5s}
.wc-root *{box-sizing:border-box}
.wc-bg{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(circle at 50% 30%,var(--bg1) 0%,var(--bg2) 100%);transition:background .6s}
.script{font-family:'Great Vibes',cursive;font-weight:400}

/* picker + pills */
.picker{position:fixed;top:14px;left:14px;z-index:9999}
.pill{display:inline-flex;align-items:center;gap:8px;background:var(--paper);color:var(--ink);border:1.5px solid var(--gold);border-radius:999px;padding:8px 14px;font:600 13px 'Cormorant Garamond',serif;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.15)}
.music{position:fixed;right:16px;bottom:18px;z-index:9999}
.picker-list{margin-top:8px;background:var(--paper);border:1.5px solid var(--gold);border-radius:16px;padding:6px;display:flex;flex-direction:column;gap:2px;box-shadow:0 12px 30px rgba(0,0,0,.18)}
.swatch{display:flex;align-items:center;gap:10px;background:none;border:none;color:var(--ink);padding:8px 12px;border-radius:10px;font:600 14px 'Cormorant Garamond',serif;cursor:pointer;text-align:left}
.swatch.on,.swatch:hover{background:var(--paper2)}
.swatch i{width:16px;height:16px;border-radius:50%;border:2px solid var(--gold)}
.toast{position:fixed;left:50%;bottom:76px;transform:translateX(-50%);z-index:99999;background:var(--accent);color:var(--on-accent);padding:10px 20px;border-radius:999px;font:700 15px 'Cormorant Garamond',serif;box-shadow:0 10px 26px rgba(0,0,0,.3)}

/* envelope */
.env{position:relative;z-index:50;width:100%;max-width:400px;height:560px;margin:auto;border-radius:22px;background:var(--env);border:1.5px solid var(--gold);overflow:hidden;cursor:pointer;perspective:1400px;box-shadow:0 30px 80px rgba(0,0,0,.28)}
.env-dots{position:absolute;inset:0;background-image:radial-gradient(var(--gold) .7px,transparent .7px);background-size:18px 18px;opacity:.28}
.env-left,.env-right,.env-bottom{position:absolute;background:var(--paper2);filter:drop-shadow(0 0 6px rgba(0,0,0,.12))}
.env-left{inset:0;clip-path:polygon(0 0,0 100%,55% 56%);opacity:.9}
.env-right{inset:0;clip-path:polygon(100% 0,100% 100%,45% 56%);opacity:.9}
.env-bottom{left:0;right:0;bottom:0;height:62%;clip-path:polygon(0 100%,100% 100%,50% 0);background:var(--paper)}
.env-names{position:absolute;left:0;right:0;bottom:46px;z-index:5;text-align:center;color:var(--ink);display:flex;flex-direction:column;gap:2px}
.env-names .script{font-size:44px;line-height:1.1}
.env-names small{font-size:14px;color:var(--muted);letter-spacing:.12em}
.env-flap{position:absolute;top:0;left:0;right:0;height:57%;transform-origin:top center;clip-path:polygon(0 0,100% 0,50% 100%);background:linear-gradient(180deg,var(--accent),var(--accent2));backface-visibility:hidden;z-index:6}
.seal{position:absolute;z-index:8;left:50%;top:57%;width:92px;height:92px;margin:-46px 0 0 -46px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 35% 30%,#E2C170,var(--gold) 55%,#7A5A12);color:#3D2A05;box-shadow:0 10px 24px rgba(0,0,0,.4),inset 0 0 0 4px rgba(255,255,255,.25)}
.seal .script{font-size:36px}

/* card */
.card{position:relative;z-index:10;width:100%;max-width:640px;background:var(--paper);border:2px solid var(--line);border-radius:30px;padding:56px 22px 44px;overflow:hidden;box-shadow:0 35px 90px rgba(0,0,0,.2)}
.frame1{position:absolute;inset:11px;border:1.5px solid var(--line);border-radius:22px;pointer-events:none}
.frame2{position:absolute;inset:17px;border:1px dashed var(--line);border-radius:18px;pointer-events:none;opacity:.6}
.main{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center}
.bismillah{font-family:'Amiri',serif;font-weight:700;font-size:34px;margin-bottom:10px}
.dear{font-style:italic;font-size:20px;color:var(--muted);margin:0 0 6px}

.hero{position:relative;width:170px;height:170px;margin:8px 0 14px;display:flex;align-items:center;justify-content:center}
.ring{position:absolute;inset:0;border-radius:50%;border:2px dashed var(--gold);animation:spin 26s linear infinite}
.ring.r2{inset:14px;border:1.5px solid var(--line);animation:none}
.mono{display:flex;flex-direction:column;align-items:center;color:var(--accent)}
.mono .script{font-size:60px;line-height:1}
@keyframes spin{to{transform:rotate(360deg)}}

.name{font-size:clamp(64px,15vw,92px);line-height:1.05;margin:0;color:var(--ink)}
.parents{font-style:italic;font-size:17px;color:var(--muted);margin:2px 0 6px}
.amp{font-size:44px;color:var(--accent);margin:0}
.invite{font-size:21px;font-style:italic;max-width:420px;line-height:1.45;margin:16px 0 6px}
.orn{display:flex;align-items:center;gap:12px;width:70%;margin:18px 0 8px;color:var(--gold)}
.orn i{flex:1;height:1px;background:var(--line)}

.block{width:100%;margin-top:34px;display:flex;flex-direction:column;align-items:center}
.title{font-size:30px;font-weight:700;margin:0 0 18px;color:var(--ink)}
.sub{font-size:20px;color:var(--accent);margin:22px 0 10px}
.label{display:inline-flex;align-items:center;gap:8px;font-size:18px;font-weight:600;color:var(--accent);margin:0 0 14px;letter-spacing:.03em}
.hint{font-size:15px;color:var(--muted);margin:0 0 14px}

.count{display:flex;gap:10px;width:100%;max-width:400px;margin:0 auto}
.cbox{flex:1;background:var(--paper2);border:1.5px solid var(--line);border-radius:14px;padding:14px 4px}
.cbox strong{display:block;font-size:34px;line-height:1;color:var(--accent);font-variant-numeric:tabular-nums}
.cbox span{font-size:13px;color:var(--muted);letter-spacing:.1em}

.events{display:flex;flex-direction:column;gap:16px;width:100%}
.ev{position:relative;text-align:left;padding:24px 20px;border-radius:18px;background:var(--paper2);border:1.5px solid var(--accent);box-shadow:0 10px 28px rgba(0,0,0,.1)}
.ev-title{font-size:30px;margin:0;color:var(--accent);font-weight:700}
.tag{margin:0 0 12px;font-style:italic;color:var(--muted);font-size:16px}
.meta{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:17px;margin-bottom:12px}
.meta span,.venue{display:flex;gap:8px;align-items:center}
.meta svg,.venue svg{color:var(--accent);flex-shrink:0}
.venue{align-items:flex-start;font-size:17px}
.venue b{display:block;font-size:18px}
.venue small{font-size:15px;color:var(--muted)}
.btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
.btn{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:var(--on-accent);text-decoration:none;border:1.5px solid transparent;border-radius:999px;padding:10px 18px;font:700 14px 'Cormorant Garamond',serif;cursor:pointer}
.btn.ghost{background:transparent;color:var(--accent);border-color:var(--accent)}
.btn.big{justify-content:center;padding:15px 20px;font-size:16px;border-radius:12px}

/* timeline */
.tl{list-style:none;margin:0;padding:0 0 0 22px;position:relative;text-align:left}
.tl::before{content:"";position:absolute;left:5px;top:6px;bottom:6px;width:2px;background:var(--line)}
.tl li{position:relative;display:flex;flex-direction:column;padding:0 0 16px 10px}
.tl li:last-child{padding-bottom:0}
.tl li i{position:absolute;left:-22px;top:7px;width:12px;height:12px;border-radius:50%;background:var(--accent);border:2px solid var(--paper2)}
.tl li b{font-size:18px;color:var(--accent)}
.tl li span{font-size:17px;color:var(--ink)}
.tl.story{width:100%;max-width:440px;padding-left:26px}
.tl.story li i{left:-26px}

/* dua */
.dua{padding:30px 18px;border-radius:20px;background:var(--paper2);border:1.5px solid var(--line)}
.arabic{font-family:'Amiri',serif;font-weight:700;font-size:30px;line-height:2;margin:0 0 10px;color:var(--accent);direction:rtl}
.tarjuma{font-size:19px;font-style:italic;line-height:1.5;max-width:420px;margin:0 0 18px;color:var(--ink)}

.dashed{padding:22px 12px;border:1.5px dashed var(--gold);border-radius:20px;background:var(--paper2)}
.scratch{position:relative;width:min(330px,100%);aspect-ratio:330/125;margin:0 auto;border-radius:16px;overflow:hidden;border:1.5px solid var(--gold);box-shadow:0 10px 28px rgba(0,0,0,.18)}
.scratch-under{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;background:linear-gradient(135deg,#FFFDF8,#FAF0D6);color:#5C4A38;user-select:none}
.scratch-under h4{margin:2px 0;font-size:20px;color:#6E1B1C}
.scratch-under p{margin:0;font-size:14px;font-style:italic}
.scratch canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:grab;transition:opacity .6s}

.guides{display:flex;flex-direction:column;gap:10px;width:100%;max-width:440px}
.guide{text-align:left;padding:14px 18px;border-radius:14px;background:var(--paper2);border:1.5px solid var(--line);display:flex;flex-direction:column}
.guide b{font-size:19px;color:var(--accent)}
.guide span{font-size:17px}

.rsvp{padding:30px 18px;border:1.5px solid var(--line);border-radius:20px;background:var(--paper2)}
.rsvp form{display:flex;flex-direction:column;gap:12px;width:100%;max-width:380px;margin:0 auto}
.rsvp input,.rsvp select,.rsvp textarea{width:100%;background:var(--paper);color:var(--ink);border:1.5px solid var(--line);border-radius:10px;padding:13px 15px;font:600 16px 'Cormorant Garamond',serif;outline:none;resize:none}
.rsvp input:focus,.rsvp select:focus,.rsvp textarea:focus{border-color:var(--accent)}
.seg{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.seg button{background:var(--paper);color:var(--ink);border:1.5px solid var(--line);border-radius:10px;padding:11px 6px;font:600 14px 'Cormorant Garamond',serif;cursor:pointer}
.seg button.on{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
.thanks{display:flex;flex-direction:column;align-items:center;gap:6px}
.thanks h3{margin:4px 0;font-size:26px}
.thanks p{margin:0;font-style:italic;color:var(--muted);font-size:17px}
.thanks-line{font-style:italic;font-size:20px;color:var(--muted);margin:6px 0 0;max-width:380px}
.foot{margin:14px 0 0}
.foot .script{font-size:46px;color:var(--accent)}

@media (max-width:480px){.card{padding:50px 14px 36px}.bismillah{font-size:28px}.arabic{font-size:26px}}
@media (prefers-reduced-motion:reduce){.ring{animation:none}}
`;
