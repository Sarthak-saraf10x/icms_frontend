<div align="center">
  <h1>✨ ICMS Frontend (Insurance Claim Management System)</h1>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
  <p>The interactive and responsive user interface for the ICMS Platform.</p>
</div>

---

> [!NOTE]
> This is the React frontend application for ICMS. It features distinct role-based dashboards (Customers, Managers, Officers, Guides) and communicates with the Python Flask backend.

## 🚀 Quick Start

<details>
<summary><b>Click to expand Setup Instructions</b></summary>
<br/>

### 1. Prerequisites
- Node.js (v16+)
- npm or yarn

### 2. Installation
Navigate to the frontend directory and install the necessary dependencies:

```bash
cd icms_frontend
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

> [!TIP]
> The app will typically run on `http://localhost:5173`. Any changes to the code will hot-reload automatically!
</details>

## 🧩 Key Features

<details>
<summary><b>View Frontend Capabilities</b></summary>
<br/>

- **Role-Based Access Control (RBAC)**: Custom routing and guarded components based on user role.
- **Dynamic Dashboards**: Dedicated UI views for Customers, Policy Managers, Claim Officers, and Inspection Guides.
- **Form Handling & Validation**: Interactive forms for purchasing policies and filing claims.
- **File Uploads**: Drag-and-drop support for uploading damage evidence.
- **Responsive Layout**: Designed to look great on desktop, tablet, and mobile devices.
</details>

## 📂 Directory Structure

<details>
<summary><b>View Frontend Architecture</b></summary>
<br/>

```text
icms_frontend/
├── src/
│   ├── components/      # Reusable UI components (Buttons, Cards, Navbars)
│   ├── pages/           # Full page layouts (Dashboards, Login, etc.)
│   ├── routes/          # Application routing logic (AppRoutes.jsx)
│   ├── assets/          # Static files (images, icons)
│   ├── App.jsx          # Main React component
│   └── main.jsx         # React DOM entry point
├── public/              # Publicly served assets
├── tailwind.config.js   # Tailwind theme customization
└── vite.config.js       # Vite bundler configuration
```
</details>

## 📜 Available Scripts

> [!IMPORTANT]
> Use these scripts to manage the lifecycle of your frontend application.

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the app for production to the `dist` folder.
- `npm run lint` - Runs ESLint to find and fix code style issues.
- `npm run preview` - Previews the production build locally.
