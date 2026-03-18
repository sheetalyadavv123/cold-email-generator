export const metadata = {
  title: "Cold Email Generator — AI-Powered Outreach",
  description: "Generate personalized cold emails for job applications using AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#0a0a0f" }}>
        {children}
      </body>
    </html>
  );
}