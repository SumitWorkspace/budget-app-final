import { useNavigate } from "react-router-dom";
import SettingsPanel from "../components/SettingsPanel";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-10 transition-colors duration-200">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* HEADER */}
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
              <SettingsIcon size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage your app preferences</p>
            </div>
          </div>
        </div>

        {/* CENTER PANEL */}
        <SettingsPanel />

      </div>
    </div>
  );
}