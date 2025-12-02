import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/apiClient";

export default function UserPromotionsPage() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["me-promotions"],
        queryFn: () => apiFetch("/users/me"),
    });

    if (isLoading) {
        return <div style={{ padding: "2rem" }}>Loading promotions…</div>;
    }

    if (isError) {
        return (
            <div style={{ padding: "2rem" }}>
                <p style={{ color: "red" }}>
                    Failed to load promotions: {error?.message || "Unknown error"}
                </p>
            </div>
        );
    }

    const me = data;
    const promos = Array.isArray(me.promotions) ? me.promotions : [];

    return (
        <div style={{ padding: "2rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                Available Promotions
            </h1>
            <p style={{ marginBottom: "1rem", color: "#4b5563" }}>
                These are one-time promotions you can still use, based on your current account.
            </p>
            {promos.length === 0 ? (
                <p>You have no available promotions right now.</p>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gap: "1rem",
                        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    }}
                >
                    {promos.map((p) => (
                        <article
                            key={p.id}
                            style={{
                                borderRadius: 16,
                                border: "1px solid #e5e7eb",
                                padding: "1rem 1.25rem",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                                backgroundColor: "white",
                            }}
                        >
                            <h2
                                style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 600,
                                    marginBottom: "0.5rem",
                                }}
                            >
                                {p.name}
                            </h2>
                            <dl>
                                <div>
                                    <dt style={{ display: "inline", fontWeight: 600 }}>Points:&nbsp;</dt>
                                    <dd style={{ display: "inline", margin: 0 }}>
                                        {p.points ?? 0} pts
                                    </dd>
                                </div>
                                {p.minSpending != null && (
                                    <div style={{ marginBottom: 4 }}>
                                        <dt style={{ display: "inline", fontWeight: 600 }}>
                                            Min spending:&nbsp;
                                        </dt>
                                        <dd style={{ display: "inline", margin: 0 }}>${p.minSpending}</dd>
                                    </div>
                                )}
                                {p.rate != null && (
                                    <div style={{ marginBottom: 4 }}>
                                        <dt style={{ display: "inline", fontWeight: 600 }}>
                                            Rate bonus:&nbsp;
                                        </dt>
                                        <dd style={{ display: "inline", margin: 0 }}>{p.rate}</dd>
                                    </div>
                                )}
                            </dl>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}