// Regular user: manually transfer points to another user by numeric userId

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/apiClient";

// Build payload for POST /users/:userId/transactions
function buildTransferPayload(amount, note) {
    return {
        type: "transfer",
        amount,
        remark: note || "",
    };
}

export default function UserTransferPage() {
    const queryClient = useQueryClient();

    const [recipientId, setRecipientId] = useState("");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [formError, setFormError] = useState("");

    // Load /users/me to display current points
    const { data: me, isLoading: meLoading, isError: meError } = useQuery({
        queryKey: ["me-transfer"],
        queryFn: () => apiFetch("/users/me"),
    });

    const transferMutation = useMutation({
        mutationFn: ({ userId, amount, note }) => {
            const payload = buildTransferPayload(amount, note);
            // Backend: POST /users/:userId/transactions (type must be "transfer")
            return apiFetch(`/users/${userId}/transactions`, {
                method: "POST",
                body: payload,
            });
        },
        onSuccess: () => {
            setFormError("");
            setRecipientId("");
            setAmount("");
            setNote("");

            // Refresh points + my transactions
            queryClient.invalidateQueries({ queryKey: ["me-transfer"] });
            queryClient.invalidateQueries({ queryKey: ["me-points"] });
            queryClient.invalidateQueries({ queryKey: ["my-transactions"] });

            alert("Transfer created successfully.");
        },
        onError: (err) => {
            console.error(err);
            setFormError(err.message || "Failed to create transfer.");
        },
    });
    function handleSubmit(e) {
        e.preventDefault();
        setFormError("");

        const trimmedRecipient = recipientId.trim();
        const numericId = Number(trimmedRecipient);
        const numericAmount = Number(amount);

        if (!trimmedRecipient) {
            setFormError("Please enter a recipient user ID (numeric).");
            return;
        }

        if (!Number.isInteger(numericId) || numericId <= 0) {
            setFormError("Recipient user ID must be a positive integer.");
            return;
        }

        if (!Number.isFinite(numericAmount) || !Number.isInteger(numericAmount) || numericAmount <= 0) {
            setFormError("Amount must be a positive integer.");
            return;
        }

        transferMutation.mutate({
            userId: numericId,
            amount: numericAmount,
            note: note.trim(),
        });
    }

    return (
        <div style={{ padding: "2rem", maxWidth: 520 }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Transfer Points
            </h1>

            {meLoading && <p>Loading your balance…</p>}
            {meError && (
                <p style={{ color: "red" }}>Failed to load your current balance.</p>
            )}

            {me && (
                <p style={{ marginBottom: "1rem", color: "#4b5563" }}>
                    You are logged in as <strong>{me.utorid}</strong> ({me.role}).<br />
                    Current balance:{" "}
                    <strong>{typeof me.points === "number" ? me.points : 0}</strong> points.
                </p>
            )}

            {formError && (
                <p style={{ color: "red", marginBottom: "0.75rem" }}>{formError}</p>
            )}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
                <div>
                    <label htmlFor="recipientId" style={{ display: "block", marginBottom: 4 }}>
                        Recipient User ID
                    </label>
                    <input
                        id="recipientId"
                        type="number"
                        min="1"
                        value={recipientId}
                        onChange={(e) => setRecipientId(e.target.value)}
                        placeholder="Numeric user ID (e.g., 3)"
                        style={{ width: "100%" }}
                    />
                    <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 4 }}>
                        This is the internal numeric user ID, not UTORid. (Matches backend
                        <code> /users/:userId/transactions </code> API.)
                    </p>
                </div>
                <div>
                    <label htmlFor="amount" style={{ display: "block", marginBottom: 4 }}>
                        Amount of points
                    </label>
                    <input
                        id="amount"
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g., 100"
                        style={{ width: "100%" }}
                    />
                </div>
                <div>
                    <label htmlFor="note" style={{ display: "block", marginBottom: 4 }}>
                        Note (optional)
                    </label>
                    <textarea
                        id="note"
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Reason for transfer…"
                        style={{ width: "100%", resize: "vertical" }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={transferMutation.isLoading}
                    style={{
                        padding: "0.6rem 1.4rem",
                        borderRadius: 999,
                        border: "1px solid #4f46e5",
                        backgroundColor: "#4f46e5",
                        color: "white",
                        fontWeight: 500,
                    }}
                >
                    {transferMutation.isLoading ? "Creating transfer…" : "Send points"}
                </button>
            </form>
        </div>
    );
}