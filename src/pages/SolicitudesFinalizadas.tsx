
export default function SolicitudesFinalizadas() {

    return (
        <div className="p-4 sm:p-6 bg-white shadow rounded">
            <h1 className="text-xl sm:text-2xl font-bold mb-4">📂 Solicitudes Finalizadas</h1>

            <p className="text-sm sm:text-base">No hay solicitudes finalizadas.</p>

            <ul className="space-y-4">

                <li
                    className="border p-3 sm:p-4 rounded bg-gray-50 hover:bg-gray-100 transition"
                >
                    <h2 className="text-base sm:text-lg font-semibold"></h2>
                    <p className="text-sm sm:text-base"></p>
                    <p className="text-xs sm:text-sm text-gray-600">
                        Estado: <span className="text-green-600"></span>
                    </p>
                    Fecha:{" "}
                    
                </li>

            </ul>

        </div>
    );
}
