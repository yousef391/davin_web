# Next.js Admin Dashboard - Understanding Guide

## 📁 Project Structure (Simplified & Clean)

```
admin-dashboard-web/
├── src/
│   ├── app/                    # Next.js 14 App Router (NEW way)
│   │   ├── layout.tsx         # Root layout (wraps all pages)
│   │   ├── page.tsx           # Home page (Dashboard)
│   │   ├── users/
│   │   │   └── page.tsx       # Users page
│   │   ├── subscriptions/
│   │   │   └── page.tsx       # Subscriptions page
│   │   └── content/
│   │       └── page.tsx       # Content page
│   │
│   ├── components/            # Reusable UI components
│   │   ├── layout/           # Layout components
│   │   │   ├── AppProvider.tsx    # Wraps app with sidebar
│   │   │   ├── Sidebar.tsx        # Navigation menu
│   │   │   └── ThemeToggle.tsx    # Dark/Light mode
│   │   │
│   │   └── pages/            # Page-specific components
│   │       ├── AnalyticsPage.tsx     # Dashboard stats
│   │       ├── UsersPage.tsx         # Users table
│   │       ├── SubscriptionsPage.tsx # Subscriptions table
│   │       └── ContentPage.tsx       # Content grid
│   │
│   └── lib/                   # Utilities & API
│       ├── api/              # Backend API calls
│       │   ├── client.ts     # Axios HTTP client
│       │   ├── auth.ts       # Login/logout functions
│       │   ├── dashboard.ts  # Dashboard API
│       │   └── content.ts    # Content API
│       │
│       └── types/            # TypeScript types
│           └── auth.ts       # API response types
│
├── .env.local                # Environment variables
├── package.json              # Dependencies
├── tailwind.config.ts        # Tailwind CSS config
└── tsconfig.json            # TypeScript config
```

---

## 🎯 Next.js Key Concepts (Beginner-Friendly)

### 1. **App Router** (Next.js 14 New Way)
- **Folder = Route**: Each folder in `src/app/` becomes a URL route
- **page.tsx = The Page**: The `page.tsx` file is what users see at that route

**Examples:**
```
src/app/page.tsx              → http://localhost:3000/
src/app/users/page.tsx        → http://localhost:3000/users
src/app/subscriptions/page.tsx → http://localhost:3000/subscriptions
```

### 2. **layout.tsx** (Wrapper for Pages)
- **Wraps all pages**: Like a template that stays the same
- **Contains**: Sidebar, navigation, theme provider
- **Only loads once**: When you navigate, only the `page.tsx` content changes

**Our layout.tsx:**
```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>  {/* ← Sidebar wrapper */}
          {children}   {/* ← This changes per page */}
        </AppProvider>
      </body>
    </html>
  )
}
```

### 3. **Client vs Server Components**

**Server Components** (Default in Next.js 14):
- Run on the server
- Can access databases directly
- NO `useState`, `useEffect`, or browser APIs
- Faster, smaller bundle

**Client Components** (Need `'use client'`):
- Run in the browser
- Can use `useState`, `useEffect`, onClick handlers
- Interactive UI (buttons, forms, etc.)

**Our pages use Client Components:**
```tsx
'use client'  // ← This line makes it a client component

import { useState, useEffect } from 'react'

export function UsersPage() {
  const [users, setUsers] = useState([])  // ← Needs 'use client'
  // ...
}
```

---

## 🔗 How Data Flows in Our Dashboard

```
1. Browser loads page
   ↓
2. Component calls API function
   src/components/pages/UsersPage.tsx
   └── useEffect(() => { fetchUsers() })
   
3. API function makes HTTP request
   src/lib/api/dashboard.ts
   └── getAdminUsers() → axios.get('/api/admin/users')
   
4. Backend receives request
   Backend (Node.js) on http://localhost:5000
   └── routes/admin_routes.ts → GET /api/admin/users
   
5. Backend queries Supabase
   └── supabase.from('profiles').select('*')
   
6. Data returns to frontend
   Backend → Frontend → Component state
   
7. Component re-renders with data
   setUsers(data) → UI updates
```

---

## 📦 Dependencies Explained

### Essential (Keep These):
```json
{
  "next": "14.1.0",        // Next.js framework
  "react": "^18.2.0",      // React library
  "react-dom": "^18.2.0",  // React DOM rendering
  "axios": "^1.13.2",      // HTTP requests to backend
  "lucide-react": "^0.314.0",  // Icons (Search, Users, etc.)
  "recharts": "^2.10.3",   // Charts for analytics
  "tailwindcss": "^3.3.0"  // CSS styling
}
```

### ❌ Removed (Unnecessary):
- **zustand**: State management library (we use React hooks instead)

---

## 🎨 Styling with Tailwind CSS

Tailwind uses **utility classes** instead of writing CSS files:

```tsx
// ❌ Old way (CSS file):
<div className="card">...</div>
/* CSS: .card { background: white; padding: 1rem; border-radius: 0.5rem; } */

// ✅ Tailwind way (no CSS file needed):
<div className="bg-white p-4 rounded-lg">...</div>
```

**Common classes in our project:**
```tsx
bg-white              // Background white
dark:bg-gray-800      // Background gray in dark mode
p-6                   // Padding 1.5rem (24px)
rounded-lg            // Rounded corners
text-gray-900         // Text color gray-900
hover:bg-gray-100     // Background on hover
flex items-center     // Flexbox with vertical center
gap-4                 // Gap between items
```

---

## 🔐 Environment Variables (.env.local)

**What are they?**
- Configuration values that change between environments
- **Never committed to Git** (sensitive data like API keys)

**Our .env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**NEXT_PUBLIC_** prefix:
- Makes variable accessible in browser
- Without it, only available on server

**Usage:**
```tsx
const apiUrl = process.env.NEXT_PUBLIC_API_URL  // "http://localhost:5000"
```

---

## 🚀 How Pages Work

### Example: UsersPage

```tsx
'use client'  // 1. Mark as client component

import { useState, useEffect } from 'react'
import { getAdminUsers } from '@/lib/api/dashboard'

export function UsersPage() {
  // 2. State for storing data
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // 3. Fetch data when page loads
  useEffect(() => {
    async function fetchData() {
      const data = await getAdminUsers()
      setUsers(data.users)
      setLoading(false)
    }
    fetchData()
  }, [])  // Empty array = run once on mount

  // 4. Show loading spinner while fetching
  if (loading) return <div>Loading...</div>

  // 5. Render UI with data
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.email}</div>
      ))}
    </div>
  )
}
```

---

## 🛠️ API Client Structure

### client.ts (Axios Setup)
```tsx
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,  // http://localhost:5000
  headers: { 'Content-Type': 'application/json' }
})

// Add token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default apiClient
```

### dashboard.ts (API Functions)
```tsx
import apiClient from './client'

export async function getAdminUsers() {
  const response = await apiClient.get('/api/admin/users')
  return response.data
}
```

---

## 📝 TypeScript Types

**Why?**
- Auto-completion in VS Code
- Catch errors before runtime
- Documentation

**Example:**
```tsx
// Define the shape of data
interface AdminUser {
  id: string
  email: string
  profiles: number
  createdAt: string
}

// Use it in your code
const [users, setUsers] = useState<AdminUser[]>([])
//                                 ↑ TypeScript knows the type
```

---

## 🎯 Navigation

**In Next.js, use Link instead of <a>:**
```tsx
import Link from 'next/link'

<Link href="/users">Go to Users</Link>
```

**Why?**
- Faster (no full page reload)
- Prefetches page in background
- Client-side navigation

---

## 🌙 Dark Mode (useThemeStore)

Uses React Context + localStorage:

```tsx
// 1. Provider wraps app
<ThemeProvider>
  {children}
</ThemeProvider>

// 2. Toggle button
<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  Toggle Theme
</button>

// 3. CSS classes
<div className="bg-white dark:bg-gray-800">
  Light mode: white background
  Dark mode: gray-800 background
</div>
```

---

## 🔄 Data Fetching Best Practices

### ✅ Good (Our approach):
```tsx
useEffect(() => {
  async function fetchData() {
    setLoading(true)
    try {
      const data = await getAdminUsers()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])
```

### ❌ Bad (Common mistakes):
```tsx
// Don't fetch without loading state
const data = await getAdminUsers()  // No loading indicator

// Don't fetch without error handling
useEffect(() => {
  getAdminUsers().then(setUsers)  // No try/catch
}, [])
```

---

## 🎓 Next Steps to Learn

1. **Read Official Docs**: https://nextjs.org/docs
2. **Practice**: Modify our dashboard pages
3. **Add a new page**: Create `src/app/settings/page.tsx`
4. **Add a new API call**: Add function to `src/lib/api/dashboard.ts`

---

## 📌 Quick Reference

### Common Commands:
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Check code quality
```

### File Naming:
- `page.tsx` → Page route
- `layout.tsx` → Layout wrapper
- `loading.tsx` → Loading UI (optional)
- `error.tsx` → Error UI (optional)

### Import Alias:
```tsx
import { Button } from '@/components/ui/Button'
//                      ↑ @ = src/ folder
```

---

## ✅ What We Cleaned Up

1. ❌ Removed Zustand store (unused state management)
2. ❌ Removed mock data (using real API now)
3. ✅ Kept only essential dependencies
4. ✅ All pages use real backend data
5. ✅ Clean folder structure

**Your dashboard is now production-ready!** 🎉
