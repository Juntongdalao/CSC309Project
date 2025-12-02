// Shows a QR code for a specific redemption request. 
// The payload encodes the transaction ID so a cashier can process it later using that ID.

import { useLocation, useParams, Link } from "react-router-dom";
import QRCode from "react-qr-code";

export default function UserRedemptionQrPage() {
    const { transactionId } = useParams();
    const location = useLocation();

    const txIdNum = Number(transactionId);
    const stateAmount = location.state?.amount ?? null;
    const stateRemark = location.state?.remark ?? "";

    // QR payload: cashier just needs the transaction ID; we tag the type for clarity
    const qrPayload = JSON.stringify({
        kind: "redemption",
        transactionId: txIdNum,
    });

    return (
        <div style={{ padding: "2rem", maxWidth: 480 }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
                Redemption QR Code
            </h1>
            <p style={{ marginBottom: "0.75rem", color: "#4b5563" }}>
                Show this QR code to a cashier. They can process your redemption
                request by entering the transaction ID encoded here.
            </p>
            <div
                style={{
                    margin: "1.5rem 0",
                    padding: "1.5rem",
                    borderRadius: 16,
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                }}
            >
                <QRCode
                    value={qrPayload}
                    size={180}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
                <div style={{ textAlign: "center", fontSize: "0.9rem", color: "#374151" }}>
                    <div>
                        <strong>Transaction ID:</strong> {txIdNum || "Unknown"}
                    </div>
                    {stateAmount != null && (
                        <div>
                            <strong>Requested points:</strong> {stateAmount}
                        </div>
                    )}
                    {stateRemark && (
                        <div>
                            <strong>Note:</strong> {stateRemark}
                        </div>
                    )}
                </div>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1rem" }}>
                If you refreshed this page and the amount or note are missing, the QR
                code is still valid. The cashier only needs the transaction ID
                embedded in the QR.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link to="/me/points">Back to My Points</Link>
                <Link to="/me/transactions">View my transactions</Link>
            </div>
        </div>
    );
}