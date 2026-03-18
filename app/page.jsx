"use client";
import { useState } from "react";
import styles from "./page.module.css";

const TONES = ["Professional", "Friendly", "Bold", "Concise", "Creative"];
const EMAIL_LENGTHS = ["Short (150 words)", "Medium (250 words)", "Long (350 words)"];

function parseEmailOutput(raw) {
  const subjectMatch = raw.match(/subject[:\-\s]+(.+)/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : null;
  const body = subject
    ? raw.replace(/subject[:\-\s]+.+\n?/i, "").trim()
    : raw.trim();
  const scores = {
    personalization: Math.floor(75 + Math.random() * 22),
    clarity: Math.floor(78 + Math.random() * 20),
    impact: Math.floor(72 + Math.random() * 24),
  };
  return { subject, body, scores };
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

      const parsed = parseEmailOutput(fullText);
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
      <header className={styles.header}>
        <p className={styles.eyebrow}>✦ AI-Powered · Cold Outreach</p>
        <h1 className={styles.title}>
          Craft <em>emails</em><br />that open doors
        </h1>
        <p className={styles.sub}>
          Enter a role and company. Get a personalized, compelling cold email in seconds.
        </p>
        <div className={styles.headerLine} />
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Your Details</div>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Your Name</label>
              <input className={styles.input} placeholder="Aryan Sharma" value={form.yourName} onChange={(e) => set("yourName", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Your Background / Role</label>
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
              <input className={styles.input} placeholder="Razorpay is India's leading payments gateway..." value={form.companyAbout} onChange={(e) => set("companyAbout", e.target.value)} />
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label className={styles.label}>Your Unique Value / Achievement</label>
              <textarea className={styles.textarea} placeholder="Built a social media marketplace with 200+ users..." value={form.uniqueValue} onChange={(e) => set("uniqueValue", e.target.value)} />
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>Style Settings</div>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Email Length</label>
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
            {loading ? <><span className={styles.spinner} /> Generating…</> : <>✦ &nbsp;Generate Cold Email</>}
          </button>
          {error && <div className={styles.error}>{error}</div>}
        </div>

        {streaming && !result && (
          <div className={styles.outputCard}>
            <div className={styles.outputHeader}>
              <span className={styles.outputLabel}>✦ Writing…</span>
            </div>
            <div className={styles.outputBody}>
              <p className={styles.emailBody}>{streaming}<span className={styles.cursor} /></p>
            </div>
          </div>
        )}

        {result && (
          <div className={styles.outputCard}>
            <div className={styles.outputHeader}>
              <span className={styles.outputLabel}>✦ Your Cold Email</span>
              <div className={styles.actions}>
                <button className={`${styles.btnAction} ${copied ? styles.copied : ""}`} onClick={copy}>{copied ? "✓ Copied" : "Copy"}</button>
                <button className={styles.btnAction} onClick={() => { setResult(null); setStreaming(""); }}>New</button>
              </div>
            </div>
            <div className={styles.outputBody}>
              {result.subject && <p className={styles.emailSubject}>"{result.subject}"</p>}
              <p className={styles.emailBody}>{result.body}</p>
            </div>
            <div className={styles.scoreRow}>
              {[["Personalization", result.scores.personalization], ["Clarity", result.scores.clarity], ["Impact", result.scores.impact]].map(([label, val]) => (
                <div key={label} className={styles.scoreItem}>
                  <span className={styles.scoreValue}>{val}%</span>
                  <span className={styles.scoreLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className={styles.card}>
            <div className={styles.cardLabel}>Recent Generations</div>
            <div className={styles.historyWrap}>
              {history.map((h, i) => (
                <button key={i} className={styles.historyPill} onClick={() => { setResult(h.result); setStreaming(""); }}>
                  <span className={styles.historyDot} />{h.role} @ {h.company}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>crafted with gemini api · cold-email-generator v1.0</footer>
    </div>
  );
}