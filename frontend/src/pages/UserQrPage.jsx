import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/apiClient";
import QRCode from "react-qr-code";

export default function UserQrPage() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["me-qr"],
        queryFn: () => apiFetch("/users/me"),
    });

    if (isLoading) {
        return <div style={{ padding: "2rem" }}>Loading QR code…</div>;
    }

    if (isError) {
        return (
            <div style={{ padding: "2rem" }}>
                <p style={{ color: "red" }}>
                    Failed to load user info: {error?.message || "Unknown error"}
                </p>
            </div>
        );
    }

    const me = data;
    const qrPayload = JSON.stringify({
        id: me.id,
        utorid: me.utorid,
    });

    return (
        <div style={{ padding: "2rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
                My QR Code
            </h1>
            <p>
                This QR identifies you as <strong>{me.utorid}</strong>. Cashiers can
                scan it to start a purchase / transfer.
            </p>
            {/* Basic Info */}
            <div
                style={{
                    background: "lightgrey",
                    marginBottom: "1.5rem",
                    padding: "1rem",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    maxWidth: 320,
                }}
            >
                <p>
                    <strong>UTORid:</strong> {me.utorid}
                </p>
                <p>
                    <strong>User ID:</strong> {me.id}
                </p>
                <p>
                    <strong>Role:</strong> {me.role}
                </p>
                <p>
                    <strong>Current points:</strong> {me.points ?? 0}
                </p>
            </div>
            {/* Actual QR code */}
            <div
                style={{
                    background: "white",
                    padding: "1rem",
                    display: "inline-block",
                    borderRadius: 16,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                }}
            >
                <QRCode value={qrPayload} size={192} />
            </div>
            <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#6b7280" }}>
                Encoded payload: <code>{qrPayload}</code>
            </p>
        </div>
    );
}