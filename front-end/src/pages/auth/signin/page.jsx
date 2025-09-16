import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, User, Lock, Eye, EyeOff } from "lucide-react";

export default function SignIn() {
    const BACKGROUND_IMAGE = import.meta.env.VITE_BACKGROUND_IMAGE_URL;
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (data.success) {
                // Use auth context login
                login(data.data.user, data.data.token);

                // Redirect to admin dashboard
                navigate("/admin");
            } else {
                setError(data.error?.message || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 relative"
            style={{
                backgroundImage:
                    "url('https://png.pngtree.com/thumb_back/fh260/background/20230613/pngtree-fresh-vegetables-at-traditional-asian-market-can-be-used-as-food-photo-image_3085061.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Background overlay for better readability */}
            <div className="absolute inset-0 bg-black/50"></div>

            <div className="w-full max-w-xs relative z-10">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary mb-3">
                        <MapPin className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <h1 className="text-xl font-semibold text-white">
                        Market Finder
                    </h1>
                    <p className="text-xs text-white/80 mt-1">Admin Login</p>
                </div>

                {/* Login Form */}
                <Card className="backdrop-blur-sm bg-white/95">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-lg">Sign In</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <form onSubmit={handleSubmit} className="space-y-3">
                            {/* Username Field */}
                            <div className="space-y-1">
                                <Label htmlFor="username" className="text-xs">
                                    Username
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Enter username"
                                        className="pl-8 h-8 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1">
                                <Label htmlFor="password" className="text-xs">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        className="pl-8 pr-8 h-8 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-3.5 w-3.5" />
                                        ) : (
                                            <Eye className="h-3.5 w-3.5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertDescription className="text-xs">
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-8 text-sm"
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Default Credentials */}
                <div className="mt-4">
                    <Card className="backdrop-blur-sm bg-white/95">
                        <CardContent className="p-3">
                            <div className="text-center">
                                <p className="text-xs font-medium mb-2">
                                    Default Credentials
                                </p>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">
                                            Username:
                                        </span>
                                        <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                                            admin
                                        </code>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">
                                            Password:
                                        </span>
                                        <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                                            admin123
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
