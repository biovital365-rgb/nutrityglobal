import { login, signup } from "@/actions/auth-actions";

export default function AuthPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Acceso Nutrity Global</h2>
        
        {searchParams?.error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
            {searchParams.error}
          </div>
        )}

        <form className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="tu@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              formAction={login}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
            >
              Iniciar Sesión
            </button>
            <button
              formAction={signup}
              className="flex-1 bg-white border-2 border-green-600 text-green-600 py-2 rounded-lg font-medium hover:bg-green-50 transition"
            >
              Registrarse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
