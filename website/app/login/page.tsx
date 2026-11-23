"use client";

import { useState } from "react";
import { ReaderInfo } from "@/lib/ReaderInfo";

const Page = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [signup, setSignup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [notification, setNotification] = useState({
        message: "",
        type: "" as "success" | "error" | "",
    });

    const { setUser } = ReaderInfo();

    const showNotification = (
        message: string,
        type: "success" | "error"
    ) => {
        setNotification({ message, type });

        setTimeout(() => {
            setNotification({ message: "", type: "" });
        }, 3000);
    };

    const signin = async () => {
        try {
            setLoading(true);

            const response = await fetch("/api/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const data = await response.json();

            if (data.status === "succesfull") {
                showNotification(
                    "Account created successfully! Login now.",
                    "success"
                );
                setSignup(false);
                setPassword("");
            } else {
                showNotification(
                    data.message || "Account creation failed.",
                    "error"
                );
            }
        } catch (error) {
            console.error(error);
            showNotification("Something went wrong.", "error");
        } finally {
            setLoading(false);
        }
    };

    const login = async () => {
        try {
            setLoading(true);

            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const data = await response.json();

            if (data.status === "succsesful") {
                setUser(data.message[0]["username"]);
                showNotification(
                    "Welcome back! Login successful.",
                    "success"
                );
            } else {
                showNotification(
                    "Wrong username or password.",
                    "error"
                );
            }
        } catch (error) {
            console.error(error);
            showNotification("Something went wrong.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-6 pb-16 pt-28 text-[#20201E]">

            {/* Notification */}
            {notification.message && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed inset-x-5 top-24 z-50 flex items-center justify-between gap-4 border border-neutral-200 bg-white px-5 py-4 sm:left-auto sm:right-6 sm:max-w-sm"
                >
                    <p
                        className={`text-sm ${
                            notification.type === "error"
                                ? "text-red-700"
                                : "text-[#20201E]"
                        }`}
                    >
                        {notification.message}
                    </p>

                    <button
                        type="button"
                        aria-label="Dismiss notification"
                        onClick={() =>
                            setNotification({
                                message: "",
                                type: "",
                            })
                        }
                        className="text-xl text-neutral-400 hover:text-black"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="w-full max-w-sm">

                {/* Heading */}
                <h1 className="mb-12 text-center font-serif text-5xl font-normal tracking-tight">
                    {signup ? "Create an account." : "Log in."}
                </h1>

                {/* Form */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        signup ? signin() : login();
                    }}
                    className="space-y-6"
                >

                    {/* Username */}
                    <div>
                        <label
                            htmlFor="username"
                            className="mb-2 block text-sm font-medium"
                        >
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                            className="w-full border border-neutral-300 bg-white px-4 py-3.5 text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-black"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium"
                        >
                            Password
                        </label>

                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                                autoComplete={
                                    signup
                                        ? "new-password"
                                        : "current-password"
                                }
                                className="w-full border border-neutral-300 bg-white px-4 py-3.5 pr-16 text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-black"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-black"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#20201E] py-3.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Please wait..."
                            : signup
                                ? "Create account"
                                : "Log in"}
                    </button>
                </form>

                {/* Switch between login and signup */}
                <p className="mt-8 text-center text-sm text-neutral-500">
                    {signup
                        ? "Already have an account?"
                        : "Don't have an account?"}

                    <button
                        type="button"
                        onClick={() => setSignup(!signup)}
                        className="ml-2 text-[#20201E] underline underline-offset-4"
                    >
                        {signup ? "Log in" : "Sign up"}
                    </button>
                </p>

            </div>
        </main>
    );
};

export default Page;