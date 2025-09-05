import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";   // 👈


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();                 // 👈
  const [username, setUsername] = useState("EnzoTest");
  const [password, setPassword] = useState("Enro1234");
  const [err, setErr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null); setLoading(true);
    try { await login(username, password); navigate("/"); } catch { setErr("Credenciales inválidas"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={onSubmit} className="bg-white w-full max-w-sm p-6 rounded-2xl shadow space-y-3">
        <h1 className="text-xl font-semibold text-center">Login</h1>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <input className="w-full border rounded p-2" placeholder="Usuario" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="w-full border rounded p-2" type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded">{loading?'Ingresando…':'Entrar'}</button>
      </form>
    </div>
  );
}
