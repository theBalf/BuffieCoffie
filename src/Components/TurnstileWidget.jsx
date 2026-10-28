import { useEffect, useRef, useState } from "react";

let turnstileScriptPromise;

function loadTurnstileScript() {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }
  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.turnstile) {
        resolve(window.turnstile);
      } else {
        turnstileScriptPromise = undefined;
        reject(new Error("بارگذاری تأیید امنیتی کامل نشد."));
      }
    };
    script.onerror = () => {
      turnstileScriptPromise = undefined;
      reject(new Error("بارگذاری تأیید امنیتی کامل نشد."));
    };
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

export default function TurnstileWidget({ siteKey, onToken }) {
  const containerRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    let widgetId;

    loadTurnstileScript()
      .then((turnstile) => {
        if (!isActive || !containerRef.current) return;
        widgetId = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onToken,
          "expired-callback": () => onToken(""),
          "error-callback": () => {
            onToken("");
            setError("تأیید امنیتی ناموفق بود. دوباره تلاش کنید.");
          },
        });
        setError("");
      })
      .catch((loadError) => {
        if (isActive) setError(loadError.message);
      });

    return () => {
      isActive = false;
      onToken("");
      if (widgetId !== undefined && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [onToken, siteKey]);

  return (
    <div>
      <div ref={containerRef} />
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
