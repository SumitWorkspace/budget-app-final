import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Signup page: redirect to Auth and auto-open signup mode
// Simplest approach: just import Auth and it handles both
import Auth from "./Auth";

export default function Signup() {
  return <Auth />;
}