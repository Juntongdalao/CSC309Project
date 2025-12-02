// Manager / Superuser: view & update users (filters + pagination)

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/apiClient";

const PAGE_SIZE = 10;
const ROLES = ["regular", "cashier", "manager", "superuser"];

export default function ManagerUsersPage() {
    const [page, setPage] = useState(1);
    const [searchName, setSearchName] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [verifiedFilter, setVerifiedFilter] = useState("");
    const [activatedFilter, setActivatedFilter] = useState("");

    const [actionError, setActionError] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const queryClient = useQueryClient();

    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
    } = useQuery({
        queryKey: [
            "manager-users",
            { page, searchName, roleFilter, verifiedFilter, activatedFilter },
        ],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("limit", String(PAGE_SIZE));
            if (searchName.trim()) params.set("name", searchName.trim());
            if (roleFilter) params.set("role", roleFilter);
            if (verifiedFilter) params.set("verified", verifiedFilter);
            if (activatedFilter) params.set("activated", activatedFilter);

            // Backend: GET /users?name=&role=&verified=&activated=&page=&limit=
            return apiFetch(`/users?${params.toString()}`);
        },
        keepPreviousData: true,
    });

    const total = data?.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const users = data?.results ?? [];

    function handleApplyFilters(e) {
        e.preventDefault();
        setPage(1);
    }

    async function updateUser(userId, payload, successText) {
        setActionError("");
        setActionMessage("");
        setUpdatingId(userId);
        try {
            // Backend: PATCH /users/:userId with subset { role?, verified? }
            await apiFetch(`/users/${userId}`, {
                method: "PATCH",
                body: payload,
            });
            setActionMessage(successText);
            // Refresh all manager-users queries
            await queryClient.invalidateQueries({ queryKey: ["manager-users"] });
        } catch (err) {
            console.error(err);
            setActionError(err.message || "Failed to update user");
        } finally {
            setUpdatingId(null);
        }
    }

    function handleToggleVerified(u) {
        updateUser(
            u.id,
            { verified: !u.verified },
            `User ${u.utorid} marked as ${!u.verified ? "verified" : "unverified"}.`,
        );
    }

    function handleChangeRole(u, newRole) {
        if (!newRole || newRole === u.role) return;
        updateUser(
            u.id,
            { role: newRole },
            `Updated role for ${u.utorid} to ${newRole}.`,
        );
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
                Manager: Users
            </h1>

            {/* Global action feedback */}
            {actionError && (
                <p style={{ color: "red", marginBottom: "0.5rem" }}>{actionError}</p>
            )}
            {actionMessage && (
                <p style={{ color: "green", marginBottom: "0.5rem" }}>
                    {actionMessage}
                </p>
            )}

            {/* Filters */}
            <form
                onSubmit={handleApplyFilters}
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                    alignItems: "flex-end",
                    marginBottom: "1.5rem",
                }}
            >
                {/* Search by name / utorid */}
                <div>
                    <label htmlFor="searchName" style={{ display: "block", marginBottom: 4 }}>
                        Search (name / UTORid)
                    </label>
                    <input
                        id="searchName"
                        type="text"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        placeholder="e.g., clive"
                    />
                </div>

                {/* Role filter */}
                <div>
                    <label htmlFor="roleFilter" style={{ display: "block", marginBottom: 4 }}>
                        Role
                    </label>
                    <select
                        id="roleFilter"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">ALL</option>
                        {ROLES.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Verified filter */}
                <div>
                    <label htmlFor="verifiedFilter" style={{ display: "block", marginBottom: 4 }}>
                        Verified
                    </label>
                    <select
                        id="verifiedFilter"
                        value={verifiedFilter}
                        onChange={(e) => setVerifiedFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="true">Verified</option>
                        <option value="false">Unverified</option>
                    </select>
                </div>

                {/* Activated filter */}
                <div>
                    <label htmlFor="activatedFilter" style={{ display: "block", marginBottom: 4 }}>
                        Activated
                    </label>
                    <select
                        id="activatedFilter"
                        value={activatedFilter}
                        onChange={(e) => setActivatedFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="true">Activated</option>
                        <option value="false">Not activated</option>
                    </select>
                </div>

                <button
                    type="submit"
                    style={{
                        padding: "0.5rem 1rem",
                        borderRadius: 999,
                        border: "1px solid #4f46e5",
                        backgroundColor: "#4f46e5",
                        color: "white",
                        fontWeight: 500,
                    }}
                >
                    Apply
                </button>
            </form>

            {/* Loading / error */}
            {isLoading && <p>Loading users…</p>}
            {isError && (
                <p style={{ color: "red" }}>
                    Failed to load users: {error?.message || "Unknown error"}
                </p>
            )}

            {/* Table */}
            {!isLoading && !isError && (
                <>
                    {users.length === 0 ? (
                        <p>No users found.</p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    minWidth: 600,
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th style={thStyle}>ID</th>
                                        <th style={thStyle}>UTORid</th>
                                        <th style={thStyle}>Email</th>
                                        <th style={thStyle}>Role</th>
                                        <th style={thStyle}>Verified</th>
                                        <th style={thStyle}>Points</th>
                                        <th style={thStyle}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id}>
                                            <td style={tdStyle}>{u.id}</td>
                                            <td style={tdStyle}>{u.utorid}</td>
                                            <td style={tdStyle}>{u.email}</td>
                                            <td style={tdStyle}>
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleChangeRole(u, e.target.value)}
                                                    disabled={updatingId === u.id}
                                                >
                                                    {ROLES.map((r) => (
                                                        <option key={r} value={r}>
                                                            {r}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td style={tdStyle}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleVerified(u)}
                                                    disabled={updatingId === u.id}
                                                    style={{
                                                        padding: "0.15rem 0.6rem",
                                                        borderRadius: 999,
                                                        border: "1px solid #d1d5db",
                                                        backgroundColor: u.verified ? "#dcfce7" : "#fee2e2",
                                                    }}
                                                >
                                                    {u.verified ? "Verified" : "Unverified"}
                                                </button>
                                            </td>
                                            <td style={tdStyle}>{u.points ?? 0}</td>
                                            <td style={tdStyle}>
                                                {updatingId === u.id && (
                                                    <span style={{ fontSize: "0.8rem" }}>Updating…</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {total > 0 && (
                        <div
                            style={{
                                marginTop: "1.5rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </button>
                            <span>
                                Page {page} / {totalPages}{" "}
                                {isFetching && (
                                    <span style={{ fontSize: "0.8rem" }}>…loading</span>
                                )}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                                disabled={page >= totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// Simple shared styles for table cells
const thStyle = {
    textAlign: "left",
    padding: "0.5rem 0.75rem",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "0.85rem",
    color: "#6b7280",
};

const tdStyle = {
    padding: "0.5rem 0.75rem",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "0.9rem",
};