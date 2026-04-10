import { useState, useEffect, useCallback } from "react";

type EC2Status =
  | "running"
  | "stopped"
  | "pending"
  | "stopping"
  | "shutting-down"
  | "terminated"
  | "unknown";

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || "";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "";
const EC2_CONTROL_URL = import.meta.env.VITE_EC2_CONTROL_URL || "";

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [ec2Status, setEc2Status] = useState<EC2Status>("unknown");
  const [ec2Ip, setEc2Ip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Invalid credentials");
    }
  };

  const fetchStatus = useCallback(async () => {
    if (!EC2_CONTROL_URL) return;
    try {
      const res = await fetch(`${EC2_CONTROL_URL}/status`, { method: "GET" });
      const data = await res.json();
      setEc2Status(data.status || "unknown");
      setEc2Ip(data.publicIp || null);
    } catch {
      setEc2Status("unknown");
    }
  }, []);

  const controlEC2 = async (action: "start" | "stop") => {
    if (!EC2_CONTROL_URL) return;
    setLoading(true);
    setActionMessage("");
    try {
      const res = await fetch(`${EC2_CONTROL_URL}/${action}`, {
        method: "POST",
      });
      const data = await res.json();
      setActionMessage(data.message || `EC2 ${action} requested`);
      // Poll status after action
      setTimeout(fetchStatus, 3000);
      setTimeout(fetchStatus, 8000);
      setTimeout(fetchStatus, 15000);
    } catch (err) {
      setActionMessage(`Error: Failed to ${action} EC2`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchStatus]);

  const statusColor: Record<string, string> = {
    running: "text-green-500",
    stopped: "text-red-500",
    pending: "text-yellow-500",
    stopping: "text-yellow-500",
    "shutting-down": "text-orange-500",
    terminated: "text-gray-500",
    unknown: "text-gray-400",
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#1e1e1e]">
        <form
          onSubmit={handleLogin}
          className="bg-[#2a2a2a] p-8 rounded-2xl shadow-2xl w-[380px] flex flex-col gap-5"
        >
          <h1 className="text-2xl font-bold text-white text-center">
            AWS Admin Panel
          </h1>
          <p className="text-gray-400 text-sm text-center">
            Sign in to manage infrastructure
          </p>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#3a3a3a] text-white border border-[#555] focus:border-[#fa6f1e] focus:outline-none transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#3a3a3a] text-white border border-[#555] focus:border-[#fa6f1e] focus:outline-none transition"
          />

          {loginError && (
            <p className="text-red-400 text-sm text-center">{loginError}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#fa6f1e] text-white font-semibold hover:bg-[#e55e10] transition cursor-pointer"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="w-full min-h-screen bg-[#1e1e1e] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">AWS Dashboard</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-gray-400 hover:text-white transition cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* EC2 Control Card */}
        <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">
                EC2 Backend Server
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Controls API + PostgreSQL (Docker)
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Status</p>
              <p
                className={`text-lg font-bold capitalize ${statusColor[ec2Status] || "text-gray-400"}`}
              >
                {ec2Status}
              </p>
            </div>
          </div>

          {ec2Ip && (
            <div className="mb-4 p-3 bg-[#3a3a3a] rounded-lg">
              <p className="text-sm text-gray-400">Elastic IP</p>
              <p className="text-white font-mono">{ec2Ip}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => controlEC2("start")}
              disabled={loading || ec2Status === "running" || ec2Status === "pending"}
              className="flex-1 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {loading ? "..." : "Start EC2"}
            </button>
            <button
              onClick={() => controlEC2("stop")}
              disabled={loading || ec2Status === "stopped" || ec2Status === "stopping"}
              className="flex-1 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {loading ? "..." : "Stop EC2"}
            </button>
          </div>

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="w-full mt-3 py-2 rounded-lg bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a] transition cursor-pointer"
          >
            Refresh Status
          </button>

          {actionMessage && (
            <p className="mt-4 text-center text-sm text-[#fa6f1e]">
              {actionMessage}
            </p>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 bg-[#2a2a2a] rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-3">Info</h3>
          <ul className="text-gray-400 text-sm space-y-2">
            <li>
              <span className="text-green-400 font-bold">Start</span> — Boots
              the EC2 instance. Docker auto-starts the FastAPI backend +
              PostgreSQL.
            </li>
            <li>
              <span className="text-red-400 font-bold">Stop</span> — Shuts down
              the EC2 instance. Backend and DB go offline. Data persists.
            </li>
            <li>
              Status auto-refreshes every 15 seconds. Transitions take ~30-60
              seconds.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
