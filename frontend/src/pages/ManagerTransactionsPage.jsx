import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/apiClient";

const PAGE_SIZE = 10;

export default function ManagerTransactionsPage() {
    const [page, setPage] = useState(1);

    const [searchName, setSearchName] = useState("");
    const [createdBy, setCreatedBy] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [suspiciousFilter, setSuspiciousFilter] = useState("");
    const [amountFilter, setAmountFilter] = useState("");
    const [amountOperator, setAmountOperator] = useState("gte");

    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
    } = useQuery({
        queryKey: [
            "manager-transactions",
            {
                page,
                searchName,
                createdBy,
                typeFilter,
                suspiciousFilter,
                amountFilter,
                amountOperator,
            },
        ],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("limit", String(PAGE_SIZE));

            if (searchName.trim()) params.set("name", searchName.trim());
            if (createdBy.trim()) params.set("createdBy", createdBy.trim());
            if (typeFilter) params.set("type", typeFilter);
            if (suspiciousFilter) params.set("suspicious", suspiciousFilter);

            if (amountFilter.trim()) {
                params.set("amount", amountFilter.trim());
                params.set("operator", amountOperator);
            }

            // Backend: GET /transactions?name=&createdBy=&type=&suspicious=&amount=&operator=&page=&limit=
            return apiFetch(`/transactions?${params.toString()}`);
        },
        keepPreviousData: true,
    });
    const total = data?.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const rows = data?.results ?? [];

    function handleApplyFilters(e) {
        e.preventDefault();
        setPage(1);
    }

    function rowBgForType(type) {
        switch (type) {
            case "purchase":
                return "#ecfdf3"; // light green
            case "transfer":
                return "#eff6ff"; // light blue
            case "redemption":
                return "#fefce8"; // light yellow
            case "adjustment":
                return "#f3f4f6"; // light gray
            default:
                return "white";
        }
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Manager: All Transactions
            </h1>
            <p style={{ marginBottom: "1rem", color: "#4b5563" }}>
                View and filter all transactions (purchases, transfers, redemptions, and adjustments).
            </p>
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
                {/* Name / UTORid filter */}
                <div>
                    <label htmlFor="searchName" style={{ display: "block", marginBottom: 4 }}>
                        User (name / UTORid)
                    </label>
                    <input
                        id="searchName"
                        type="text"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        placeholder="e.g., clive"
                    />
                </div>
                {/* CreatedBy filter */}
                <div>
                    <label htmlFor="createdBy" style={{ display: "block", marginBottom: 4 }}>
                        Created By (UTORid)
                    </label>
                    <input
                        id="createdBy"
                        type="text"
                        value={createdBy}
                        onChange={(e) => setCreatedBy(e.target.value)}
                        placeholder="e.g., cashier1"
                    />
                </div>
                {/* Type filter */}
                <div>
                    <label htmlFor="typeFilter" style={{ display: "block", marginBottom: 4 }}>
                        Type
                    </label>
                    <select
                        id="typeFilter"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="purchase">purchase</option>
                        <option value="transfer">transfer</option>
                        <option value="redemption">redemption</option>
                        <option value="adjustment">adjustment</option>
                    </select>
                </div>
                {/* Suspicious filter */}
                <div>
                    <label htmlFor="suspiciousFilter" style={{ display: "block", marginBottom: 4 }}>
                        Suspicious
                    </label>
                    <select
                        id="suspiciousFilter"
                        value={suspiciousFilter}
                        onChange={(e) => setSuspiciousFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="true">Only suspicious</option>
                        <option value="false">Only non-suspicious</option>
                    </select>
                </div>
                {/* Amount filter */}
                <div>
                    <label style={{ display: "block", marginBottom: 4 }}>Amount filter</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <select
                            value={amountOperator}
                            onChange={(e) => setAmountOperator(e.target.value)}
                        >
                            <option value="gte">≥</option>
                            <option value="lte">≤</option>
                        </select>
                        <input
                            type="number"
                            value={amountFilter}
                            onChange={(e) => setAmountFilter(e.target.value)}
                            placeholder="points"
                            style={{ width: 100 }}
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
            {/* Loading / error */}
            {isLoading && <p>Loading transactions…</p>}
            {isError && (
                <p style={{ color: "red" }}>
                    Failed to load transactions: {error?.message || "Unknown error"}
                </p>
            )}
            {/* Table */}
            {!isLoading && !isError && (
                <>
                    {rows.length === 0 ? (
                        <p>No transactions found.</p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    minWidth: 700,
                                }}                  
                            >
                                <thead>
                                    <tr>
                                        <th style={thStyle}>ID</th>
                                        <th style={thStyle}>User UTORid</th>
                                        <th style={thStyle}>Type</th>
                                        <th style={thStyle}>Spent</th>
                                        <th style={thStyle}>Amount / Redeemed</th>
                                        <th style={thStyle}>Suspicious</th>
                                        <th style={thStyle}>Created By</th>
                                        <th style={thStyle}>Remark</th>
                                        <th style={thStyle}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((tx) => {
                                        const displayAmount =
                                            tx.type === "redemption" && typeof tx.redeemed === "number"
                                                ? `Redeemed: ${tx.redeemed} (Change: ${tx.amount})`
                                                : tx.amount;
                                        return (
                                            <tr key={tx.id} style={{ backgroundColor: rowBgForType(tx.type) }}>
                                                <td style={tdStyle}>{tx.id}</td>
                                                <td style={tdStyle}>{tx.utorid}</td>
                                                <td style={tdStyle}>{tx.type}</td>
                                                <td style={tdStyle}>
                                                    {typeof tx.spent === "number" ? tx.spent.toFixed(2) : "—"}
                                                </td>
                                                <td style={tdStyle}>{displayAmount ?? "—"}</td>
                                                <td style={tdStyle}>
                                                    {tx.suspicious ? (
                                                        <span
                                                            style={{
                                                                padding: "0.1rem 0.5rem",
                                                                borderRadius: 999,
                                                                backgroundColor: "#fee2e2",
                                                                border: "1px solid #fecaca",
                                                                fontSize: "0.8rem",
                                                            }}
                                                        >
                                                            Suspicious
                                                        </span>
                                                    ) : (
                                                        <span
                                                            style={{
                                                                padding: "0.1rem 0.5rem",
                                                                borderRadius: 999,
                                                                backgroundColor: "#ecfdf3",
                                                                border: "1px solid #bbf7d0",
                                                                fontSize: "0.8rem",
                                                            }}
                                                        >
                                                            Normal
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={tdStyle}>{tx.createdBy ?? "—"}</td>
                                                <td style={tdStyle}>
                                                    {tx.remark && tx.remark.trim().length > 0
                                                        ? tx.remark
                                                        : "—"}
                                                </td>
                                                <td style={tdStyle}>
                                                    <Link to={`/manager/transactions/${tx.id}`}>View</Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
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