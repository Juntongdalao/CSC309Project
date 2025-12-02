// Cashier can enter a transaction ID and process a redemption.
import { useState } from "react";
import { apiFetch } from "../lib/apiClient";

export default function CashierProcessRedemptionPage() {
    const [txId, setTxId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [result, setResult] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setMessage("");
        setResult(null);

        const idNum = Number(txId);
        if (!Number.isInteger(idNum) || idNum <= 0) {
            setError("Please enter a valid positive integer transaction ID.");
            return;
        }
        setLoading(true);

        try {
            // Backend: PATCH /transactions/:transactionId/processed
            const data = await apiFetch(`/transactions/${idNum}/processed`, {
                method: "PATCH",
                body: { processed: true },
            });
            setResult(data);
            setMessage(`Redemption transaction #${data.id} processed successfully.`);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to process redemption.");
        } finally {
            setLoading(false);
        }
    }
    function handleReset() {
        setTxId("");
        setError("");
        setMessage("");
        setResult(null);
    }

    return (
        <div style={{ padding: "2rem", maxWidth: 560 }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Cashier: Process Redemption
            </h1>
            <p style={{ marginBottom: "1rem", color: "#4b5563" }}>
                Enter the <strong>redemption transaction ID</strong> shown on the
                customer&apos;s QR code / screen to finalize their redemption and deduct
                points.
             </p>
    
            {error && (
                <p style={{ color: "red", marginBottom: "0.75rem" }}>{error}</p>
            )}
            {message && (
                <p style={{ color: "green", marginBottom: "0.75rem" }}>{message}</p>
            )}
    
            <form
                onSubmit={handleSubmit}
                style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                alignItems: "flex-end",
                marginBottom: "1.5rem",
                }}
            >
                <div style={{ flexGrow: 1, minWidth: 200 }}>
                    <label htmlFor="txId" style={{ display: "block", marginBottom: 4 }}>
                        Redemption Transaction ID
                    </label>
                    <input
                        id="txId"
                        type="number"
                        min="1"
                        value={txId}
                        onChange={(e) => setTxId(e.target.value)}
                        placeholder="e.g., 123"
                        style={{ width: "100%" }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: "0.5rem 1rem",
                        borderRadius: 999,
                        border: "1px solid #4f46e5",
                        backgroundColor: "#4f46e5",
                        color: "white",
                        fontWeight: 500,
                    }}
                >
                    {loading ? "Processing…" : "Process Redemption"}
                </button>
                <button
                    type="button"
                    onClick={handleReset}
                    disabled={loading}
                    style={{
                        padding: "0.45rem 0.9rem",
                        borderRadius: 999,
                        border: "1px solid #d1d5db",
                        backgroundColor: "white",
                        color: "#374151",
                        fontWeight: 400,
                    }}
                >
                    Clear
                </button>
            </form>
    
            {result && (
                <div
                    style={{
                        marginTop: "1rem",
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
                        Processed Redemption Summary
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
                        <dt style={{ fontWeight: 600 }}>Transaction ID:</dt>
                        <dd>{result.id}</dd>
            
                        <dt style={{ fontWeight: 600 }}>User UTORid:</dt>
                        <dd>{result.utorid}</dd>
            
                        <dt style={{ fontWeight: 600 }}>Type:</dt>
                        <dd>{result.type}</dd>
            
                        <dt style={{ fontWeight: 600 }}>Redeemed Points:</dt>
                        <dd>{result.redeemed}</dd>
            
                        <dt style={{ fontWeight: 600 }}>Processed By:</dt>
                        <dd>{result.processedBy ?? "—"}</dd>
            
                        <dt style={{ fontWeight: 600 }}>Original Creator:</dt>
                        <dd>{result.createdBy ?? "—"}</dd>
            
                        <dt style={{ fontWeight: 600 }}>Remark:</dt>
                        <dd>{result.remark || "—"}</dd>
                    </dl>
                </div>
            )}
        </div>
      );
}