import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-blue-900 mb-6 tracking-tight">
          BioVigía
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
          Sistema de Tele-monitoreo Médico. Panel de acceso principal.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/paciente/nueva-medicion"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg font-medium transition-all hover:scale-105"
          >
            Ingreso Paciente
          </Link>
          <Link
            href="/medico/dashboard"
            className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl shadow-sm font-medium transition-all hover:scale-105"
          >
            Panel Médico
          </Link>
        </div>
      </div>
    </main>
  );
}
