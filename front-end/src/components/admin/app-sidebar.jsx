import {
    Calendar,
    Home,
    Inbox,
    Search,
    Settings,
    LogOut,
    MapPin,
    User,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/admin",
        icon: Home,
        description: "Overview & Analytics",
    },
    {
        title: "Market",
        url: "/admin/market",
        icon: MapPin,
        description: "Manage Markets",
    },
];

export function AppSidebar() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <Sidebar className="border-r-0">
            <SidebarContent>
                {/* Header Section */}
                <SidebarGroup className="p-6 border-b">
                    <SidebarGroupLabel className="p-0">
                        <div className="text-center">
                            <h1 className="text-xl font-semibold">
                                Market Finder
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                Admin Panel
                            </p>
                        </div>
                    </SidebarGroupLabel>
                </SidebarGroup>

                {/* Navigation Section */}
                <SidebarGroup className="p-6 flex-1">
                    <SidebarGroupLabel className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-4">
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-2">
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <NavLink
                                        to={item.url}
                                        className={({ isActive }) =>
                                            `group relative flex items-center p-3 rounded-xl transition-all duration-200 ${
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-lg"
                                                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                                            }`
                                        }
                                        end={item.url === "/admin"}
                                    >
                                        <div
                                            className={`p-2 rounded-lg ${({
                                                isActive,
                                            }) =>
                                                isActive
                                                    ? "bg-primary-foreground/20"
                                                    : "bg-accent/50 group-hover:bg-accent"}`}
                                        >
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <span className="text-sm font-medium">
                                                {item.title}
                                            </span>
                                            <p className="text-xs opacity-75 mt-0.5">
                                                {item.description}
                                            </p>
                                        </div>
                                    </NavLink>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* User Profile & Logout Section */}
                <SidebarGroup className="p-6 border-t">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button className="group relative flex items-center p-3 rounded-xl transition-all duration-200 text-destructive hover:bg-destructive/10 hover:text-destructive w-full">
                                            <div className="p-2 rounded-lg bg-destructive/10 group-hover:bg-destructive/20">
                                                <LogOut className="h-5 w-5" />
                                            </div>
                                            <div className="ml-3 flex-1 text-left">
                                                <p className="text-sm font-medium truncate">
                                                    {user?.username ||
                                                        "Admin User"}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Sign out of admin panel
                                                </p>
                                            </div>
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Konfirmasi Logout
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Apakah Anda yakin ingin keluar
                                                dari admin panel? Anda akan
                                                diarahkan ke halaman utama dan
                                                perlu login kembali untuk
                                                mengakses area admin.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Batal
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleLogout}
                                                className="bg-destructive hover:bg-destructive/90"
                                            >
                                                Ya, Logout
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
