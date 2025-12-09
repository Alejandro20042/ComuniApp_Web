import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeModeProvider } from './components/ThemeModeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeModeProvider>
      <App />
    </ThemeModeProvider>
  </StrictMode>,
)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      console.log("✅ SW registrado", reg);
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "SOLICITUD_SYNCED") {
          console.log("🔔 Solicitud sincronizada:", event.data.payload);
        }
      });
    } catch (err) {
      console.error("❌ Error al registrar SW:", err);
    }
  });
}