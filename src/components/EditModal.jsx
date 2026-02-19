import React, { useState, useEffect } from "react";
import { FiX, FiSave } from "react-icons/fi";
import { updateDocument } from "../services/firestoreService";

const EditModal = ({ isOpen, onClose, data, collectionName, onSave, fields }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (data) {
            setFormData({ ...data }); // Initialize form with selected item data
        }
    }, [data]);

    if (!isOpen || !data) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await updateDocument(collectionName, data.id, formData);
            if (onSave) onSave(); // Callback to refresh data in parent
            onClose();
        } catch (err) {
            console.error("Update failed:", err);
            setError("Failed to update. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] custom-scrollbar">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <FiX size={20} />
                </button>

                <h3 className="text-xl font-bold text-white mb-6">Edit Item</h3>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map((field) => (
                        <div key={field.name}>
                            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                                {field.label}
                            </label>
                            {field.type === "select" ? (
                                <select
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={handleChange}
                                    disabled={field.readOnly}
                                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">Select {field.label}</option>
                                    {field.options?.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            ) : field.type === "textarea" ? (
                                <textarea
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={handleChange}
                                    disabled={field.readOnly}
                                    rows="4"
                                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder={`Enter ${field.label}`}
                                />
                            ) : (
                                <input
                                    type={field.type || "text"}
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={handleChange}
                                    disabled={field.readOnly}
                                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder={`Enter ${field.label}`}
                                />
                            )}
                        </div>
                    ))}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <FiSave size={18} />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditModal;
