"use client";
import { useState } from "react";
import styles from "./page.module.css";

const TONES = ["Professional", "Friendly", "Bold", "Concise", "Creative"];
const EMAIL_LENGTHS = ["Short (150 words)", "Medium (250 words)", "Long (350 words)"];

function parseEmailOutput(raw, company, role) {
  const subjectMatch = raw.match(/subject[:\-\s]+(.+)/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : null;
  const body = subject
    ? raw.replace(/subject[:\-\s]+.+\n?/i, "").trim()
    : raw.trim();

  const bodyLower = body.toLowerCase();
  const wordCount = body.split(" ").length;
  const paragraphs = body.split("\n\n").length;

  const personalization = Math.min(100,
    60 +
    (company && bodyLower.includes(company.toLowerCase()) ? 15 : 0) +
    (role && bodyLower.includes(role.toLowerCase()) ? 10 : 0) +
    (bodyLower.includes("i noticed") || bodyLower.includes("i saw") || bodyLower.includes("i love") ? 10 : 0) +
    (wordCount > 150 ? 5 : 0)
  );

  const clarity = Math.min(100,
    65 +
    (paragraphs >= 3 ? 15 : 5) +
    (wordCount < 300 ? 15 : wordCount < 400 ? 8 : 3) +
    (subject && subject.length < 60 ? 5 : 0)
  );

  const impact = Math.min(100,
    60 +
    (subject && subject.length > 10 ? 15 : 0) +
    (body.includes("?") ? 10 : 0) +
    (wordCount >= 100 ? 10 : 5) +
    (bodyLower.includes("would love") || bodyLower.includes("excited") || bodyLower.includes("passionate") ? 5 : 0)
  );

  return { subject, body, scores: { personalization, clarity, impact } };
}

export default function Home() {
  const [form, setForm] = useState({
    yourName: "", yourRole: "", company: "", targetRole: "",
    companyAbout: "", uniqueValue: "", tone: "Professional",
    length: "Medium (250 words)",
  });
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.company || !form.targetRole) {
      setError("Please fill in at least the Company and Target Role.");
      return;
    }
    setError(""); setResult(null); setStreaming(""); setLoading(true);

    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Server error");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const json = JSON.parse(data);
            if (json.text) { fullText += json.text; setStreaming(fullText); }
          } catch {}
        }
      }

      const parsed = parseEmailOutput(fullText, form.company, form.targetRole);
      setResult(parsed); setStreaming("");
      setHistory((h) => [{ company: form.company, role: form.targetRole, result: parsed }, ...h.slice(0, 4)]);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(
      result.subject ? `Subject: ${result.subject}\n\n${result.body}` : result.body
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.app}>

      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.logo}>
          <span className={styles.logoDot} />
          craftmail.ai
        </div>
      </div>

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <p className={styles.eyebrow}>AI Cold Outreach</p>
            <h1 className={styles.title}>
              Craft emails
              <em>that get replies.</em>
            </h1>
            <p className={styles.sub}>
              Fill in the role and company. Get a personalized, sharp cold email — streamed live in seconds.
            </p>
          </div>
          <div className={styles.statsCol}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>10k+</span>
              <span className={styles.statLabel}>Generated</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>5</span>
              <span className={styles.statLabel}>Tone modes</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>~2s</span>
              <span className={styles.statLabel}>Avg. time</span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.divider} />

      <main className={styles.main}>

        {/* TIPS */}
        <div className={styles.tipsCard}>
          <div className={styles.tipItem}>
            <div className={styles.tipIcon}>✍️</div>
            <div className={styles.tipTitle}>Be specific</div>
            <div className={styles.tipText}>Mention a real project or achievement — generic applications get ignored</div>
          </div>
          <div className={styles.tipItem}>
            <div className={styles.tipIcon}>🎯</div>
            <div className={styles.tipTitle}>Know the company</div>
            <div className={styles.tipText}>Add a recent launch or news — shows you actually care</div>
          </div>
          <div className={styles.tipItem}>
            <div className={styles.tipIcon}>💌</div>
            <div className={styles.tipTitle}>Match the tone</div>
            <div className={styles.tipText}>Bold for startups, Professional for enterprise, Friendly for small teams</div>
          </div>
        </div>

        {/* YOUR DETAILS */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>Your Details</div>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Your Name</label>
              <input className={styles.input} placeholder="Aryan Sharma" value={form.yourName} onChange={(e) => set("yourName", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Your Background</label>
              <input className={styles.input} placeholder="Full-Stack Dev, 2nd year CS" value={form.yourRole} onChange={(e) => set("yourRole", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Target Company *</label>
              <input className={styles.input} placeholder="e.g. Razorpay" value={form.company} onChange={(e) => set("company", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Target Role *</label>
              <input className={styles.input} placeholder="e.g. SWE Intern" value={form.targetRole} onChange={(e) => set("targetRole", e.target.value)} />
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label className={styles.label}>What you know about the company</label>
              <input className={styles.input} placeholder="Razorpay recently launched Turbo UPI, India's fastest checkout..." value={form.companyAbout} onChange={(e) => set("companyAbout", e.target.value)} />
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label className={styles.label}>
                Your Unique Value
                <span style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: "9px",
                  color: form.uniqueValue.length > 250 ? "#d4526e" : "rgba(212,82,110,0.4)",
                  letterSpacing: "0.06em",
                  fontWeight: "400",
                  textTransform: "none",
                }}>
                  {form.uniqueValue.length} / 300
                </span>
              </label>
              <textarea
                className={styles.textarea}
                maxLength={300}
                placeholder="Built a social media marketplace with 200+ users, shipped 3 full-stack AI projects..."
                value={form.uniqueValue}
                onChange={(e) => set("uniqueValue", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SETTINGS */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>Style Settings</div>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Length</label>
              <select className={styles.select} value={form.length} onChange={(e) => set("length", e.target.value)}>
                {EMAIL_LENGTHS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Tone</label>
              <div className={styles.chips}>
                {TONES.map((t) => (
                  <button key={t} className={`${styles.chip} ${form.tone === t ? styles.chipActive : ""}`} onClick={() => set("tone", t)}>{t}</button>
                ))}
              </div>
            </div>
          </div>
          <button className={styles.btnGenerate} onClick={generate} disabled={loading}>
            {loading
              ? <><span className={styles.spinner} /> Crafting your email…</>
              : <>Generate Cold Email →</>
            }
          </button>
          {error && <div className={styles.error}>⚠ {error}</div>}
        </div>

      </main>

      {/* STREAMING */}
      {streaming && !result && (
        <div className={styles.outputCard} style={{ maxWidth: 860, margin: "1.25rem auto 0" }}>
          <div className={styles.outputHeader}>
            <span className={styles.outputLabel}>Writing your email</span>
          </div>
          <div className={styles.outputBody}>
            <p className={styles.emailBody}>{streaming}<span className={styles.cursor} /></p>
          </div>
        </div>
      )}

      {/* RESULT */}
      {result && (
        <div className={styles.outputCard} style={{ maxWidth: 860, margin: "1.25rem auto 0" }}>
          <div className={styles.outputHeader}>
            <span className={styles.outputLabel}>Your cold email</span>
            <div className={styles.actions}>
              <button className={`${styles.btnAction} ${copied ? styles.copied : ""}`} onClick={copy}>
                {copied ? "✓ Copied" : "Copy email"}
              </button>
              <button className={styles.btnAction} onClick={() => { setResult(null); setStreaming(""); }}>
                New email
              </button>
            </div>
          </div>
          <div className={styles.outputBody}>
            {result.subject && <p className={styles.emailSubject}>{result.subject}</p>}
            <p className={styles.emailBody}>{result.body}</p>
          </div>
          <div className={styles.scoreRow}>
            {[["Personalization", result.scores.personalization], ["Clarity", result.scores.clarity], ["Impact", result.scores.impact]].map(([label, val]) => (
              <div key={label} className={styles.scoreItem}>
                <span className={styles.scoreValue}>{val}</span>
                <span className={styles.scoreLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HISTORY */}
      {history.length > 0 && (
        <div className={styles.historyCard} style={{ maxWidth: 860, margin: "1.25rem auto 0" }}>
          <div className={styles.cardLabel}>Recent</div>
          <div className={styles.historyWrap}>
            {history.map((h, i) => (
              <button key={i} className={styles.historyPill} onClick={() => { setResult(h.result); setStreaming(""); }}>
                <span className={styles.historyDot} />{h.role} @ {h.company}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className={styles.footer}>
        <span className={styles.footerLeft}>mailcraft.ai · cold email generator</span>
        
      </footer>

    </div>
  );
}
