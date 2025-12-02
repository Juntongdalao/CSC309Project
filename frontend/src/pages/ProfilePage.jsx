// User's Profile Page
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/apiClient";
import useAuthStore from "../store/authStore";

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

    // Load /users/me
    const { data, isLoading, isError } = useQuery({
        queryKey: ["me-profile"],
        queryFn: () => apiFetch("/users/me"),
        onSuccess: (me) => {
            setName(me.name ?? "");
            setEmail(me.email ?? "");
            // backend returns birthday as ISO or null
            if (me.birthday) {
                // ensure YYYY-MM-DD format for <input type="date">
                const day10 = me.birthday.slice(0, 10);
                setBirthday(day10);
            } else {
                setBirthday("");
            }
            setAvatar(me.avatarUrl ?? "");
        }
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

            // keep Zustand auth in sync with new profile
            if (token) {
                setAuth(token, updated);
            }
            // refresh any queries using /users/me
            queryClient.invalidateQueries({ queryKey: ["me-profile"] });
            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
        onError: (err) => {
            console.error(err);
            setMessage("");
            setError(err.message || "Failed to update profile");
        },
    });
    function handleSubmit(e) {
        e.preventDefault();
        setMessage("");
        setError("");

        const payload = {};
        if (name.trim() !== "") payload.name = name.trim();
        if (email.trim() !== "") payload.email = email.trim();
        if (birthday) payload.birthday = birthday;
        if (avatar.trim() !== "") payload.avatar = avatar.trim();

        updateMutation.mutate(payload);
    }

    if (isLoading) {
        return <div style={{ padding: "2rem" }}>Loading profile…</div>;
    }

    if (isError) {
        return (
            <div style={{ padding: "2rem" }}>
                <p style={{ color: "red" }}>Failed to load profile.</p>
            </div>
        );
    }

    const me = data;

    const createdAtStr = me.createdAt
        ? new Date(me.createdAt).toLocaleString()
        : "N/A";
    const lastLoginStr = me.lastLogin
        ? new Date(me.lastLogin).toLocaleString()
        : "Never";
    const birthdayStr = me.birthday
        ? me.birthday.slice(0, 10)
        : "—";

    return (
        <div style={{ padding: "2rem", maxWidth: 480 }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
                My Profile
            </h1>
            {/* VIEW: summary card */}
            <section
                style={{
                    marginBottom: "2rem",
                    padding: "1rem 1.25rem",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                }}
            >
                <p style={{ marginBottom: "0.5rem" }}>
                    Logged in as <strong>{me.utorid}</strong> ({me.role})
                </p>
                <dl
                    style={{
                        display: "grid",
                        gridTemplateColumns: "max-content 1fr",
                        rowGap: "0.25rem",
                        columnGap: "0.75rem",
                        fontSize: "0.9rem",
                    }}
                >
                    <dt style={{ fontWeight: 600 }}>Name:</dt>
                    <dd>{me.name ?? "—"}</dd>

                    <dt style={{ fontWeight: 600 }}>Email:</dt>
                    <dd>{me.email ?? "—"}</dd>

                    <dt style={{ fontWeight: 600 }}>Verified:</dt>
                    <dd>{me.verified ? "Yes" : "No"}</dd>

                    <dt style={{ fontWeight: 600 }}>Points:</dt>
                    <dd>{me.points ?? 0}</dd>

                    <dt style={{ fontWeight: 600 }}>Birthday:</dt>
                    <dd>{birthdayStr}</dd>

                    <dt style={{ fontWeight: 600 }}>Created:</dt>
                    <dd>{createdAtStr}</dd>

                    <dt style={{ fontWeight: 600 }}>Last login:</dt>
                    <dd>{lastLoginStr}</dd>

                    <dt style={{ fontWeight: 600 }}>Avatar URL:</dt>
                    <dd>{me.avatarUrl}</dd>
                </dl>
            </section>

            {/* Edit Form */}
            <h2
                style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    marginBottom: "0.75rem",
                }}
            >
                Edit your profile
            </h2>
            {message && (
                <p style={{ color: "green", marginBottom: "0.75rem" }}>{message}</p>
            )}
            {error && (
                <p style={{ color: "red", marginBottom: "0.75rem" }}>{error}</p>
            )}
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
                <div>
                    <label htmlFor="name" style={{ display: "block", marginBottom: 4 }}>
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: "100%" }}
                    />
                </div>
                <div>
                    <label htmlFor="email" style={{ display: "block", marginBottom: 4 }}>
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: "100%" }}
                    />
                </div>
                <div>
                    <label htmlFor="birthday" style={{ display: "block", marginBottom: 4 }}>
                        Birthday
                    </label>
                    <input
                        id="birthday"
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        style={{ width: "100%" }}
                    />
                </div>
                <div>
                    <label htmlFor="avatar" style={{ display: "block", marginBottom: 4 }}>
                        Avatar URL
                    </label>
                    <input
                        id="avatar"
                        type="text"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="https://…"
                        style={{ width: "100%" }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={updateMutation.isLoading}
                    style={{
                        padding: "0.5rem 1rem",
                        borderRadius: 999,
                        border: "1px solid #4f46e5",
                        backgroundColor: "#4f46e5",
                        color: "white",
                        fontWeight: 500,
                    }}
                >
                    {updateMutation.isLoading ? "Saving…" : "Save changes"}
                </button>
            </form>
        </div>
    );
}