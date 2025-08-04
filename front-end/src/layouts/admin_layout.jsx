import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { Outlet } from "react-router";

export default function AdminLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                <nav className="p-4 bg-gray-100 mb-4 flex items-center justify-between">
                    <SidebarTrigger className={"p-0"} />
                    <h1 className="text-xl font-semibold text-gray-700">
                        Admin Panel
                    </h1>
                </nav>

                <div className="px-2">
                    <Outlet />
                </div>
            </main>
        </SidebarProvider>
    );
}
