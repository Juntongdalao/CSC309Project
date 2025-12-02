import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/apiClient";

const PAGE_SIZE = 10;

// Small helper to show nicer labels
function labelForType(type) {
    switch (type) {
        case "purchase":
            return "Purchase";
        case "redemption":
            return "Redemption";
        case "adjustment":
            return "Adjustment";
        case "transfer":
            return "Transfer";
        case "event":
            return "Event Award";
        default:
            return type;
    }
}

// Basic colour styles per transaction type
function badgeStyle(type) {
    const common = {
        display: "inline-block",
        padding: "0.15rem 0.5rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
    };
  
    switch (type) {
        case "purchase":
            return { ...common, backgroundColor: "#e0f2fe", color: "#0369a1" }; // blue-ish
        case "redemption":
            return { ...common, backgroundColor: "#fee2e2", color: "#b91c1c" }; // red-ish
        case "adjustment":
            return { ...common, backgroundColor: "#fef9c3", color: "#854d0e" }; // yellow-ish
        case "transfer":
            return { ...common, backgroundColor: "#dcfce7", color: "#166534" }; // green-ish
        case "event":
            return { ...common, backgroundColor: "#ede9fe", color: "#5b21b6" }; // purple-ish
        default:
            return { ...common, backgroundColor: "#e5e7eb", color: "#111827" };
    }
}

export default function MyTransactionsPage() {
    const [page, setPage] = useState(1);
    const [type, setType] = useState("");
    const [amountOp, setAmountOp] = useState("");
    const [amount, setAmount] = useState("");

    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
    } = useQuery({
        queryKey: ["my-transactions", { page, type, amountOp, amount }],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("limit", String(PAGE_SIZE));
            if (type) params.set("type", type);
            if (amountOp && amount !== "") {
                params.set("operator", amountOp);
                params.set("amount", String(amount));
            }
            return apiFetch(`/users/me/transactions?${params.toString()}`);
        },
        keepPreviousData: true,
    });
    const total = data?.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const txs = data?.results ?? [];

    function handleApplyFilters(e) {
        e.preventDefault();
        // whenever filters change, go back to first page
        setPage(1);
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
                My Transaction
            </h1>

            {/* Filter */}
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
                <div>
                    <label htmlFor="type" style={{ display: "block", marginBottom: 4 }}>
                        Type
                    </label>
                    <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="">All</option>
                        <option value="purchase">Purchase</option>
                        <option value="redemption">Redemption</option>
                        <option value="adjustment">Adjustment</option>
                        <option value="transfer">Transfer</option>
                        <option value="event">Event Award</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="amount" style={{ display: "block", marginBottom: 4 }}>
                        Amount Filter
                    </label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <select value={amountOp} onChange={(e) => setAmountOp(e.target.value)}>
                            <option value="">Any</option>
                            <option value="gte">≥</option>
                            <option value="lte">≤</option>
                        </select>
                        <input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="points"
                            style={{ width: 120 }}
                        />
                    </div>
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

            {isLoading && <p>Loading transactions…</p>}
            {isError && (
                <p style={{ color: "red" }}>
                    Failed to load transactions: {error?.message || "Unknown error"}
                </p>
            )}

            {!isLoading && !isError && txs.length === 0 && (
                <p>No transactions found.</p>
            )}

            {/* Transaction List */}
            <div>
                {txs.map((tx) => (
                    <article
                        key={tx.id}
                        style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: 12,
                            padding: "0.75rem 1rem",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                        }}
                    >
                        <header
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "0.25rem",
                            }}
                        >
                            <span style={badgeStyle(tx.type)}>{labelForType(tx.type)}</span>
                            <span style={{ fontWeight: 600 }}>
                                {tx.type === "redemption" ? "-" : "+"}
                                {Math.abs(tx.amount)}
                            </span>
                        </header>

                        {/* Secondary Info */}
                        <div style={{ fontSize: "0.9rem", color: "#374151" }}>
                            {typeof tx.spent === "number" && (
                                <div>Spent: ${tx.spent.toFixed(2)}</div>
                            )}
                            {tx.redeemed != null && (
                                <div>Redeemed: {tx.redeemed} points</div>
                            )}
                            {tx.relatedId != null && (
                                <div>
                                    Related ID: {tx.relatedId}{" "}
                                    {/* TODO: optional enhancement: fetch /users/:relatedId to show utorid */}
                                </div>
                            )}
                            {Array.isArray(tx.promotionIds) && tx.promotionIds.length > 0 && (
                                <div>
                                    Promotions:{" "}
                                    {tx.promotionIds.map((p) => p.int ?? p).join(", ")}
                                </div>
                            )}
                            {tx.createdBy && <div>Created by: {tx.createdBy}</div>}
                            {tx.remark && <div>Note: {tx.remark}</div>}
                        </div>
                    </article>
                ))}
            </div>

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
                    <button type="button" onClick={() => setPage((p) => 
                        Math.max(1, p - 1))} disabled={page === 1}>
                        Previous
                    </button>
                    <span>
                        Page {page} / {totalPages}{" "}
                        {isFetching && <span style={{ fontSize: "0.8rem" }}>…loading</span>}
                    </span>
                    <button type="button" onClick={() => setPage((p) => 
                        (p < totalPages ? p + 1 : p))} disabled={page >= totalPages}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}