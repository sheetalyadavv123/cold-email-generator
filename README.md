# ✦ AI Cold Email Generator

> A full-stack AI-powered SaaS that generates personalized cold emails for job applications in seconds — with real-time streaming, tone control, and a beautiful pink editorial UI.

🌐 **Live Demo** → [cold-email-generator-livid.vercel.app](https://cold-email-generator-livid.vercel.app)


---

## ✦ Features

- 🤖 **AI-Powered** — Uses Groq (LLaMA 3.3 70B) to write personalized, human-sounding emails
- ⚡ **Real-time Streaming** — Watch your email generate word by word, live
- 🎨 **5 Tone Styles** — Professional, Friendly, Bold, Concise, Creative
- 📏 **Length Control** — Short, Medium, or Long emails
- 📋 **One-click Copy** — Copy the full email instantly
- 📊 **Quality Scores** — Personalization, Clarity, and Impact scores for every email
- 🕓 **Recent History** — Quickly reload your last 5 generated emails
- 📱 **Fully Responsive** — Works on mobile, tablet, and desktop

---

## ✦ Tech Stack

### Frontend
| Tech | Usage |
|---|---|
| Next.js 14 | React framework, App Router |
| CSS Modules | Scoped styling, zero runtime CSS-in-JS |
| Playfair Display + Jost | Typography |
| Vercel | Deployment |

### Backend (Custom API)
| Tech | Usage |
|---|---|
| Node.js + Express | Custom REST API server |
| Groq SDK | LLaMA 3.3 70B via Groq API |
| Server-Sent Events (SSE) | Real-time streaming |
| Railway | Deployment |

---

## ✦ Architecture

```
Browser (Next.js)
      ↓  POST /api/generate-email
Next.js API Route (proxy)
      ↓  forwards request
Custom Express API (Railway)
      ↓  calls with streaming
Groq API (LLaMA 3.3 70B)
      ↑  streams tokens back
Browser renders live
```

## ✦ How It Works

1. User fills in job role, company, background, and tone
2. Frontend sends a POST request to the Next.js API route
3. Next.js forwards the request to the custom Express API on Railway
4. Express builds a detailed prompt and calls Groq with streaming enabled
5. Groq streams tokens back through Server-Sent Events (SSE)
6. The browser renders each token in real time as it arrives
7. Subject line is extracted, quality scores are calculated, and the result is displayed

---

## ✦ Environment Variables

### `cold-email-api/.env`
| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Free API key from console.groq.com |



