import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function useAppShortcuts() {
  const navigate = useNavigate();

  // 'n' for New Transaction
  useHotkeys('n', (e) => {
    e.preventDefault();
    navigate("/add");
    toast.success("Shortcut: New Transaction", { icon: "⚡" });
  }, { enableOnFormTags: false });

  // 'd' for Dashboard
  useHotkeys('d', (e) => {
    e.preventDefault();
    navigate("/dashboard");
    toast.success("Shortcut: Dashboard", { icon: "⚡" });
  }, { enableOnFormTags: false });

  // 's' for Summary
  useHotkeys('s', (e) => {
    e.preventDefault();
    navigate("/summary");
    toast.success("Shortcut: Monthly Summary", { icon: "⚡" });
  }, { enableOnFormTags: false });

  // 't' for Transactions
  useHotkeys('t', (e) => {
    e.preventDefault();
    navigate("/transactions");
    toast.success("Shortcut: Transactions", { icon: "⚡" });
  }, { enableOnFormTags: false });
}
