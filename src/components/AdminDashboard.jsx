import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { logout, createSecondaryUser } from "../services/authService";
import {
    getAllDocuments,
    saveDocument,
    deleteDocument,
    updateApplicationStatus,
    createStudentRecord,
    setUserData,
    promoteStudents,
    getTermMarks,
    saveTermResults,
    getStudentsByClass,
    setTermActive,
    setTermLockStatus,
    getUserByEmail,
    sendEmailNotification
} from "../services/firestoreService";
import LogoutModal from "./LogoutModal";
import EditModal from "./EditModal";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("admissions");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [isDirectRegModalOpen, setIsDirectRegModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editFields, setEditFields] = useState([]);
    const [editCollection, setEditCollection] = useState("");

    const tabs = [
        { id: "admissions", label: "Admissions", icon: "group" },
        { id: "classes", label: "Classes", icon: "grid_view" },
        { id: "subjects", label: "Subjects", icon: "book" },
        { id: "teachers", label: "Teachers", icon: "person_check" },
        { id: "students", label: "Students", icon: "school" },
        { id: "assignments", label: "Assignments", icon: "assignment" },
        { id: "promotion", label: "Promotion", icon: "trending_up" },
        { id: "reports", label: "Reports", icon: "description" },
        { id: "terms", label: "Terms", icon: "event" },
        { id: "announcements", label: "Announcements", icon: "campaign" }
    ];

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // Auto-dismiss messages after 3 seconds
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ text: "", type: "" });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message.text]);

    const collectionMap = {
        admissions: "applications",
        classes: "classes",
        subjects: "subjects",
        teachers: "users",
        students: "students",
        assignments: "teacherAssignments",
        promotion: "students",
        reports: "termResults",
        terms: "terms",
        announcements: "announcements"
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            let result = await getAllDocuments(collectionMap[activeTab]);
            if (activeTab === "teachers") {
                result = result.filter(u => u.role === "teacher");
            }
            if (activeTab === "admissions") {
                result = result.sort((a, b) => {
                    const dateA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt).getTime();
                    const dateB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt).getTime();
                    return dateB - dateA;
                });
            }
            setData(result);
        } catch (error) {
            console.error("Fetch data error:", error);
            setMessage({ text: "Failed to load data", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (item) => {
        setEditingItem(item);
        setEditCollection(collectionMap[activeTab]);
        let fields = [];

        if (activeTab === "classes") {
            const teachers = await getAllDocuments("users");
            const teacherOptions = teachers.filter(u => u.role === "teacher").map(t => ({ value: t.id, label: t.fullName }));
            fields = [
                { name: "name", label: "Class Name" },
                { name: "code", label: "Class Code" },
                { name: "teacherId", label: "Class Teacher", type: "select", options: teacherOptions }
            ];
        } else if (activeTab === "subjects") {
            fields = [
                { name: "name", label: "Subject Name" },
                { name: "code", label: "Subject Code" }
            ];
        } else if (activeTab === "teachers") {
            fields = [
                { name: "fullName", label: "Full Name" },
                { name: "email", label: "Email", readOnly: true },
                { name: "phone", label: "Phone Number" }
            ];
        } else if (activeTab === "students") {
            const classes = await getAllDocuments("classes");
            const classOptions = classes.map(c => ({ value: c.name, label: c.name }));
            fields = [
                { name: "fullName", label: "Student Name" },
                { name: "admissionNo", label: "Admission No", readOnly: true },
                { name: "class", label: "Class", type: "select", options: classOptions },
                { name: "parentEmail", label: "Parent Email", readOnly: true }
            ];
        } else if (activeTab === "terms") {
            fields = [
                { name: "name", label: "Term Name" },
                { name: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "archived", label: "Archived" }] }
            ];
        } else if (activeTab === "admissions") {
            const classes = await getAllDocuments("classes");
            const classOptions = classes.map(c => ({ value: c.name, label: c.name }));
            fields = [
                { name: "childFullName", label: "Child Name" },
                { name: "parentFullName", label: "Parent Name" },
                { name: "parentEmail", label: "Parent Email" },
                { name: "applyingClass", label: "Applying Class", type: "select", options: classOptions }
            ];
        } else if (activeTab === "announcements") {
            fields = [
                { name: "title", label: "Announcement Title" },
                { name: "date", label: "Date", type: "date" },
                { name: "content", label: "Content", type: "textarea" }
            ];
        }

        if (fields.length > 0) {
            setEditFields(fields);
            setEditModalOpen(true);
        }
    };

    const handleAction = async (action, id, payload = {}) => {
        setLoading(true);
        try {
            if (action === "delete") {
                await deleteDocument(collectionMap[activeTab], id);
                setMessage({ text: "Deleted successfully", type: "success" });
            } else if (action === "reject") {
                await updateApplicationStatus(id, "rejected", { rejectionReason: payload.reason });
                const app = data.find(a => a.id === id);
                await sendEmailNotification("template_yspm8qj", {
                    to_name: app.parentFullName,
                    to_email: app.parentEmail,
                    from_name: "Jasiri Christian School",
                    subject: `Admission Update for ${app.childFullName}`,
                    status: "Rejected",
                    child_name: app.childFullName,
                    message: `Dear ${app.parentFullName},

Thank you for your interest in admitting ${app.childFullName} to Jasiri Christian School.

After careful review, we regret to inform you that we are unable to offer admission at this time.

${payload.reason || "No specific reason provided."}

Please know this decision does not reflect negatively on your child’s abilities. We truly appreciate the time and effort you took to apply.

We encourage you to apply again in the future should spaces become available.

Wishing you and your child all the best moving forward.

Kind regards,
Head Of Studies
Jasiri Christian School
+250 786 084 272`
                });
                setMessage({ text: "Application rejected and parent notified", type: "success" });
            } else if (action === "approve") {
                const app = data.find(a => a.id === id);
                const tempPassword = payload.password || "Password123!";
                let parentUid;

                try {
                    const parentUser = await createSecondaryUser(app.parentEmail, tempPassword);
                    parentUid = parentUser.uid;
                    await setUserData(parentUid, {
                        email: app.parentEmail,
                        fullName: app.parentFullName || "Parent",
                        role: "parent"
                    });
                } catch (err) {
                    if (err.code === "auth/email-already-in-use") {
                        const existingUser = await getUserByEmail(app.parentEmail);
                        if (existingUser) {
                            parentUid = existingUser.uid;
                        } else {
                            throw new Error("Email is already in use, but no matching profile was found in the database.");
                        }
                    } else {
                        throw err;
                    }
                }

                const student = await createStudentRecord({
                    fullName: app.childFullName,
                    class: app.applyingClass,
                    parentEmail: app.parentEmail,
                    parentUid: parentUid,
                    status: "active"
                });

                await updateApplicationStatus(id, "approved", { studentAdmissionId: student.admissionNo });

                await sendEmailNotification("template_yspm8qj", {
                    to_name: app.parentFullName,
                    to_email: app.parentEmail,
                    from_name: "Jasiri Christian School",
                    subject: `Admission Approved - ${app.childFullName}`,
                    status: "Approved",
                    child_name: app.childFullName,
                    message: `Dear ${app.parentFullName},

Congratulations! We are pleased to inform you that your child, ${app.childFullName}, has been offered admission to Jasiri Christian School.

Your parent portal account has been created. Please use the following credentials to access the portal:

Student ID: ${student.admissionNo}
Login Email: ${app.parentEmail}
Initial Password: ${tempPassword}

Please login at our portal and use the 'Forgot Password' feature if you wish to set a new password.

Welcome to the Jasiri family!

Kind regards,
Admissions Office
Jasiri Christian School
+250 786 084 272`
                });

                setMessage({
                    text: `SUCCESS: Account created and parent notified. Student ID: ${student.admissionNo}`,
                    type: "success"
                });
            } else if (action === "manualRegister") {
                const { student: s, parent: p } = payload;
                const tempPassword = p.password || "Password123!";
                let parentUid;

                // 1. Create/Link Parent Account
                try {
                    const parentUser = await createSecondaryUser(p.email, tempPassword);
                    parentUid = parentUser.uid;
                    await setUserData(parentUid, {
                        email: p.email,
                        fullName: p.fullName || "Parent",
                        role: "parent"
                    });
                } catch (err) {
                    if (err.code === "auth/email-already-in-use") {
                        const existingUser = await getUserByEmail(p.email);
                        if (existingUser) {
                            parentUid = existingUser.uid;
                        } else {
                            throw new Error("Email is already in use, but no matching profile was found in the database.");
                        }
                    } else {
                        throw err;
                    }
                }

                // 2. Create Student Record
                const student = await createStudentRecord({
                    fullName: s.fullName,
                    class: s.className,
                    parentEmail: p.email,
                    parentUid: parentUid,
                    status: "active",
                    dateOfBirth: s.dob,
                    gender: s.gender,
                    religiousAffiliation: s.religion
                });

                // 3. Notify Parent
                await sendEmailNotification("template_yspm8qj", {
                    to_name: p.fullName,
                    to_email: p.email,
                    from_name: "Jasiri Christian School",
                    subject: `Welcome to Jasiri - Student Registered: ${s.fullName}`,
                    status: "Registered",
                    child_name: s.fullName,
                    message: `Dear ${p.fullName},

We have manually registered your child, ${s.fullName}, into Jasiri Christian School for the ${s.className} class.

A parent portal account has been prepared for you. Please use the following details to log in and track your child's progress:

Student ID: ${student.admissionNo}
Login Email: ${p.email}
Initial Password: ${tempPassword}

You can access the portal at [Your Portal URL] and change your password after logging in.

Welcome to our community!

Kind regards,
Admissions Office
Jasiri Christian School`
                });

                setMessage({
                    text: `Manual Registration Successful! Student ID: ${student.admissionNo}`,
                    type: "success"
                });
            }
            fetchData();
        } catch (error) {
            console.error(error);
            setMessage({ text: "Operation failed: " + error.message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case "admissions":
                return <AdmissionsTab data={data} handleAction={handleAction} setMessage={setMessage} handleEdit={handleEdit} onDirectReg={() => setIsDirectRegModalOpen(true)} />;
            case "classes":
                return <GenericManagementTab activeTab={activeTab} fields={["name", "code"]} collectionName="classes" data={data} fetchData={fetchData} handleAction={handleAction} handleEdit={handleEdit} />;
            case "subjects":
                return <GenericManagementTab activeTab={activeTab} fields={["name", "code"]} collectionName="subjects" data={data} fetchData={fetchData} handleAction={handleAction} handleEdit={handleEdit} />;
            case "teachers":
                return <TeachersTab data={data} fetchData={fetchData} setActiveTab={setActiveTab} setMessage={setMessage} handleAction={handleAction} setUserData={setUserData} handleEdit={handleEdit} />;
            case "students":
                return <GenericManagementTab activeTab={activeTab} fields={["fullName", "class", "parentUid"]} collectionName="students" data={data} fetchData={fetchData} handleAction={handleAction} handleEdit={handleEdit} />;
            case "assignments":
                return <AssignmentsTab data={data} fetchData={fetchData} setMessage={setMessage} handleAction={handleAction} />;
            case "promotion":
                return <PromotionTab setMessage={setMessage} />;
            case "reports":
                return <ReportsTab setMessage={setMessage} />;
            case "terms":
                return <TermsTab data={data} fetchData={fetchData} setMessage={setMessage} handleAction={handleAction} handleEdit={handleEdit} />;
            case "announcements":
                return <AnnouncementsTab data={data} fetchData={fetchData} setMessage={setMessage} handleAction={handleAction} handleEdit={handleEdit} />;
            default:
                return <p>Select a tab</p>;
        }
    };

    const SidebarItem = ({ label, icon, active, onClick }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-300 group ${active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-primary/10 hover:text-primary"}`}
        >
            <span className={`material-symbols-outlined transition-colors ${active ? "text-white" : "group-hover:text-primary"}`}>{icon}</span>
            <span className="font-medium font-sans">{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 overflow-hidden">
            <LogoutModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={logout}
            />

            {/* Direct Registration Modal */}
            {isDirectRegModalOpen && (
                <DirectRegistrationModal
                    onClose={() => setIsDirectRegModalOpen(false)}
                    onConfirm={(registrationData) => handleAction("manualRegister", null, registrationData)}
                />
            )}

            {/* Edit Modal */}
            <EditModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                data={editingItem}
                collectionName={editCollection}
                fields={editFields}
                onSave={() => {
                    fetchData();
                    setMessage({ text: "Item updated successfully!", type: "success" });
                }}
            />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar Navigation */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-primary/10 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} flex flex-col`}>
                <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-primary/10 h-20">
                    <div>
                        <img src="/assets/logo.png" alt="Jasiri Logo" className="h-10 w-auto" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight font-display text-primary dark:text-white">Jasiri Portal</h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400">Admin Control</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Management</p>
                    {tabs.map((tab) => (
                        <SidebarItem
                            key={tab.id}
                            label={tab.label}
                            icon={tab.icon}
                            active={activeTab === tab.id}
                            onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                        />
                    ))}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-primary/10">
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="font-medium">Sign Out</span>
                    </button>

                    <div className="mt-6 px-4 flex items-center gap-3">
                        <div className="size-10 rounded-none bg-primary/10 text-primary flex items-center justify-center font-bold">
                            A
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate text-slate-900 dark:text-white">Admin User</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Super Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background-dark">
                {/* Top Header */}
                <header className="bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-primary/10 sticky top-0 z-30 px-6 py-4 flex items-center justify-between h-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden size-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-primary/10 rounded-none transition-colors"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">Jasiri School Management System</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-none border border-emerald-500/20">
                            <span className="size-2 bg-emerald-500 rounded-none animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest">System Online</span>
                        </div>
                    </div>
                </header>

                <div className="p-6 lg:p-10">
                    {/* Success/Error Messages */}
                    {message.text && (
                        <div className={`mb-8 p-6 rounded-none border-l-4 shadow-xl animate-fade-in ${message.type === "success"
                            ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                            : "bg-red-50 dark:bg-red-900/10 border-red-500 text-red-700 dark:text-red-300"
                            }`}>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined">
                                    {message.type === "success" ? "check_circle" : "error"}
                                </span>
                                <p className="font-bold text-sm tracking-tight">{message.text}</p>
                            </div>
                        </div>
                    )}

                    {/* Content Section */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 gap-4">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-medium animate-pulse">Synchronizing Data...</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {renderContent()}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

// --- Standalone Tab Components ---

const PremiumCard = ({ title, subtitle, icon, children, footer }) => (
    <div className="bg-white rounded-none shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden border border-[#f0f0f0] mb-8">
        <div className="p-10 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
            <div>
                <h3 className="text-2xl font-black text-black tracking-tight">{title}</h3>
                {subtitle && <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{subtitle}</p>}
            </div>
            {icon && <span className="material-symbols-outlined text-4xl text-slate-300">{icon}</span>}
        </div>
        <div className="p-0">
            {children}
        </div>
        {footer && <div className="p-10 bg-gray-50/50 border-t border-gray-100">{footer}</div>}
    </div>
);

const Badge = ({ status }) => {
    const styles = {
        approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
        rejected: "bg-red-500/10 text-red-600 border-red-500/30",
        active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
        archived: "bg-slate-500/10 text-slate-600 border-slate-500/30",
        pending: "bg-amber-500/10 text-amber-600 border-amber-500/30"
    };

    const style = styles[status?.toLowerCase()] || "bg-slate-500/10 text-slate-600 border-slate-500/30";

    return (
        <span className={`px-4 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest border ${style}`}>
            {status}
        </span>
    );
};

// --- Standalone Tab Components ---

const AdmissionsTab = ({ data, handleAction, handleEdit, onDirectReg }) => {
    const [rejectionReason, setRejectionReason] = useState("");
    const [selectedAppId, setSelectedAppId] = useState(null);
    const [appToApprove, setAppToApprove] = useState(null);
    const [approvePassword, setApprovePassword] = useState("Password123!");

    return (
        <div className="space-y-8 mt-4">
            <div className="flex justify-end">
                <button
                    onClick={onDirectReg}
                    className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    Direct Registration
                </button>
            </div>
            <PremiumCard title="Recent Applications" subtitle="Manage student admissions and parent accounts" icon="how_to_reg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100/50">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Child Name</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Parent Email</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Class</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map(app => (
                                <tr key={app.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="px-10 py-8">
                                        <span className="text-sm font-black text-black uppercase">{app.childFullName}</span>
                                    </td>
                                    <td className="px-10 py-8 text-sm text-slate-500 font-medium font-sans">{app.parentEmail}</td>
                                    <td className="px-10 py-8 text-sm text-slate-500 font-black">{app.applyingClass}</td>
                                    <td className="px-10 py-8 text-center">
                                        <Badge status={app.status} />
                                    </td>
                                    <td className="px-10 py-8 text-right space-x-2">
                                        <button onClick={() => handleEdit(app)} className="p-2 text-primary hover:bg-primary/10 rounded-none transition-colors" title="Edit">
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        {app.status === "pending" && (
                                            <>
                                                <button onClick={() => setAppToApprove(app)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-none transition-colors" title="Approve">
                                                    <span className="material-symbols-outlined">check_circle</span>
                                                </button>
                                                <button onClick={() => setSelectedAppId(app.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-none transition-colors" title="Reject">
                                                    <span className="material-symbols-outlined">cancel</span>
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </PremiumCard>

            {selectedAppId && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setSelectedAppId(null);
                    }}
                >
                    <div className="bg-white dark:bg-surface-dark border border-red-200 dark:border-red-900/30 rounded-none p-8 shadow-2xl max-w-lg w-full animate-slide-up divide-y divide-red-100 dark:divide-red-900/20">
                        <div className="pb-6">
                            <h4 className="text-xl font-bold text-red-700 dark:text-red-400 font-display uppercase tracking-tight">Reject Application</h4>
                            <p className="text-xs text-slate-500 mt-1">Please provide a reason. This will be visible to the parent.</p>
                        </div>
                        <div className="py-6">
                            <textarea
                                placeholder="Enter rejection reason here..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-6 py-4 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-red-900/30 rounded-none text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-sans"
                                rows="4"
                                autoFocus
                            />
                        </div>
                        <div className="pt-6 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => handleAction("reject", selectedAppId, { reason: rejectionReason })}
                                className="flex-1 px-8 py-4 bg-red-600 text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-red-200 dark:shadow-none hover:bg-red-700 transition-all active:scale-95"
                            >
                                Confirm Rejection
                            </button>
                            <button
                                onClick={() => setSelectedAppId(null)}
                                className="flex-1 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-none font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {appToApprove && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setAppToApprove(null);
                    }}
                >
                    <div className="bg-white dark:bg-surface-dark border border-emerald-200 dark:border-emerald-900/30 rounded-none p-8 shadow-2xl max-w-lg w-full animate-slide-up divide-y divide-emerald-100 dark:divide-emerald-900/20 text-center">
                        <div className="pb-6">
                            <h4 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 font-display uppercase tracking-tight truncate">Approve {appToApprove.childFullName}</h4>
                            <p className="text-xs text-slate-500 mt-1">Set an initial password for the parent to log in.</p>
                        </div>

                        <div className="py-8">
                            <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Initial Password</label>
                            <input
                                type="text"
                                value={approvePassword}
                                onChange={(e) => setApprovePassword(e.target.value)}
                                className="w-full px-6 py-4 bg-slate-50 dark:bg-background-dark border border-emerald-200 dark:border-emerald-900/30 rounded-none text-slate-900 dark:text-white font-bold text-center text-xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-sans"
                                autoFocus
                            />
                        </div>

                        <div className="pt-6 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={async () => {
                                    await handleAction("approve", appToApprove.id, { password: approvePassword });
                                    setAppToApprove(null);
                                }}
                                className="flex-1 px-8 py-4 bg-emerald-600 text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 dark:shadow-none hover:bg-emerald-700 transition-all active:scale-95"
                            >
                                Complete Approval
                            </button>
                            <button
                                onClick={() => setAppToApprove(null)}
                                className="flex-1 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-none font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const GenericManagementTab = ({ activeTab, fields, collectionName, data, fetchData, handleAction, handleEdit }) => {
    const [form, setForm] = useState({});

    return (
        <div className="space-y-8">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-none p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-[0.03] blur-[100px] pointer-events-none"></div>
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 block ml-2">Add New {activeTab.slice(0, -1)}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    {fields.map(f => (
                        <div key={f} className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">{f.replace(/([A-Z])/g, ' $1')}</label>
                            <input
                                placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-none text-white font-bold focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                value={form[f] || ""}
                                onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                            />
                        </div>
                    ))}
                    <button
                        onClick={async () => {
                            if (Object.keys(form).length < fields.length) return;
                            await saveDocument(collectionName, form);
                            setForm({});
                            fetchData();
                        }}
                        className="px-8 py-4 bg-primary text-white rounded-none font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                    >
                        Create Record
                    </button>
                </div>
            </div>

            <PremiumCard title={`${(activeTab?.charAt(0).toUpperCase() || "") + activeTab?.slice(1)} Directory`} icon="list_alt">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100/50">
                                {fields.map(f => <th key={f} className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{f.replace(/([A-Z])/g, ' $1')}</th>)}
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map(item => (
                                <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                                    {fields.map(f => (
                                        <td key={f} className="px-10 py-8">
                                            <span className="text-sm font-black text-black uppercase">{item[f]}</span>
                                        </td>
                                    ))}
                                    <td className="px-10 py-8 text-right space-x-2">
                                        <button onClick={() => handleEdit(item)} className="p-2 text-primary hover:bg-primary/10 rounded-none transition-colors">
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button onClick={() => handleAction("delete", item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-none transition-colors">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </PremiumCard>
        </div>
    );
};

const TeachersTab = ({ data, fetchData, setActiveTab, setMessage, handleAction, setUserData, handleEdit }) => {
    const [form, setForm] = useState({});
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        const loadAssignments = async () => {
            const data = await getAllDocuments("teacherAssignments");
            setAssignments(data);
        };
        loadAssignments();
    }, []);

    const getSummary = (id) => {
        const count = assignments.filter(a => a.teacherUid === id).length;
        if (count === 0) return "No Assignments";
        return `${count} Assignment${count > 1 ? "s" : ""}`;
    };

    return (
        <div className="space-y-8">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-none p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-[0.03] blur-[100px] pointer-events-none"></div>
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 block ml-2">Register New Teacher</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Full Name</label>
                        <input
                            placeholder="Full Name"
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            value={form.fullName || ""}
                            onChange={e => setForm({ ...form, fullName: e.target.value, role: "teacher" })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
                        <input
                            placeholder="Email"
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            value={form.email || ""}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Initial Password</label>
                        <input
                            type="password"
                            placeholder="Initial Password"
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            value={form.password || ""}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                        />
                    </div>
                </div>
                <button
                    onClick={async () => {
                        if (!form.email || !form.fullName || !form.password) return;
                        try {
                            const secondaryUser = await createSecondaryUser(form.email, form.password, "teacher", { fullName: form.fullName });
                            await setUserData(secondaryUser.uid, {
                                email: form.email,
                                fullName: form.fullName,
                                role: "teacher"
                            });
                            const tempPass = form.password;
                            setForm({}); fetchData();
                            setMessage({
                                text: `Teacher Registered! Email: ${form.email} | Password: ${tempPass}.`,
                                type: "success"
                            });
                            if (window.confirm("Teacher registered! Go to assignments?")) setActiveTab("assignments");
                        } catch (err) {
                            const msg = err.code === "auth/email-already-in-use" ? "This email is already registered." : err.message;
                            setMessage({ text: msg, type: "error" });
                        }
                    }}
                    className="mt-8 px-10 py-4 bg-primary text-white rounded-none font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">person_add</span>
                    Register Faculty Member
                </button>
            </div>

            <PremiumCard title="Faculty Directory" icon="supervised_user_circle">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100/50">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Full Name</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Email</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Workload</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map(item => (
                                <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-none bg-primary/10 text-primary flex items-center justify-center font-black">{item.fullName?.charAt(0) || "?"}</div>
                                            <span className="text-sm font-black text-black uppercase">{item.fullName || "Unnamed Faculty"}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-sm text-slate-500 font-medium font-sans">{item.email}</td>
                                    <td className="px-10 py-8">
                                        <Badge status={assignments.filter(a => a.teacherUid === item.id).length > 0 ? "active" : "pending"} />
                                        <span className="ml-3 text-xs font-bold text-slate-400 uppercase tracking-widest">{getSummary(item.id)}</span>
                                    </td>
                                    <td className="px-10 py-8 text-right space-x-2">
                                        <button onClick={() => handleEdit(item)} className="p-2 text-primary hover:bg-primary/10 rounded-none transition-colors">
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button onClick={() => setActiveTab("assignments")} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-none transition-colors">
                                            <span className="material-symbols-outlined">assignment_ind</span>
                                        </button>
                                        <button onClick={() => handleAction("delete", item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-none transition-colors">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </PremiumCard>
        </div>
    );
};

const AssignmentsTab = ({ data, fetchData, setMessage, handleAction }) => {
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [form, setForm] = useState({ teacherUid: "", className: "", subject: "" });

    useEffect(() => {
        const loadRefs = async () => {
            const [u, c, s] = await Promise.all([
                getAllDocuments("users"),
                getAllDocuments("classes"),
                getAllDocuments("subjects")
            ]);
            setTeachers(u.filter(x => x.role === "teacher"));
            setClasses(c);
            setSubjects(s);
        };
        loadRefs();
    }, []);

    return (
        <div className="space-y-8">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-none p-10 shadow-2xl relative overflow-hidden">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 block ml-2">Create New Assignment</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Select Teacher</label>
                        <select value={form.teacherUid} onChange={e => setForm({ ...form, teacherUid: e.target.value })} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-none text-white font-bold focus:ring-4 focus:ring-primary/20 transition-all outline-none appearance-none">
                            <option value="">Choose Teacher</option>
                            {teachers.map(t => <option key={t.id} value={t.id} className="text-black">{t.fullName}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Assign Class</label>
                        <select value={form.className} onChange={e => setForm({ ...form, className: e.target.value })} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-none text-white font-bold focus:ring-4 focus:ring-primary/20 transition-all outline-none appearance-none">
                            <option value="">Choose Class</option>
                            {classes.map(c => <option key={c.id} value={c.name} className="text-black">{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Assign Subject</label>
                        <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-none text-white font-bold focus:ring-4 focus:ring-primary/20 transition-all outline-none appearance-none">
                            <option value="">Choose Subject</option>
                            {subjects.map(s => <option key={s.id} value={s.name} className="text-black">{s.name}</option>)}
                        </select>
                    </div>
                </div>
                <button
                    onClick={async () => {
                        if (!form.teacherUid || !form.className || !form.subject) return;
                        const t = teachers.find(x => x.id === form.teacherUid);
                        await saveDocument("teacherAssignments", { ...form, teacherName: t?.fullName });
                        setForm({ ...form, className: "", subject: "" }); fetchData();
                        setMessage({ text: "Assignment saved successfully!", type: "success" });
                    }}
                    className="mt-8 px-10 py-4 bg-emerald-600 text-white rounded-none font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add_task</span>
                    Confirm Assignment
                </button>
            </div>

            <PremiumCard title="Current Assignments" icon="assignment_turned_in">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100/50">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Faculty Name</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Class</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Subject</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map(item => (
                                <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-sm">person</span>
                                            </div>
                                            <span className="text-sm font-black text-black uppercase">{item.teacherName}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-sm text-slate-500 font-black tracking-widest">{item.className}</td>
                                    <td className="px-10 py-8">
                                        <Badge status="active" />
                                        <span className="ml-3 text-xs font-bold text-slate-500 uppercase tracking-widest transition-colors">{item.subject}</span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button onClick={() => handleAction("delete", item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-none transition-colors">
                                            <span className="material-symbols-outlined">delete_sweep</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </PremiumCard>
        </div>
    );
};

const PromotionTab = ({ setMessage }) => {
    const [classes, setClasses] = useState([]);
    const [source, setSource] = useState("");
    const [target, setTarget] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => setClasses(await getAllDocuments("classes"));
        load();
    }, []);

    const run = async () => {
        if (!source || !target || source === target) return;
        setLoading(true);
        try {
            const count = await promoteStudents(source, target);
            setMessage({ text: `Success! Promoted ${count} students to ${target}.`, type: "success" });
            setSource(""); setTarget("");
        } catch (err) { setMessage({ text: err.message, type: "error" }); }
        finally { setLoading(false); }
    };

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <PremiumCard title="Student Promotion" subtitle="Advance an entire class to the next level" icon="trending_up">
                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Source Class (Current)</label>
                            <select value={source} onChange={e => setSource(e.target.value)} className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-none text-black font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none appearance-none">
                                <option value="">-- Select Source --</option>
                                {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Target Class (Next Level)</label>
                            <select value={target} onChange={e => setTarget(e.target.value)} className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-none text-black font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none appearance-none">
                                <option value="">-- Select Target --</option>
                                {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-8 bg-emerald-50 border border-emerald-100 rounded-none">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-emerald-600">info</span>
                            <p className="text-xs text-emerald-800 font-bold uppercase tracking-tight">All students will be moved from {source || "..."} to {target || "..."}</p>
                        </div>
                        <button
                            onClick={run}
                            disabled={loading || !source || !target}
                            className={`px-10 py-5 bg-emerald-600 text-white rounded-none font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 transition-all flex items-center gap-3 ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"}`}
                        >
                            {loading ? <div className="W-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <span className="material-symbols-outlined">rocket_launch</span>}
                            Initiate Promotion
                        </button>
                    </div>

                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest px-10">
                        Warning: This action is irreversible. It will update the class field for all students in the source class.
                    </p>
                </div>
            </PremiumCard>
        </div>
    );
};

const ReportsTab = ({ setMessage }) => {
    const [classes, setClasses] = useState([]);
    const [selClass, setSelClass] = useState("");
    const [term, setTerm] = useState("Term 1");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => setClasses(await getAllDocuments("classes"));
        load();
    }, []);

    const run = async () => {
        if (!selClass || !term) return;
        setLoading(true);
        try {
            const marks = await getTermMarks(selClass, term);
            const students = await getStudentsByClass(selClass);
            if (marks.length === 0) { setMessage({ text: "No marks found for this criteria.", type: "warning" }); return; }

            const reports = {};
            marks.forEach(m => {
                if (!reports[m.studentId]) reports[m.studentId] = { total: 0, count: 0 };
                reports[m.studentId].total += m.score;
                reports[m.studentId].count++;
            });

            const results = Object.entries(reports).map(([id, d]) => {
                const avg = d.total / d.count;
                return {
                    studentId: id,
                    studentName: students.find(s => s.id === id)?.fullName || "Unknown",
                    classId: selClass,
                    term,
                    totalScore: d.total,
                    averageScore: avg,
                    grade: avg >= 80 ? "A" : avg >= 70 ? "B" : avg >= 60 ? "C" : avg >= 50 ? "D" : "F",
                    subjectsRecorded: d.count
                };
            }).sort((a, b) => b.totalScore - a.totalScore);

            results.forEach((r, i) => r.position = i + 1);
            await saveTermResults(results);
            setMessage({ text: `Analytics compiled! ${results.length} records processed for ${selClass}.`, type: "success" });
        } catch (err) { setMessage({ text: err.message, type: "error" }); }
        finally { setLoading(false); }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <PremiumCard title="Report Generator" subtitle="Compile term results and academic rankings" icon="analytics">
                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Target Class</label>
                            <select value={selClass} onChange={e => setSelClass(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-none text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none">
                                <option value="">-- Choose Class --</option>
                                {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Academic Term</label>
                            <input
                                value={term}
                                onChange={e => setTerm(e.target.value)}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-none text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all font-sans"
                            />
                        </div>
                    </div>

                    <button
                        onClick={run}
                        disabled={loading || !selClass}
                        className="w-full py-5 bg-primary text-white rounded-none font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 mt-4"
                    >
                        {loading ? (
                            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <span className="material-symbols-outlined">calculate</span>
                        )}
                        {loading ? "Crunching Numbers..." : "Generate Rank Report"}
                    </button>

                    <div className="p-6 bg-slate-50 rounded-none border border-slate-100 flex items-start gap-4">
                        <span className="material-symbols-outlined text-primary mt-1">info</span>
                        <div>
                            <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">System Notice</p>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                                This will aggregate all recorded subject marks for the selected class and term, calculate averages, assign grades, and determine class positions. Results will be saved to the permanent academic record.
                            </p>
                        </div>
                    </div>
                </div>
            </PremiumCard>
        </div>
    );
};

const TermsTab = ({ data, fetchData, handleAction, handleEdit }) => {
    const [name, setName] = useState("");
    return (
        <div className="space-y-8">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-none p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block ml-2">System Configuration</h4>
                    <h3 className="text-2xl font-black text-white px-2">Initialize New Academic Term</h3>
                </div>
                <div className="flex w-full md:w-auto gap-4">
                    <input
                        placeholder="e.g., Term 1 2024"
                        className="flex-1 md:w-64 px-6 py-4 bg-white/5 border border-white/10 rounded-none text-white font-bold outline-none focus:ring-4 focus:ring-primary/20 transition-all font-sans"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <button
                        onClick={async () => {
                            if (!name) return;
                            await saveDocument("terms", { name, status: "archived", locked: false });
                            setName(""); fetchData();
                        }}
                        className="px-8 py-4 bg-emerald-600 text-white rounded-none font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                    >
                        Create
                    </button>
                </div>
            </div>

            <PremiumCard title="Institutional Terms" icon="calendar_month">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100/50">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Term Name</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Lifecycle</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Data Integrity</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Control Axis</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map(t => (
                                <tr key={t.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="px-10 py-8">
                                        <span className="text-sm font-black text-black uppercase">{t.name}</span>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <Badge status={t.status} />
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-none border text-[10px] font-black uppercase tracking-widest ${t.locked ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                                            <span className="material-symbols-outlined text-xs">{t.locked ? "lock" : "lock_open"}</span>
                                            {t.locked ? "Permanent" : "Editable"}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right space-x-2">
                                        <button onClick={() => handleEdit(t)} className="p-2 text-primary hover:bg-primary/10 rounded-none transition-colors" title="Edit Meta">
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        {t.status !== "active" && (
                                            <button
                                                onClick={async () => { await setTermActive(t.id); fetchData(); }}
                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-none transition-colors"
                                                title="Set Active"
                                            >
                                                <span className="material-symbols-outlined">rocket</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={async () => { await setTermLockStatus(t.id, !t.locked); fetchData(); }}
                                            className={`p-2 rounded-none transition-colors ${t.locked ? "text-amber-600 hover:bg-amber-50" : "text-slate-600 hover:bg-slate-100"}`}
                                            title={t.locked ? "Unlock" : "Lock"}
                                        >
                                            <span className="material-symbols-outlined">{t.locked ? "lock_open" : "lock"}</span>
                                        </button>
                                        <button onClick={() => handleAction("delete", t.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-none transition-colors" title="Purge Record">
                                            <span className="material-symbols-outlined">delete_forever</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </PremiumCard>
        </div>
    );
};

const AnnouncementsTab = ({ data, fetchData, setMessage, handleAction, handleEdit }) => {
    const [form, setForm] = useState({ title: "", date: new Date().toISOString().split('T')[0], content: "" });

    return (
        <div className="space-y-8">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-none p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-[0.03] blur-[100px] pointer-events-none"></div>
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 block ml-2">Post New Announcement</h4>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Announcement Title</label>
                            <input
                                placeholder="E.g., Term 1 Exams Schedule"
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-none text-white font-bold focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Publication Date</label>
                            <input
                                type="date"
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-none text-white font-bold focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Announcement Content</label>
                        <textarea
                            placeholder="Write your announcement here..."
                            rows="4"
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-none text-white font-bold focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                        />
                    </div>
                    <button
                        onClick={async () => {
                            if (!form.title || !form.content || !form.date) return;
                            await saveDocument("announcements", form);
                            setForm({ title: "", date: new Date().toISOString().split('T')[0], content: "" });
                            fetchData();
                            setMessage({ text: "Announcement posted successfully!", type: "success" });
                        }}
                        className="px-10 py-4 bg-primary text-white rounded-none font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">campaign</span>
                        Broadcast Announcement
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">history</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">Announcement History</h3>
                </div>
                {data.length > 0 && (
                    <button
                        onClick={async () => {
                            if (window.confirm("ARE YOU SURE? This will permanently delete ALL announcements. This action cannot be undone.")) {
                                try {
                                    await clearCollection("announcements");
                                    setMessage({ text: "All announcements cleared!", type: "success" });
                                    fetchData();
                                } catch (error) {
                                    setMessage({ text: "Failed to clear announcements.", type: "error" });
                                }
                            }
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-none font-black text-[10px] uppercase tracking-widest transition-all border border-red-600/20"
                    >
                        <span className="material-symbols-outlined text-sm">delete_sweep</span>
                        Clear All Posts
                    </button>
                )}
            </div>

            <PremiumCard title="" noPadding>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100/50">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Title</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map(item => (
                                <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="px-10 py-8">
                                        <span className="text-sm font-black text-black uppercase">{item.title}</span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="text-sm font-medium text-slate-500">{item.date}</span>
                                    </td>
                                    <td className="px-10 py-8 text-right space-x-2">
                                        <button onClick={() => handleEdit(item)} className="p-2 text-primary hover:bg-primary/10 rounded-none transition-colors">
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button onClick={() => handleAction("delete", item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-none transition-colors">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </PremiumCard>
        </div>
    );
};

const DirectRegistrationModal = ({ onClose, onConfirm }) => {
    const [step, setStep] = useState(1);
    const [registration, setRegistration] = useState({
        student: {
            fullName: "",
            dob: "",
            gender: "",
            className: "",
            religion: ""
        },
        parent: {
            fullName: "",
            email: "",
            password: "Password123!"
        }
    });

    const updateStudent = (e) => {
        const { name, value } = e.target;
        setRegistration(prev => ({
            ...prev,
            student: { ...prev.student, [name]: value }
        }));
    };

    const updateParent = (e) => {
        const { name, value } = e.target;
        setRegistration(prev => ({
            ...prev,
            parent: { ...prev.parent, [name]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onConfirm(registration);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-primary/10 rounded-none p-10 shadow-2xl max-w-2xl w-full animate-slide-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-primary/10 pb-6">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-3xl">person_add</span>
                        <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white uppercase tracking-tight">Manual Registration</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className={`p-4 border-b-4 transition-all ${step === 1 ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-800 opacity-50"}`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${step === 1 ? "text-primary" : "text-slate-400"}`}>Step 01</p>
                        <p className="font-bold text-slate-900 dark:text-white">Student Information</p>
                    </div>
                    <div className={`p-4 border-b-4 transition-all ${step === 2 ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-800 opacity-50"}`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${step === 2 ? "text-primary" : "text-slate-400"}`}>Step 02</p>
                        <p className="font-bold text-slate-900 dark:text-white">Parent & Access</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Student Full Name</label>
                                <input
                                    name="fullName"
                                    value={registration.student.fullName}
                                    onChange={updateStudent}
                                    placeholder="e.g. John Doe Junior"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/10 rounded-none text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all font-sans"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={registration.student.dob}
                                    onChange={updateStudent}
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/10 rounded-none text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all font-sans"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Gender</label>
                                <select
                                    name="gender"
                                    value={registration.student.gender}
                                    onChange={updateStudent}
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/10 rounded-none text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all font-sans"
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Class Name</label>
                                <input
                                    name="className"
                                    value={registration.student.className}
                                    onChange={updateStudent}
                                    placeholder="e.g. Baby Class"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/10 rounded-none text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all font-sans"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Religion</label>
                                <input
                                    name="religion"
                                    value={registration.student.religion}
                                    onChange={updateStudent}
                                    placeholder="e.g. Christian"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/10 rounded-none text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all font-sans"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Parent Full Name</label>
                                <input
                                    name="fullName"
                                    value={registration.parent.fullName}
                                    onChange={updateParent}
                                    placeholder="e.g. John Doe Senior"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/10 rounded-none text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all font-sans"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Parent Email (Login Username)</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={registration.parent.email}
                                    onChange={updateParent}
                                    placeholder="parent@example.com"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/10 rounded-none text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all font-sans"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Portal Password</label>
                                <input
                                    type="text"
                                    name="password"
                                    value={registration.parent.password}
                                    onChange={updateParent}
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/10 rounded-none text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all font-sans"
                                    required
                                />
                                <p className="text-[9px] text-slate-500 mt-2 italic font-sans">A welcome email will be sent with these credentials.</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-primary/10 mt-6">
                        {step === 2 && (
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-none font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                            >
                                Back
                            </button>
                        )}
                        <div className="flex-1"></div>
                        {step === 1 ? (
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="px-10 py-4 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary-dark transition-all active:scale-95"
                            >
                                Next: Parent Details
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="px-10 py-4 bg-emerald-600 text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 dark:shadow-none hover:bg-emerald-700 transition-all active:scale-95"
                            >
                                Complete Registration
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;
