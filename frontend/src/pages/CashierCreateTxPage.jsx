// Cashier / Manager / Superuser: create a new transaction
// Uses POST /transactions on the backend.

import { useState } from "react";
import { apiFetch } from "../lib/apiClient";

export default function CashierCreateTxPage() {
    const [type, setType] = useState("purchase"); // "purchase" or "adjustment"
    const [utorid, setUtorid] = useState("");
    const [spent, setSpent] = useState("");
    const [promoInput, setPromoInput] = useState(""); // comma-separated IDs for purchase
    const [amount, setAmount] = useState(""); // for adjustment
    const [relatedId, setRelatedId] = useState(""); // for adjustment
    const [remark, setRemark] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    function parsePromotionIds(raw) {
        if (!raw.trim()) return [];
        return raw.split(",").map((s) => s.trim()).filter((s) => 
            s !== "").map((s) => Number(s)).filter((n) => Number.isFinite(n));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setSubmitting(true);

        try {
            if (!utorid.trim()) {
                throw new Error("UTORid is required");
            }
            let body = { utorid, type, remark: remark ?? "" };
            if (type === "purchase") {
                const spentNum = Number(spent);
                if (!Number.isFinite(spentNum) || spentNum <= 0) {
                    throw new Error("Spent must be a positive number");
                }
                const promoIds = parsePromotionIds(promoInput);
                body = {
                    ...body,
                    spent: spentNum,
                    promotionIds: promoIds,
                };
            } else if (type === "adjustment") {
                const amtNum = Number(amount);
                const relIdNum = Number(relatedId);
                if (!Number.isInteger(amtNum)) {
                    throw new Error("Adjustment amount must be an integer (can be negative)");
                }
                if (!Number.isInteger(relIdNum) || relIdNum <= 0) {
                    throw new Error("Related transaction ID must be a positive integer");
                }
                body = {
                    ...body,
                    amount: amtNum,
                    relatedId: relIdNum,
                };
            } else {
                throw new Error('Type must be "purchase" or "adjustment"');
            }
            const tx = await apiFetch("/transactions", {
                method: "POST",
                body,
            });
            
            setSuccessMsg(`Transaction #${tx.id} (${tx.type}) created successfully for ${tx.utorid}.`,);

            // Clear only the type-specific fields
            if (type === "purchase") {
                setSpent("");
                setPromoInput("");
            } else {
                setAmount("");
                setRelatedId("");
            }
            setRemark("");
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to create transaction");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
                Cashier: New Transaction
            </h1>
            <p style={{ marginBottom: "1rem", color: "#4b5563" }}>
                Use this form to record purchases or manager adjustments for a user.
            </p>
            <form
                onSubmit={handleSubmit}
                style={{
                    maxWidth: 480,
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                {/* Transaction type */}
                <div>
                    <label htmlFor="type" style={{ display: "block", marginBottom: 4 }}>
                        Transaction Type
                    </label>
                    <select
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="purchase">Purchase</option>
                        <option value="adjustment">Adjustment</option>
                    </select>
                </div>
                
                {/* UTORid */}
                <div>
                    <label htmlFor="utorid" style={{ display: "block", marginBottom: 4 }}>
                        Customer UTORid
                    </label>
                    <input
                        id="utorid"
                        type="text"
                        value={utorid}
                        onChange={(e) => setUtorid(e.target.value)}
                        placeholder="e.g., clive123"
                        required
                        style={{ width: "100%" }}
                    />
                </div>

                {/* Fields specific to purchase */}
                {type == "purchase" && (
                    <>
                        <div>
                            <label htmlFor="spent" style={{ display: "block", marginBottom: 4 }}>
                                Amount Spent (CAD)
                            </label>
                            <input
                                id="spent"
                                type="number"
                                min="0"
                                step="0.01"
                                value={spent}
                                onChange={(e) => setSpent(e.target.value)}
                                placeholder="e.g., 19.99"
                                required
                                style={{ width: "100%" }}                
                            />
                        </div>
                        <div>
                            <label htmlFor="promos" style={{ display: "block", marginBottom: 4 }}>
                                Promotion IDs (optional)
                            </label>
                            <input
                                id="promos"
                                type="text"
                                value={promoInput}
                                onChange={(e) => setPromoInput(e.target.value)}
                                placeholder="e.g., 1, 4, 9"
                                style={{ width: "100%" }}
                            />
                            <small style={{ color: "#6b7280" }}>
                                Comma-separated promotion IDs. Only active one-time promos will be
                                applied; automatic promos are added automatically.
                            </small>
                        </div>
                    </>
                )}

                {/* Fields specific to adjustment */}
                {type === "adjustment" && (
                    <>
                        <div>
                            <label htmlFor="amount" style={{ display: "block", marginBottom: 4 }}>
                                Adjustment Amount (points)
                            </label>
                            <input
                                id="amount"
                                type="number"
                                step="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="e.g., 100 or -50"
                                required
                                style={{ width: "100%" }}
                            />
                        </div>
                        <div>
                            <label htmlFor="relatedId" style={{ display: "block", marginBottom: 4 }}>
                                Related Transaction ID
                            </label>
                            <input
                                id="relatedId"
                                type="number"
                                step="1"
                                value={relatedId}
                                onChange={(e) => setRelatedId(e.target.value)}
                                placeholder="original transaction ID"
                                required
                                style={{ width: "100%" }}
                            />
                        </div>
                    </>
                )}

                {/* Remark (shared) */}
                <div>
                    <label htmlFor="remark" style={{ display: "block", marginBottom: 4 }}>
                        Remark (optional)
                    </label>
                    <textarea
                        id="remark"
                        rows={3}
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        style={{ width: "100%" }}
                    />
                </div>

                {/* Error / success */}
                {error && (
                    <p style={{ color: "red", marginTop: "0.25rem" }}>{error}</p>
                )}
                {successMsg && (
                    <p style={{ color: "green", marginTop: "0.25rem" }}>{successMsg}</p>
                )}

                <button type="submit" disabled={submitting}>
                    {submitting ? "Submitting…" : "Create Transaction"}
                </button>
            </form>
        </div>
    );
}
