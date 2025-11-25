import Sidebar from "../components/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row h-screen">
            <Sidebar />
            <main className="flex-1 bg-gray-100 p-4 sm:p-6 overflow-y-auto md:ml-4">
                <div className="w-full">{children}</div>
            </main>
        </div>
    );
}