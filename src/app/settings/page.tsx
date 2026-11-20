import { SettingsForm } from "@/components/settings-form";
export default function Settings() {
  return (
    <>
      <header className="topbar">Workspace / Settings</header>
      <div className="page-wrap">
        <div className="page-heading">
          <div>
            <p className="eyebrow">MAKE IT YOURS</p>
            <h1>Workspace settings</h1>
          </div>
        </div>
        <SettingsForm />
      </div>
    </>
  );
}
