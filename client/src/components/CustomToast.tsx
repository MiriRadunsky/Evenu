import { CheckCircle, AlertTriangle, Info } from "lucide-react";

interface ToastProps {
  type: "success" | "error" | "info";
  title: string;
  message?: string;
}

export function showToast({ type, title, message }: ToastProps) {
  const id = "custom-toast";

  // מחיקה אם כבר קיים
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const div = document.createElement("div");
  div.id = id;

  div.className = `
    fixed top-4 left-1/2 -translate-x-1/2 z-[9999] 
    min-w-[280px] max-w-[90%] px-4 py-3 rounded-xl shadow-lg
    text-white flex items-start gap-3 animate-in fade-in slide-in-from-top-5
  `;

  let icon = null;
  let bg = "";

  switch (type) {
    case "success":
      icon = <CheckCircle className="w-6 h-6 text-white" />;
      bg = "bg-green-600";
      break;
    case "error":
      icon = <AlertTriangle className="w-6 h-6 text-white" />;
      bg = "bg-red-600";
      break;
    case "info":
      icon = <Info className="w-6 h-6 text-white" />;
      bg = "bg-blue-600";
      break;
  }

  div.innerHTML = `
    <div class="${bg} px-4 py-3 rounded-xl flex items-start gap-3" style="direction: rtl">
      <div class="mt-1">${icon}</div>
      <div>
        <p class="font-bold text-lg">${title}</p>
        ${message ? `<p class="text-sm opacity-90 mt-1">${message}</p>` : ""}
      </div>
    </div>
  `;

  document.body.appendChild(div);

  setTimeout(() => {
    div.classList.add("animate-out", "fade-out", "slide-out-to-top-5");
    setTimeout(() => div.remove(), 300);
  }, 2500);
}
