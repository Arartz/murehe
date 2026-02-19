# Jasiri Christian School Management System (JSMS)

JSMS is a comprehensive, modern web application designed to streamline school operations, manage student admissions, and facilitate communication between teachers and parents. Built with a focus on faith-based excellence, it provides a premium digital experience for the Jasiri Christian School community.

## 🚀 Key Features

### 🏛️ Landing Pages
- **Modern Design**: Responsive, high-performance landing pages for Home, About, Academics, Admissions, and Contact.
- **Theme Switching**: Seamless light and dark mode support with persistent user preferences.
- **Announcements**: Dynamic school news and updates system.

### 📝 Admission System
- **Public Application**: Multi-step student application form with real-time validation.
- **Admin Management**: Dedicated dashboard for reviewing, approving, or rejecting applications.
- **Direct Registration**: Ability for administrators to manually register students and parents.
- **Automated Notifications**: Email alerts for application status updates and login credentials.

### 🏢 Management Portals
- **Admin Dashboard**: Central hub for managing classes, subjects, teachers, students, and school-wide settings.
- **Teacher Portal**: Interface for teachers to manage assignments, record marks, and communicate with parents.
- **Parent Portal**: Secure area for parents to track their child's progress, view reports, and chat with teachers.

### 💬 Communication Tools
- **Real-time Chat**: Secure messaging between teachers and parents.
- **Broadcasts**: Admin-to-school announcements.

## 🛠️ Technical Stack

- **Frontend**: React.js with Vite
- **Styling**: Tailwind CSS (v4)
- **Backend/Database**: Firebase (Firestore)
- **Authentication**: Firebase Auth
- **Emails**: EmailJS
- **Icons**: Material Symbols Outlined

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables for Firebase and EmailJS in your environment or a `.env` file (ensure you have the correct config for `services/firebase.js` and `services/firestoreService.js`).

### Development
Run the development server:
```bash
npm run dev
```

### Build
Build the production-ready application:
```bash
npm run build
```

## 🌐 SEO & Deployment
- **Domain**: [jasirischool.rw](https://jasirischool.rw)
- **Google Search Console**: Configured with `sitemap.xml` and `robots.txt` for optimal indexing.

---
© 2026 Jasiri Christian School. All rights reserved.
