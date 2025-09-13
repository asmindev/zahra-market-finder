import { Calendar, Home, Inbox, Search, Settings, LogOut } from "lucide-react";

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
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/admin",
        icon: Home,
    },
    {
        title: "Market",
        url: "/admin/market",
        icon: Inbox,
    },
];

export function AppSidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <Sidebar className={""}>
            <SidebarContent className="bg-gray-100">
                <SidebarGroup className={"p-4"}>
                    <SidebarGroupLabel className={"p-0 mb-4 mt-4"}>
                        <div className="bg-indigo-50 p-2 rounded-md w-full border border-indigo-200">
                            <h1 className="text-xl font-semibold text-gray-700 text-center uppercase">
                                Admin
                            </h1>
                        </div>
                    </SidebarGroupLabel>
                    <SidebarGroupContent class>
                        <SidebarMenu>
                            {items.map((item) => (
                                <NavLink
                                    to={item.url}
                                    className={({ isActive }) =>
                                        `flex items-center space-x-2 p-2 rounded-md transition-colors ${
                                            isActive
                                                ? "text-indigo-500 bg-indigo-50"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`
                                    }
                                    end={item.url === "/admin"}
                                    key={item.title}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                </NavLink>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Logout Section */}
                <SidebarGroup className={"p-4 mt-auto"}>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 p-2 rounded-md transition-colors text-red-600 hover:bg-red-50 w-full text-left"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
