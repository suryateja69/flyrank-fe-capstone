"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

const storageKey = "leaddesk-notification-preferences";
const schema = z.strictObject({
  emailNotifications: z.boolean(),
  digestFrequency: z.enum(["daily", "weekly"]),
});
type Preferences = z.infer<typeof schema>;
const defaults: Preferences = { emailNotifications: false, digestFrequency: "daily" };

export function NotificationPreferencesForm() {
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return;
      const result = schema.safeParse(JSON.parse(raw));
      if (result.success) setPreferences(result.data);
    } catch {
      setFeedback({ kind: "error", message: "Saved notification preferences could not be read. Default values are shown; you can try saving again." });
    }
  }, []);

  function update(next: Preferences) {
    setPreferences(next);
    setFeedback(null);
  }

  return (
    <form className="settings-form notification-preferences" aria-labelledby="notification-heading" onSubmit={(event) => {
      event.preventDefault();
      setFeedback(null);
      try {
        localStorage.setItem(storageKey, JSON.stringify(preferences));
        setFeedback({ kind: "success", message: "Notification preferences saved on this device." });
      } catch {
        setFeedback({ kind: "error", message: "Notification preferences could not be saved. Try allowing local storage and save again." });
      }
    }}>
      <h2 id="notification-heading">Notification preferences</h2>
      <p>Preferences are stored on this device. This practice form does not send email.</p>
      <label className="notification-toggle" htmlFor="email-notifications">
        <input id="email-notifications" type="checkbox" checked={preferences.emailNotifications} onChange={(event) => update({ ...preferences, emailNotifications: event.target.checked })} />
        Email notifications
      </label>
      <label htmlFor="digest-frequency">Digest frequency</label>
      <select id="digest-frequency" value={preferences.digestFrequency} disabled={!preferences.emailNotifications} onChange={(event) => update({ ...preferences, digestFrequency: event.target.value as Preferences["digestFrequency"] })}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>
      <button type="submit" className="primary-button">Save notification preferences</button>
      {feedback && <p role={feedback.kind === "success" ? "status" : "alert"}>{feedback.message}</p>}
    </form>
  );
}
