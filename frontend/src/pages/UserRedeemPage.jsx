// A form for regular users to request a redemption. On success, 
// it redirects to the QR page for that specific redemption.

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/apiClient";
import useAuthStore from "../store/authStore";

export default function UserRedeemPage() {
    const navigate = useNavigate();
    const me = useAuthStore((s) => s.user);

    const [amount, setAmount] = useState("");
    const [remark, setRemark] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const redeemMutation = useMutation({
        mutationFn: ({ amount, remark }) =>
            apiFetch("/users/me/transactions", {
                method: "POST",
                body: {
                    type: "redemption",
                    amount,
                    remark,
                },
            }),
        onSuccess: (tx) => {
            setError("");
            setMessage("Redemption request created successfully.");
            // Go to QR page for this redemption
            navigate(`/me/redemptions/${tx.id}`, {
                replace: false,
                state: { amount: tx.amount, remark: tx.remark ?? "" },
            });
        },
        onError: (err) => {
            console.error(err);
            setMessage("");
            setError(err.message || "Failed to create redemption request.");
        },
    });

    function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setMessage("");

        const pts = Number(amount);
        if (!Number.isInteger(pts) || pts <= 0) {
            setError("Amount must be a positive integer.");
            return;
        }

        redeemMutation.mutate({
            amount: pts,
            remark: remark.trim(),
        });
    }

    return (
        <div style={{ padding: "2rem", maxWidth: 480 }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
                Redeem Points
            </h1>
            {me && (
                <p style={{ marginBottom: "0.75rem", color: "#4b5563" }}>
                    Logged in as <strong>{me.utorid}</strong> &middot; Current points:{" "}
                    <strong>{me.points ?? 0}</strong>
                </p>
            )}
            <p style={{ marginBottom: "1rem", color: "#6b7280", fontSize: "0.9rem" }}>
                Submit a redemption request. A cashier will later process it using the
                QR code generated for your request. You must be verified and have enough
                points for this to succeed.
            </p>
            {error && (
                <p style={{ color: "red", marginBottom: "0.75rem" }}>{error}</p>
            )}
            {message && (
                <p style={{ color: "green", marginBottom: "0.75rem" }}>{message}</p>
            )}
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
                <div>
                    <label htmlFor="amount" style={{ display: "block", marginBottom: 4 }}>
                        Points to redeem
                    </label>
                    <input
                        id="amount"
                        type="number"
                        min={1}
                        step={1}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g., 500"
                        style={{ width: "100%" }}
                    />
                </div>
                <div>
                    <label htmlFor="remark" style={{ display: "block", marginBottom: 4 }}>
                        Note (optional)
                    </label>
                    <textarea
                        id="remark"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="Optional note for the cashier..."
                        rows={3}
                        style={{ width: "100%", resize: "vertical" }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={redeemMutation.isLoading}
                    style={{
                        padding: "0.5rem 1rem",
                        borderRadius: 999,
                        border: "1px solid #4f46e5",
                        backgroundColor: "#4f46e5",
                        color: "white",
                        fontWeight: 500,
                    }}
                >
                    {redeemMutation.isLoading ? "Submitting…" : "Submit redemption request"}
                </button>
            </form>
        </div>
    );
}