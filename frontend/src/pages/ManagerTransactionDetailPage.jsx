import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/apiClient";

export default function ManagerTransactionDetailPage() {
    const { transactionId } = useParams();
    const queryClient = useQueryClient();

    const [actionError, setActionError] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const [adjustAmount, setAdjustAmount] = useState("");
    const [adjustRemark, setAdjustRemark] = useState("");

    const {
        data: tx,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["manager-tx-detail", transactionId],
        queryFn: () => apiFetch(`/transactions/${transactionId}`),
    });

    const suspiciousMutation = useMutation({
        mutationFn: (newValue) =>
            apiFetch(`/transactions/${transactionId}/suspicious`, {
                method: "PATCH",
                body: { suspicious: newValue },
            }),
        onSuccess: (updated) => {
            queryClient.setQueryData(
                ["manager-tx-detail", transactionId],
                updated
            );
            queryClient.invalidateQueries({ queryKey: ["manager-transactions"] });
            setActionMessage(
                updated.suspicious
                    ? "Marked transaction as suspicious."
                    : "Marked transaction as not suspicious."
            );
            setActionError("");
        },
        onError: (err) => {
            console.error(err);
            setActionError(err.message || "Failed to update suspicious flag.");
            setActionMessage("");
        },
    });

    const adjustmentMutation = useMutation({
        mutationFn: async () => {
            if (!tx) throw new Error("Transaction not loaded yet.");
            const n = Number(adjustAmount);
            if (!Number.isInteger(n) || n === 0) {
                throw new Error("Adjustment amount must be a non-zero integer.");
            }
            // Backend: POST /transactions with type="adjustment"
            return apiFetch("/transactions", {
                method: "POST",
                body: {
                    utorid: tx.utorid,
                    type: "adjustment",
                    amount: n,
                    relatedId: tx.id,
                    remark: adjustRemark,
                },
            });
        },
        onSuccess: (created) => {
            setActionMessage(
                `Created adjustment transaction #${created.id} (amount ${created.amount}).`
            );
            setActionError("");
            setAdjustAmount("");
            setAdjustRemark("");
            queryClient.invalidateQueries({ queryKey: ["manager-transactions"] });
        },
        onError: (err) => {
            console.error(err);
            setActionError(err.message || "Failed to create adjustment transaction.");
            setActionMessage("");
        },
    });

    function handleToggleSuspicious() {
        if (!tx || suspiciousMutation.isLoading) return;
        suspiciousMutation.mutate(!tx.suspicious);
    }

    function handleSubmitAdjustment(e) {
        e.preventDefault();
        setActionError("");
        setActionMessage("");
        adjustmentMutation.mutate();
    }

    if (isLoading) {
        return <div style={{ padding: "2rem" }}>Loading transaction…</div>;
    }

    if (isError) {
        return (
            <div style={{ padding: "2rem" }}>
                <p style={{ color: "red" }}>
                    Failed to load transaction: {error?.message || "Unknown error"}
                </p>
                <p style={{ marginTop: "0.75rem" }}>
                    <Link to="/manager/transactions">Back to all transactions</Link>
                </p>
            </div>
        );
    }

    const promotionList = Array.isArray(tx.promotionIds)
        ? tx.promotionIds.join(", ")
        : "—";

    return (
        <div style={{ padding: "2rem", maxWidth: 720 }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Transaction #{tx.id}
            </h1>
            <p style={{ marginBottom: "0.75rem" }}>
                <Link to="/manager/transactions">← Back to all transactions</Link>
            </p>
        
            {actionError && (
                <p style={{ color: "red", marginBottom: "0.75rem" }}>{actionError}</p>
            )}
            {actionMessage && (
                <p style={{ color: "green", marginBottom: "0.75rem" }}>
                    {actionMessage}
                </p>
            )}
            {/* Details */}
            <section
                style={{
                    marginBottom: "1.5rem",
                    padding: "1rem",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
            }}
            >
                <h2
                    style={{
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                    }}
                >
                    Transaction Details
                </h2>
                <dl
                    style={{
                        display: "grid",
                        gridTemplateColumns: "max-content 1fr",
                        rowGap: "0.25rem",
                        columnGap: "0.5rem",
                        fontSize: "0.9rem",
                }}
                >
                    <dt style={{ fontWeight: 600 }}>ID:</dt>
                    <dd>{tx.id}</dd>
            
                    <dt style={{ fontWeight: 600 }}>User UTORid:</dt>
                    <dd>{tx.utorid}</dd>
            
                    <dt style={{ fontWeight: 600 }}>Type:</dt>
                    <dd>{tx.type}</dd>
            
                    <dt style={{ fontWeight: 600 }}>Amount:</dt>
                    <dd>{tx.amount}</dd>
            
                    <dt style={{ fontWeight: 600 }}>Spent:</dt>
                    <dd>{tx.spent != null ? tx.spent : "—"}</dd>
            
                    <dt style={{ fontWeight: 600 }}>Redeemed:</dt>
                    <dd>{tx.redeemed != null ? tx.redeemed : "—"}</dd>
            
                    <dt style={{ fontWeight: 600 }}>Related ID:</dt>
                    <dd>{tx.relatedId != null ? tx.relatedId : "—"}</dd>
            
                    <dt style={{ fontWeight: 600 }}>Suspicious:</dt>
                    <dd>{tx.suspicious ? "Yes" : "No"}</dd>
            
                    <dt style={{ fontWeight: 600 }}>Created By:</dt>
                    <dd>{tx.createdBy ?? "—"}</dd>
            
                    <dt style={{ fontWeight: 600 }}>Processed By:</dt>
                    <dd>{tx.processedBy ?? "—"}</dd>
            
                    <dt style={{ fontWeight: 600 }}>Promotions:</dt>
                    <dd>{promotionList}</dd>
            
                    <dt style={{ fontWeight: 600 }}>Remark:</dt>
                    <dd>{tx.remark && tx.remark.trim().length > 0 ? tx.remark : "—"}</dd>
                </dl>
            </section>
        
            {/* Suspicious toggle */}
            <section style={{ marginBottom: "1.5rem" }}>
                <h2
                    style={{
                        fontSize: "1.05rem",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                    }}
                >
                    Suspicious Flag
                </h2>
                <p style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                    Mark this transaction as suspicious or clear the flag. The backend will
                    automatically adjust user points if needed.
                </p>
                <button
                    type="button"
                    onClick={handleToggleSuspicious}
                    disabled={suspiciousMutation.isLoading}
                    style={{
                        padding: "0.4rem 0.9rem",
                        borderRadius: 999,
                        border: "1px solid #b91c1c",
                        backgroundColor: tx.suspicious ? "#fee2e2" : "#fef9c3",
                        color: "#7f1d1d",
                        fontWeight: 500,
                    }}
                >
                    {suspiciousMutation.isLoading
                        ? "Updating…"
                        : tx.suspicious
                        ? "Mark as not suspicious"
                        : "Mark as suspicious"}
                </button>
            </section>
        
            {/* Adjustment creation */}
            <section>
                <h2
                    style={{
                        fontSize: "1.05rem",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                    }}
                >
                    Create Adjustment Transaction
                </h2>
                <p style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                    Create an adjustment linked to this transaction. Use a positive integer
                    to add points, or a negative integer to remove points.
                </p>
                <form
                    onSubmit={handleSubmitAdjustment}
                    style={{ display: "grid", gap: "0.75rem", maxWidth: 420 }}
                >
                    <div>
                        <label
                            htmlFor="adjustAmount"
                            style={{ display: "block", marginBottom: 4 }}
                        >
                            Adjustment Amount (non-zero integer)
                        </label>
                        <input
                            id="adjustAmount"
                            type="number"
                            value={adjustAmount}
                            onChange={(e) => setAdjustAmount(e.target.value)}
                            placeholder="e.g., 50 or -50"
                            style={{ width: "100%" }}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="adjustRemark"
                            style={{ display: "block", marginBottom: 4 }}
                        >
                            Remark (optional)
                        </label>
                        <input
                            id="adjustRemark"
                            type="text"
                            value={adjustRemark}
                            onChange={(e) => setAdjustRemark(e.target.value)}
                            placeholder="Reason for adjustment"
                            style={{ width: "100%" }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={adjustmentMutation.isLoading}
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: 999,
                            border: "1px solid #4f46e5",
                            backgroundColor: "#4f46e5",
                            color: "white",
                            fontWeight: 500,
                        }}
                    >
                    {adjustmentMutation.isLoading
                        ? "Creating adjustment…"
                        : "Create Adjustment"}
                    </button>
                </form>
            </section>
        </div>
    );
}