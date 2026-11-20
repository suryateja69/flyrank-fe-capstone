"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
const schema = z.object({
  name: z.string().trim().min(2, "Use at least two characters.").max(80),
  email: z.email("Enter a valid email address."),
});
export function SettingsForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("leaddesk-preferences");
      if (!raw) return;
      const parsed = schema.safeParse(JSON.parse(raw));
      if (parsed.success) {
        setName(parsed.data.name);
        setEmail(parsed.data.email);
      }
    } catch {
      /* A malformed or unavailable cache leaves the form usable. */
    }
  }, []);
  return (
    <form
      className="settings-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(false);
        const result = schema.safeParse({ name, email });
        if (!result.success) {
          setErrors(
            Object.fromEntries(
              result.error.issues.map((issue) => [
                String(issue.path[0]),
                issue.message,
              ]),
            ),
          );
          return;
        }
        setErrors({});
        try {
          localStorage.setItem(
            "leaddesk-preferences",
            JSON.stringify(result.data),
          );
          setSaved(true);
        } catch {
          setErrors({
            storage:
              "This browser could not save the settings. Try allowing local storage.",
          });
        }
      }}
    >
      <h2>Workspace preferences</h2>
      <p>
        Practice settings stored on this device. These details are kept out of
        the AI conversation.
      </p>
      <label htmlFor="workspace-name">Workspace name</label>
      <input
        id="workspace-name"
        value={name}
        maxLength={80}
        onChange={(e) => {
          setName(e.target.value);
          setSaved(false);
        }}
        aria-invalid={Boolean(errors.name)}
        aria-describedby={errors.name ? "name-error" : undefined}
      />
      {errors.name && (
        <p className="field-error" id="name-error">
          {errors.name}
        </p>
      )}
      <label htmlFor="contact-email">Contact email</label>
      <input
        id="contact-email"
        type="email"
        value={email}
        maxLength={254}
        onChange={(e) => {
          setEmail(e.target.value);
          setSaved(false);
        }}
        aria-invalid={Boolean(errors.email)}
        aria-describedby={errors.email ? "email-error" : undefined}
      />
      {errors.email && (
        <p className="field-error" id="email-error">
          {errors.email}
        </p>
      )}
      <button className="primary-button" type="submit">
        Save preferences
      </button>
      {saved && <p role="status">Preferences saved on this device.</p>}
      {errors.storage && <p role="alert">{errors.storage}</p>}
    </form>
  );
}
