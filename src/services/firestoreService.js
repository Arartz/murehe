import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    writeBatch,
    arrayUnion
} from "firebase/firestore";
import { db } from "./firebase";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_i8pb9g9";
const EMAILJS_PUBLIC_KEY = "3nSl17xdAq3hZTc4C";

/**
 * Sends an email notification using EmailJS.
 * @param {string} templateId - The EmailJS template ID.
 * @param {object} templateParams - The parameters for the email template.
 */
export const sendEmailNotification = async (templateId, templateParams) => {
    try {
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            templateId,
            templateParams,
            EMAILJS_PUBLIC_KEY
        );
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

/**
 * Gets the user's role from the 'users' collection.
 * @param {string} uid - User ID
 * @returns {Promise<string|null>} - The user's role or null if not found.
 */
export const getUserRole = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return userDoc.data().role;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user role:", error);
        return null;
    }
};

/**
 * Saves user details including role to Firestore.
 * @param {string} uid - User ID
 * @param {object} userData - User data containing email and role
 */
export const setUserData = async (uid, userData) => {
    try {
        await setDoc(doc(db, "users", uid), userData, { merge: true });
    } catch (error) {
        console.error("Error setting user data:", error);
        throw error;
    }
};

/**
 * Fetches a user document by email from the 'users' collection.
 * @param {string} email - User email
 * @returns {Promise<object|null>} - User data or null
 */
export const getUserByEmail = async (email) => {
    try {
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { uid: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching user by email:", error);
        return null;
    }
};


export const getClasses = async () => {
    try {
        const classesSnapshot = await getDocs(collection(db, "classes"));
        return classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching classes:", error);
        return [];
    }
};

/**
 * Checks if an application already exists for the given email.
 * @param {string} email - Parent email
 * @returns {Promise<object|null>} - Existing application data or null.
 */
export const checkExistingApplication = async (email) => {
    try {
        const q = query(
            collection(db, "applications"),
            where("parentEmail", "==", email),
            where("status", "in", ["pending", "approved"])
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        }
        return null;
    } catch (error) {
        console.error("Error checking existing application:", error);
        throw error;
    }
};

/**
 * Fetches student data associated with a parent's UID.
 * @param {string} parentUid - The UID of the parent.
 * @returns {Promise<object|null>} - Student data or null.
 */
export const getStudentDataForParent = async (parentUid) => {
    try {
        const q = query(
            collection(db, "students"),
            where("parentUid", "==", parentUid)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching student data:", error);
        throw error;
    }
};

/**
 * Submits a new admission application.
 * @param {object} applicationData - The application details.
 */
export const submitApplication = async (applicationData) => {
    try {
        const docRef = await addDoc(collection(db, "applications"), {
            ...applicationData,
            status: "pending",
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error submitting application:", error);
        throw error;
    }
};

/**
 * Fetches all students belonging to a specific class.
 * @param {string} classId - The ID or name of the class.
 * @returns {Promise<Array>} - List of students.
 */
export const getStudentsByClass = async (classId) => {
    try {
        const q = query(
            collection(db, "students"),
            where("class", "==", classId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching students by class:", error);
        return [];
    }
};

/**
 * Saves marks for multiple students in a single transaction or batch.
 * @param {Array} marksData - Array of mark objects.
 */
export const saveStudentMarks = async (marksData) => {
    try {
        const batch = writeBatch(db);
        marksData.forEach(mark => {
            const markRef = doc(collection(db, "marks"));
            batch.set(markRef, {
                ...mark,
                createdAt: serverTimestamp()
            });
        });
        await batch.commit();
    } catch (error) {
        console.error("Error saving student marks:", error);
        throw error;
    }
};

/**
 * Saves comments for multiple students in a single batch.
 * @param {Array} commentsData - Array of comment objects.
 */
export const saveStudentComments = async (commentsData) => {
    try {
        const batch = writeBatch(db);
        commentsData.forEach(comm => {
            const commRef = doc(collection(db, "comments"));
            batch.set(commRef, {
                ...comm,
                createdAt: serverTimestamp()
            });
        });
        await batch.commit();
    } catch (error) {
        console.error("Error saving student comments:", error);
        throw error;
    }
};

/**
 * Fetches comments for a specific student.
 */
export const getStudentComments = async (studentId) => {
    try {
        const q = query(
            collection(db, "comments"),
            where("studentId", "==", studentId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching student comments:", error);
        throw error;
    }
};
/**
 * Fetches assignments (classes and subjects) for a teacher.
 * @param {string} teacherUid - The UID of the teacher.
 * @returns {Promise<Array>} - List of assignments.
 */
export const getTeacherAssignments = async (teacherUid) => {
    try {
        const q = query(
            collection(db, "teacherAssignments"),
            where("teacherUid", "==", teacherUid)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching teacher assignments:", error);
        return [];
    }
};

/**
 * Fetches teachers assigned to a specific class.
 * @param {string} classId - The ID or name of the class.
 * @returns {Promise<Array>} - List of teacher objects.
 */
export const getTeachersByClass = async (classId) => {
    try {
        const q = query(
            collection(db, "teacherAssignments"),
            where("className", "==", classId)
        );
        const querySnapshot = await getDocs(q);
        const teacherUids = [...new Set(querySnapshot.docs.map(doc => doc.data().teacherUid))];

        if (teacherUids.length === 0) return [];

        const teacherPromises = teacherUids.map(uid => getDoc(doc(db, "users", uid)));
        const teacherDocs = await Promise.all(teacherPromises);

        return teacherDocs
            .filter(d => d.exists())
            .map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error("Error fetching teachers by class:", error);
        return [];
    }
};
/**
 * Saves attendance for multiple students in a single batch.
 * @param {Array} attendanceData - Array of attendance objects.
 */
export const saveAttendance = async (attendanceData) => {
    try {
        const batch = writeBatch(db);
        attendanceData.forEach(att => {
            const attRef = doc(collection(db, "attendance"));
            batch.set(attRef, {
                ...att,
                createdAt: serverTimestamp()
            });
        });
        await batch.commit();
    } catch (error) {
        console.error("Error saving attendance:", error);
        throw error;
    }
};

/**
 * Fetch all documents from a collection.
 */
export const getAllDocuments = async (collectionName) => {
    try {
        const snapshot = await getDocs(collection(db, collectionName));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
        return [];
    }
};

/**
 * Add or Update a document in a collection.
 */
export const saveDocument = async (collectionName, data, id = null) => {
    try {
        if (id) {
            await setDoc(doc(db, collectionName, id), data, { merge: true });
            return id;
        } else {
            const docRef = await addDoc(collection(db, collectionName), {
                ...data,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        }
    } catch (error) {
        console.error(`Error saving to ${collectionName}:`, error);
        throw error;
    }
};

/**
 * Update a specific document.
 */
export const updateDocument = async (collectionName, id, data) => {
    try {
        await updateDoc(doc(db, collectionName, id), data);
        return id;
    } catch (error) {
        console.error(`Error updating document in ${collectionName}:`, error);
        throw error;
    }
};

/**
 * Delete a document from a collection.
 */
export const deleteDocument = async (collectionName, id) => {
    try {
        await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
        console.error(`Error deleting from ${collectionName}:`, error);
        throw error;
    }
};

/**
 * Deletes all documents within a given collection.
 * @param {string} collectionName - Name of the collection to clear.
 */
export const clearCollection = async (collectionName) => {
    try {
        const q = query(collection(db, collectionName));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);

        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        return querySnapshot.size;
    } catch (error) {
        console.error(`Error clearing collection ${collectionName}:`, error);
        throw error;
    }
};

/**
 * Update admission application status.
 */
export const updateApplicationStatus = async (id, status, extraData = {}) => {
    try {
        await setDoc(doc(db, "applications", id), { status, ...extraData }, { merge: true });
    } catch (error) {
        console.error("Error updating application status:", error);
        throw error;
    }
};

/**
 * Generates the next student ID in format JCS-YYYY-XXXX.
 */
export const getNextStudentId = async () => {
    const year = new Date().getFullYear();
    const counterDocRef = doc(db, "metadata", "studentCounter");

    try {
        const docSnap = await getDoc(counterDocRef);
        let count = 1;

        if (docSnap.exists() && docSnap.data().year === year) {
            count = docSnap.data().lastCount + 1;
        }

        // Update the counter
        await setDoc(counterDocRef, { lastCount: count, year: year }, { merge: true });

        return `JCS-${year}-${count.toString().padStart(4, '0')}`;
    } catch (error) {
        console.error("Error generating student ID:", error);
        throw error;
    }
};

/**
 * Registers a student and links them to a parent.
 */
export const createStudentRecord = async (studentData) => {
    try {
        const studentId = await getNextStudentId();
        const docRef = await addDoc(collection(db, "students"), {
            ...studentData,
            admissionNo: studentId,
            createdAt: serverTimestamp()
        });
        return { firestoreId: docRef.id, admissionNo: studentId };
    } catch (error) {
        console.error("Error creating student record:", error);
        throw error;
    }
};

/**
 * Promotes all students in a class to a new class.
 */
export const promoteStudents = async (sourceClass, targetClass) => {
    try {
        const q = query(
            collection(db, "students"),
            where("class", "==", sourceClass)
        );
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);

        querySnapshot.forEach((studentDoc) => {
            const studentRef = doc(db, "students", studentDoc.id);
            batch.update(studentRef, {
                class: targetClass,
                promotedFrom: sourceClass,
                updatedAt: serverTimestamp()
            });
        });

        await batch.commit();
        return querySnapshot.size;
    } catch (error) {
        console.error("Error promoting students:", error);
        throw error;
    }
};

/**
 * Fetches all marks for a specific class and term.
 */
export const getTermMarks = async (classId, term) => {
    try {
        const q = query(
            collection(db, "marks"),
            where("classId", "==", classId),
            where("term", "==", term)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching term marks:", error);
        return [];
    }
};

/**
 * Saves term results for multiple students.
 */
export const saveTermResults = async (resultsData) => {
    try {
        const batch = writeBatch(db);
        resultsData.forEach(res => {
            const resRef = doc(collection(db, "termResults"));
            batch.set(resRef, {
                ...res,
                createdAt: serverTimestamp()
            });
        });
        await batch.commit();
    } catch (error) {
        console.error("Error saving term results:", error);
        throw error;
    }
};
/**
 * Fetches term results for a specific student and term.
 */
export const getStudentTermResults = async (studentId, term) => {
    try {
        const q = query(
            collection(db, "termResults"),
            where("studentId", "==", studentId),
            where("term", "==", term)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching student term results:", error);
        throw error;
    }
};

/**
 * Fetches all marks for a student in a specific term.
 */
export const getStudentMarksByTerm = async (studentId, term) => {
    try {
        const q = query(
            collection(db, "marks"),
            where("studentId", "==", studentId),
            where("term", "==", term)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching student marks:", error);
        return [];
    }
};

/**
 * Fetches attendance records for a specific student in a term.
 */
export const getStudentAttendanceByTerm = async (studentId, term) => {
    try {
        const q = query(
            collection(db, "attendance"),
            where("studentId", "==", studentId),
            where("term", "==", term)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching student attendance:", error);
        throw error;
    }
};

/**
 * Fetches the currently active term.
 */
export const getActiveTerm = async () => {
    try {
        const q = query(collection(db, "terms"), where("status", "==", "active"));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching active term:", error);
        return null;
    }
};

/**
 * Marks a term as active and deactivates all others.
 */
export const setTermActive = async (termId) => {
    try {
        const batch = writeBatch(db);
        const allTerms = await getDocs(collection(db, "terms"));

        allTerms.forEach((termDoc) => {
            batch.update(doc(db, "terms", termDoc.id), {
                status: termDoc.id === termId ? "active" : "archived"
            });
        });

        await batch.commit();
    } catch (error) {
        console.error("Error setting term active:", error);
        throw error;
    }
};

/**
 * Locks or unlocks marks for a term.
 */
export const setTermLockStatus = async (termId, isLocked) => {
    try {
        await setDoc(doc(db, "terms", termId), { locked: isLocked }, { merge: true });
    } catch (error) {
        console.error("Error setting term lock status:", error);
        throw error;
    }
};

/**
 * MESSAGING SYSTEM FUNCTIONS
 */

/**
 * Creates a new conversation with duplicate prevention.
 */
export const createConversation = async (studentId, parentId, teacherId, classId, firstMessageText, senderId, senderRole, parentName, studentName, teacherName) => {
    try {
        // 1. Check for duplicate conversation between same parent + teacher + student
        const q = query(
            collection(db, "conversations"),
            where("studentId", "==", studentId),
            where("parentId", "==", parentId),
            where("teacherId", "==", teacherId)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Return existing conversation ID
            return { id: querySnapshot.docs[0].id, alreadyExisted: true };
        }

        // 2. Create new conversation with first message in a batch
        const batch = writeBatch(db);
        const convRef = doc(collection(db, "conversations"));
        const conversationId = convRef.id;

        batch.set(convRef, {
            studentId,
            parentId,
            teacherId,
            classId,
            parentName,
            studentName,
            teacherName, // Added
            lastMessage: firstMessageText,
            lastMessageAt: serverTimestamp(),
            lastMessageReadBy: [senderId],
            status: "open",
            createdAt: serverTimestamp()
        });

        const msgRef = doc(collection(db, "conversations", conversationId, "messages"));
        batch.set(msgRef, {
            senderId,
            senderRole,
            text: firstMessageText,
            createdAt: serverTimestamp(),
            readBy: [senderId]
        });

        await batch.commit();
        return { id: conversationId, alreadyExisted: false };
    } catch (error) {
        console.error("Error creating conversation:", error);
        throw error;
    }
};

/**
 * Sends a message in a conversation.
 */
export const sendMessage = async (conversationId, senderId, senderRole, text) => {
    try {
        const batch = writeBatch(db);

        // 1. Add message to subcollection
        const msgRef = doc(collection(db, "conversations", conversationId, "messages"));
        batch.set(msgRef, {
            senderId,
            senderRole,
            text,
            createdAt: serverTimestamp(),
            readBy: [senderId] // Creator has read it
        });

        // 2. Update conversation metadata
        const convRef = doc(db, "conversations", conversationId);
        batch.update(convRef, {
            lastMessage: text,
            lastMessageAt: serverTimestamp(),
            lastMessageReadBy: [senderId]
        });

        await batch.commit();
        return msgRef.id;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

/**
 * Fetches all conversations for a user based on their role.
 */
export const getUserConversations = async (userId, role) => {
    try {
        const fieldName = role === "teacher" ? "teacherId" : "parentId";
        const q = query(
            collection(db, "conversations"),
            where(fieldName, "==", userId),
            orderBy("lastMessageAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
    }
};

/**
 * Fetches all messages in a conversation.
 */
export const getConversationMessages = async (conversationId) => {
    try {
        const q = query(
            collection(db, "conversations", conversationId, "messages"),
            orderBy("createdAt", "asc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
};

/**
 * Marks specific messages as read by a user.
 */
/**
 * Marks a conversation and its messages as read for a specific user.
 */
export const markConversationAsRead = async (conversationId, userId) => {
    try {
        const batch = writeBatch(db);

        // 1. Update conversation metadata
        const convRef = doc(db, "conversations", conversationId);
        batch.update(convRef, {
            lastMessageReadBy: arrayUnion(userId)
        });

        // 2. We fetch the unread messages first (internal logic)
        // Note: For large chats, we might limit this.
        // 2. We fetch the unread messages first (internal logic)
        // Note: For large chats, we might limit this.
        // Wait, "array-contains-not" is not a standard Firestore operator. 
        // We have to filter client-side or check for specific missing values if possible.
        // Actually, we'll fetch all messages and filter, or just update the ones we know.
        // For simplicity and correctness in a small chat app, we'll fetch all and update.
        const messagesSnapshot = await getDocs(collection(db, "conversations", conversationId, "messages"));
        messagesSnapshot.forEach(msgDoc => {
            const data = msgDoc.data();
            if (!data.readBy || !data.readBy.includes(userId)) {
                batch.update(msgDoc.ref, {
                    readBy: arrayUnion(userId)
                });
            }
        });

        await batch.commit();
    } catch (error) {
        console.error("Error marking conversation as read:", error);
    }
};

/**
 * Updates the status of a conversation (e.g., "open", "closed").
 */
export const updateConversationStatus = async (conversationId, status) => {
    try {
        await setDoc(doc(db, "conversations", conversationId), { status }, { merge: true });
    } catch (error) {
        console.error("Error updating conversation status:", error);
        throw error;
    }
};
