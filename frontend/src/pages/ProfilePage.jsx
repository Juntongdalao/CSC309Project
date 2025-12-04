import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/apiClient";
import useAuthStore from "../store/authStore";
import { AppShell } from "../components/layout";
import { Card } from "../components/ui";

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/;

export default function ProfilePage() {
    const queryClient = useQueryClient();

    const token = useAuthStore((s) => s.token);
    const setAuth = useAuthStore((s) => s.setAuth);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [birthday, setBirthday] = useState("");
    const [avatar, setAvatar] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [resetToken, setResetToken] = useState("");
    const [resetPassword, setResetPassword] = useState("");
    const [resetConfirmPassword, setResetConfirmPassword] = useState("");
    const [resetMessage, setResetMessage] = useState("");
    const [resetError, setResetError] = useState("");
    const [resetStep, setResetStep] = useState("request"); // "request" or "complete"

    const { data, isLoading, isError } = useQuery({
        queryKey: ["me-profile"],
        queryFn: () => apiFetch("/users/me"),
        onSuccess: (me) => {
            setName(me.name ?? "");
            setEmail(me.email ?? "");
            setBirthday(me.birthday ? me.birthday.slice(0, 10) : "");
            setAvatar(me.avatarUrl ?? "");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload) =>
            apiFetch("/users/me", {
                method: "PATCH",
                body: payload,
            }),
        onSuccess: (updated) => {
            setMessage("Profile updated successfully.");
            setError("");
            if (token) setAuth(token, updated);
            queryClient.invalidateQueries({ queryKey: ["me-profile"] });
            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
        onError: (err) => {
            setMessage("");
            setError(err.message || "Failed to update profile");
        },
    });

    const requestResetMutation = useMutation({
        mutationFn: (payload) =>
            apiFetch("/auth/resets", {
                method: "POST",
                body: payload,
            }),
        onSuccess: (data) => {
            setResetToken(data.resetToken);
            setResetStep("complete");
            setResetMessage(`Reset token generated. Token: ${data.resetToken} (expires: ${new Date(data.expiresAt).toLocaleString()})`);
            setResetError("");
        },
        onError: (err) => {
            setResetMessage("");
            setResetError(err.message || "Failed to request password reset.");
        },
    });

    const completeResetMutation = useMutation({
        mutationFn: (payload) =>
            apiFetch(`/auth/resets/${resetToken}`, {
                method: "POST",
                body: payload,
            }),
        onSuccess: () => {
            setResetMessage("Password reset successfully. Please log in with your new password.");
            setResetError("");
            setResetToken("");
            setResetPassword("");
            setResetConfirmPassword("");
            setResetStep("request");
        },
        onError: (err) => {
            setResetMessage("");
            setResetError(err.message || "Failed to reset password.");
        },
    });

    function handleSubmit(e) {
        e.preventDefault();
        setMessage("");
        setError("");
        const payload = {};
        if (name.trim()) payload.name = name.trim();
        if (email.trim()) payload.email = email.trim();
        if (birthday) payload.birthday = birthday;
        if (avatar.trim()) payload.avatar = avatar.trim();
        updateMutation.mutate(payload);
    }

    function handleRequestReset(e) {
        e.preventDefault();
        setResetError("");
        setResetMessage("");
        const me = data;
        if (!me?.utorid) {
            setResetError("Unable to get your UTORid.");
            return;
        }
        requestResetMutation.mutate({ utorid: me.utorid });
    }

    function handleCompleteReset(e) {
        e.preventDefault();
        setResetError("");
        setResetMessage("");

        if (!resetPassword) {
            setResetError("Password is required.");
            return;
        }
        if (!PASSWORD_POLICY.test(resetPassword)) {
            setResetError("Password must be 8-20 chars with uppercase, lowercase, number, and special character.");
            return;
        }
        if (resetPassword !== resetConfirmPassword) {
            setResetError("Passwords do not match.");
            return;
        }

        const me = data;
        if (!me?.utorid) {
            setResetError("Unable to get your UTORid.");
            return;
        }

        completeResetMutation.mutate({
            utorid: me.utorid,
            password: resetPassword,
        });
    }

    if (isLoading) {
        return (
            <AppShell title="My profile">
                <Card>
                    <div className="flex min-h-[30vh] items-center justify-center">
                        <span className="loading loading-spinner text-primary" />
                    </div>
                </Card>
            </AppShell>
        );
    }

    if (isError || !data) {
        return (
            <AppShell title="My profile">
                <Card>
                    <p className="text-error">Failed to load profile.</p>
                </Card>
            </AppShell>
        );
    }

    const me = data;
    const createdAtStr = me.createdAt ? new Date(me.createdAt).toLocaleString() : "N/A";
    const lastLoginStr = me.lastLogin ? new Date(me.lastLogin).toLocaleString() : "Never";
    const birthdayStr = me.birthday ? me.birthday.slice(0, 10) : "—";

    return (
        <AppShell title="My profile" subtitle="Review your account stats and update your information.">
            <Card title="Account overview">
                <div className="space-y-4">
                    <p className="text-sm text-neutral/70">
                        Logged in as <span className="font-semibold text-neutral">{me.utorid}</span> ({me.role})
                    </p>
                    <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div>
                            <dt className="text-neutral/60">Name</dt>
                            <dd className="font-medium">{me.name ?? "—"}</dd>
                        </div>
                        <div>
                            <dt className="text-neutral/60">Email</dt>
                            <dd className="font-medium">{me.email ?? "—"}</dd>
                        </div>
                        <div>
                            <dt className="text-neutral/60">Verified</dt>
                            <dd className="font-medium">{me.verified ? "Yes" : "No"}</dd>
                        </div>
                        <div>
                            <dt className="text-neutral/60">Points</dt>
                            <dd className="font-medium">{me.points ?? 0}</dd>
                        </div>
                        <div>
                            <dt className="text-neutral/60">Birthday</dt>
                            <dd className="font-medium">{birthdayStr}</dd>
                        </div>
                        <div>
                            <dt className="text-neutral/60">Created</dt>
                            <dd className="font-medium">{createdAtStr}</dd>
                        </div>
                        <div>
                            <dt className="text-neutral/60">Last login</dt>
                            <dd className="font-medium">{lastLoginStr}</dd>
                        </div>
                        <div>
                            <dt className="text-neutral/60">Avatar URL</dt>
                            <dd className="font-medium break-words">{me.avatarUrl ?? "—"}</dd>
                        </div>
                    </dl>
                </div>
            </Card>

            <Card title="Password reset">
                {resetError && (
                    <div className="alert alert-error mb-4 text-sm">
                        <span>{resetError}</span>
                    </div>
                )}
                {resetMessage && (
                    <div className="alert alert-success mb-4 text-sm">
                        <span className="whitespace-pre-wrap">{resetMessage}</span>
                    </div>
                )}
                {resetStep === "request" ? (
                    <form onSubmit={handleRequestReset} className="space-y-4">
                        <p className="text-sm text-neutral/70">
                            Request a password reset token. You'll receive a token that you can use to set a new password.
                        </p>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={requestResetMutation.isLoading}
                        >
                            {requestResetMutation.isLoading ? "Requesting…" : "Request reset token"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleCompleteReset} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral/70 pl-1">
                                Reset Token
                            </label>
                            <input
                                className="input input-bordered w-full rounded-2xl border-2 border-brand-200 bg-white px-4 py-2 text-neutral focus:border-brand-500 focus:ring-1 focus:ring-brand-200 font-mono text-sm"
                                value={resetToken}
                                onChange={(e) => setResetToken(e.target.value)}
                                placeholder="Enter reset token"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral/70 pl-1">
                                New Password
                            </label>
                            <input
                                className="input input-bordered w-full rounded-2xl border-2 border-brand-200 bg-white px-4 py-2 text-neutral focus:border-brand-500 focus:ring-1 focus:ring-brand-200"
                                type="password"
                                value={resetPassword}
                                onChange={(e) => setResetPassword(e.target.value)}
                                placeholder="8-20 chars with uppercase, lowercase, number, special char"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral/70 pl-1">
                                Confirm Password
                            </label>
                            <input
                                className="input input-bordered w-full rounded-2xl border-2 border-brand-200 bg-white px-4 py-2 text-neutral focus:border-brand-500 focus:ring-1 focus:ring-brand-200"
                                type="password"
                                value={resetConfirmPassword}
                                onChange={(e) => setResetConfirmPassword(e.target.value)}
                                placeholder="Confirm your new password"
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={completeResetMutation.isLoading}
                            >
                                {completeResetMutation.isLoading ? "Resetting…" : "Reset password"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => {
                                    setResetStep("request");
                                    setResetToken("");
                                    setResetPassword("");
                                    setResetConfirmPassword("");
                                    setResetMessage("");
                                    setResetError("");
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </Card>

            <Card title="Edit your profile">
                {message && (
                    <div className="alert alert-success mb-4 text-sm">
                        <span>{message}</span>
                    </div>
                )}
                {error && (
                    <div className="alert alert-error mb-4 text-sm">
                        <span>{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-md flex-col gap-6 px-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-neutral/70 ml-1">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input input-bordered w-full rounded-2xl border-2 border-brand-200 bg-white px-4 py-2 text-neutral focus:border-brand-500 focus:ring-1 focus:ring-brand-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-neutral/70 ml-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input input-bordered w-full rounded-2xl border-2 border-brand-200 bg-white px-4 py-2 text-neutral focus:border-brand-500 focus:ring-1 focus:ring-brand-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="birthday" className="text-sm font-medium text-neutral/70 ml-1">
                            Birthday
                        </label>
                        <input
                            id="birthday"
                            type="date"
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                            className="input input-bordered w-full rounded-2xl border-2 border-brand-200 bg-white px-4 py-2 text-neutral focus:border-brand-500 focus:ring-1 focus:ring-brand-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="avatar" className="text-sm font-medium text-neutral/70 ml-1">
                            Avatar URL
                        </label>
                        <input
                            id="avatar"
                            type="url"
                            value={avatar}
                            onChange={(e) => setAvatar(e.target.value)}
                            className="input input-bordered w-full rounded-2xl border-2 border-brand-200 bg-white px-4 py-2 text-neutral focus:border-brand-500 focus:ring-1 focus:ring-brand-200"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary mt-2"
                        disabled={updateMutation.isLoading}
                    >
                        {updateMutation.isLoading ? "Saving…" : "Save changes"}
                    </button>
                </form>
            </Card>
        </AppShell>
    );
}
