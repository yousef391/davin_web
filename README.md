# Business Analytics Dashboard

A modern, responsive admin dashboard built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- ✨ **Clean Architecture** - Organized folder structure with separation of concerns
- 🎨 **Light/Dark Theme** - Toggle between themes with smooth transitions
- 📊 **Interactive Charts** - Sales dynamics and user activity visualizations
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎯 **Simple State Management** - Using Zustand for global state
- 🧩 **Reusable Components** - Modular UI components

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── layout/            # Layout components
│   │   ├── AppProvider.tsx      # Theme provider
│   │   ├── DashboardLayout.tsx  # Main layout wrapper
│   │   ├── Header.tsx           # Top navigation bar
│   │   └── Sidebar.tsx          # Side navigation
│   ├── pages/             # Page components
│   │   └── AnalyticsPage.tsx    # Main analytics dashboard
│   └── ui/                # Reusable UI components
│       ├── StatCard.tsx          # Statistics card
│       ├── MetricCard.tsx        # Metric display card
│       ├── DonutChart.tsx        # Pie/donut chart
│       ├── SalesDynamicsChart.tsx    # Bar chart
│       ├── UserActivityChart.tsx     # Line chart
│       └── CustomerOrderTable.tsx    # Data table
└── store/                 # State management
    ├── themeStore.ts      # Theme state (light/dark)
    └── dashboardStore.ts  # Dashboard data state
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React

## 🏃‍♂️ Getting Started

1. **Install dependencies**:
   \`\`\`bash
   cd admin-dashboard-web
   npm install
   \`\`\`

2. **Run development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Key Components

### Layout Components
- **Sidebar**: Navigation menu with icons
- **Header**: Top bar with theme toggle and user info
- **DashboardLayout**: Main layout wrapper

### UI Components
- **StatCard**: Display key metrics with trends
- **MetricCard**: Financial metrics with icons
- **DonutChart**: Circular percentage charts
- **SalesDynamicsChart**: Monthly sales bar chart
- **UserActivityChart**: User activity line chart
- **CustomerOrderTable**: Customer orders data table

### State Management
- **themeStore**: Manages light/dark theme state
- **dashboardStore**: Stores dashboard data and selected year

## 📝 How to Use

### Adding a New Page
1. Create component in `src/components/pages/`
2. Import in `src/app/page.tsx` or create new route

### Customizing Theme
Edit colors in `tailwind.config.ts`:
\`\`\`typescript
colors: {
  primary: {
    DEFAULT: '#6366f1',  // Change primary color
    dark: '#4f46e5',
  },
}
\`\`\`

### Adding New Data
Update `src/store/dashboardStore.ts`:
\`\`\`typescript
data: {
  orders: 201,
  // Add your data here
}
\`\`\`

## 🎯 SOLID Principles Applied

- **Single Responsibility**: Each component has one purpose
- **Open/Closed**: Components are extendable via props
- **Liskov Substitution**: Components are interchangeable
- **Interface Segregation**: Props are minimal and specific
- **Dependency Inversion**: Components depend on abstractions (props)

## 🔄 Next Steps

To connect to your backend:

1. Create API service in `src/services/api.ts`
2. Add data fetching in components or use Server Components
3. Update stores to fetch real data
4. Add error handling and loading states

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [Recharts](https://recharts.org/)

## 🤝 Tips for Beginners

- Start by understanding the component structure
- Modify colors and text to match your needs
- Components are in `src/components/ui/` - easy to customize
- State is simple with Zustand - check `src/store/`
- Tailwind classes control styling - hover to see CSS

Happy coding! 🚀
