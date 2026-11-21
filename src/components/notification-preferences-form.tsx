"use client";

import { useEffect, useState } from "react";

const initialPreferences = { newLeads: true, leadUpdates: true, weeklySummary: false };
const preferenceLabels = {
  newLeads: "New lead notifications",
  leadUpdates: "Lead status updates",
  weeklySummary: "Weekly activity summary",
};

export function NotificationPreferencesForm() {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("leaddesk-notification-preferences");
      if (!raw) return;
      const stored = JSON.parse(raw);
      if (Object.keys(initialPreferences).every((key) => typeof stored?.[key] === "boolean")) {
        setPreferences(stored);
      }
    } catch {
      // Keep the defaults when storage is unavailable or malformed.
    }
  }, []);

  return (
    <form className="settings-form notification-preferences" onSubmit={(event) => {
      event.preventDefault();
      setMessage("");
      setError("");
      try {
        localStorage.setItem("leaddesk-notification-preferences", JSON.stringify(preferences));
        setMessage("Notification preferences saved on this device.");
      } catch {
        setError("Could not save preferences. Allow local storage and try again.");
      }
    }}>
      <h2>Notification preferences</h2>
      <p>Choose which updates you want to receive. Preferences are stored on this device; notification delivery is not connected.</p>
      <fieldset>
        <legend>Updates</legend>
        {(Object.keys(preferenceLabels) as Array<keyof typeof preferenceLabels>).map((key) => (
          <label key={key}>
            <input type="checkbox" checked={preferences[key]} onChange={(event) => {
              setPreferences({ ...preferences, [key]: event.target.checked });
              setMessage("");
              setError("");
            }} />
            {preferenceLabels[key]}
          </label>
        ))}
      </fieldset>
      <button className="primary-button" type="submit">Save notification preferences</button>
      {message && <p role="status">{message}</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
    </form>
  );
}
