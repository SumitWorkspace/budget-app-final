import ProfilePanel from "../components/ProfilePanel";
import { useNavigate } from "react-router-dom";
import { User, Award, CheckCircle2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { getTransactions } from "../api/transactions";
import API from "../api/axios";
import { evaluateAchievements } from "../utils/smartEngine";

export default function Profile() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, goalsRes] = await Promise.all([
          getTransactions(),
          API.get("/api/goals").catch(() => ({ data: [] }))
        ]);
        setAchievements(evaluateAchievements(txRes.data, goalsRes.data));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 md:p-10 transition-colors duration-200">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* HEADER */}
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
              <User size={24} />
            </div>
          </div>
        </div>

        {/* CENTERED PANEL */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <ProfilePanel />
          </div>
        </div>

        {/* TROPHY ROOM */}
        <div className="pt-8">
          <div className="flex items-center gap-2 mb-6">
            <Award className="text-amber-500" size={24} />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trophy Room</h2>
            <span className="ml-auto text-sm text-slate-500 font-medium">
              {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
            </span>
          </div>

          {loading ? (
            <div className="h-32 flex items-center justify-center text-slate-500">Loading achievements...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center ${
                    achievement.unlocked 
                      ? "bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:scale-105" 
                      : "bg-white/5 border-white/5 opacity-50 grayscale"
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner ${
                    achievement.unlocked ? "bg-amber-100 dark:bg-amber-500/20 shadow-amber-500/20" : "bg-slate-100 dark:bg-slate-800 shadow-black/50"
                  }`}>
                    {achievement.icon}
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${achievement.unlocked ? "text-amber-600 dark:text-amber-400" : "text-slate-500"}`}>
                    {achievement.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {achievement.description}
                  </p>
                  
                  {achievement.unlocked ? (
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-lg border-2 border-[#0a0a0a]">
                      <CheckCircle2 size={12} />
                    </div>
                  ) : (
                    <div className="absolute -top-2 -right-2 bg-slate-700 text-white rounded-full p-1 shadow-lg border-2 border-[#0a0a0a]">
                      <Lock size={12} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}