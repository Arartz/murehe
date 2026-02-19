import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { checkExistingApplication } from "../services/firestoreService";

const ApplicationStatus = () => {
    const { email } = useParams();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const existingApp = await checkExistingApplication(email);
                if (existingApp) {
                    setApplication(existingApp);
                } else {
                    setError("No pending or approved application found for this email.");
                }
            } catch (err) {
                setError("Failed to fetch application status.");
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, [email]);

    if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading status...</div>;

    if (error) {
        return (
            <div style={{ maxWidth: "500px", margin: "50px auto", padding: "20px", border: "1px solid red", borderRadius: "0", textAlign: "center" }}>
                <p style={{ color: "red" }}>{error}</p>
                <button onClick={() => navigate("/apply")} style={{ padding: "10px 20px", cursor: "pointer", borderRadius: "0" }}>Back to Application</button>
            </div>
        );
    }

    const statusColors = {
        pending: "#ffc107",
        approved: "#28a745",
        rejected: "#dc3545"
    };

    return (
        <div style={{ maxWidth: "600px", margin: "50px auto", padding: "30px", border: "1px solid #ccc", borderRadius: "0", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            <h2 style={{ textAlign: "center" }}>Application Status</h2>
            <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "0" }}>
                <p><strong>Child Name:</strong> {application.childFullName}</p>
                <p><strong>Class:</strong> {application.applyingClass}</p>
                <p><strong>Status:</strong> <span style={{
                    padding: "4px 8px",
                    borderRadius: "0",
                    backgroundColor: statusColors[application.status] || "#eee",
                    color: application.status === "pending" ? "#000" : "#fff",
                    fontWeight: "bold"
                }}>{application.status.toUpperCase()}</span></p>
                <p><strong>Submitted On:</strong> {application.createdAt?.toDate ? application.createdAt.toDate().toLocaleDateString() : "Scale date unavailable"}</p>
            </div>
            <div style={{ marginTop: "30px", padding: "15px", border: "1px solid #ffeeba", backgroundColor: "#fff3cd", borderRadius: "0" }}>
                <p style={{ margin: 0, color: "#856404" }}>
                    <strong>Note:</strong> Application under review. You cannot edit or resubmit this application.
                </p>
            </div>
            <button
                onClick={() => navigate("/login")}
                style={{ marginTop: "20px", width: "100%", padding: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "0", cursor: "pointer" }}
            >
                Go to Login
            </button>
        </div>
    );
};

export default ApplicationStatus;
