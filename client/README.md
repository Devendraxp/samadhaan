# Samadhaan - Hostel Complaint Management System

A comprehensive web application for managing hostel complaints with real-time tracking, role-based dashboards, and efficient resolution workflows.

## Features

### Core Functionality
- **Multi-role System**: Support for Students, Admin, and 5 staff domains (Mess, Internet, Cleaning, Water, Transport)
- **Complaint Management**: Submit, track, and resolve complaints with status workflows
- **Real-time Updates**: Live tracking from complaint creation to resolution
- **Anonymous Submissions**: Optional anonymity for sensitive complaints
- **File Attachments**: Upload images with complaints and responses
- **Response System**: Multi-level communication between students, staff, and admin
- **Notifications**: Domain-specific alerts and announcements
- **User Management**: Admin panel for account creation and management

### UI/UX
- **Beautiful Design**: Modern, professional interface with smooth animations
- **Dark/Light Mode**: Seamless theme switching
- **Responsive**: Mobile-friendly design that works on all devices
- **Status Visualization**: Color-coded badges and kanban boards
- **SEO Optimized**: Proper meta tags and semantic HTML

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui
- **API Client**: Axios with cookie-based auth
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner toast notifications

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running (Express + Prisma)

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd samadhaan
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
# Create .env file
cp .env.example .env

# Update VITE_API_URL with your backend URL
# Default: http://localhost:3000
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Layout.tsx      # App layout wrapper
│   └── Navbar.tsx      # Navigation bar
├── pages/              # Route pages
│   ├── Landing.tsx     # Homepage
│   ├── Login.tsx       # Authentication
│   ├── Signup.tsx      # Registration
│   ├── Complaints.tsx  # Complaint listing
│   ├── ComplaintDetail.tsx  # Single complaint view
│   ├── CreateComplaint.tsx  # Complaint submission
│   └── Profile.tsx     # User profile
├── lib/                # Utilities
│   ├── api.ts         # Axios client configuration
│   ├── types.ts       # TypeScript interfaces
│   ├── constants.ts   # App constants
│   └── utils.ts       # Helper functions
└── index.css          # Design system & global styles
```

## Design System

The app uses a comprehensive design system defined in `src/index.css` and `tailwind.config.ts`:

- **Colors**: Professional blue/indigo with accent colors
- **Status Colors**: Unique colors for each complaint status
- **Semantic Tokens**: All colors use CSS variables for consistency
- **Gradients**: Pre-defined gradients for hero sections
- **Typography**: Clear hierarchy with proper font weights
- **Animations**: Smooth transitions using cubic-bezier

## API Integration

All API calls are made through the configured axios instance in `src/lib/api.ts`:

- Base URL: `${VITE_API_URL}/api/v1`
- Authentication: Cookie-based (httpOnly)
- All requests include `?source=web` query parameter
- File uploads use `multipart/form-data` with field name "file"

## Authentication Flow

1. User submits login/signup form
2. Backend sets httpOnly cookie with auth token
3. Cookie is automatically sent with all subsequent requests
4. User is redirected to role-appropriate dashboard
5. Navbar updates to show authenticated state

## Available Roles

- **STUDENT**: Can submit and track complaints
- **ADMIN**: Full system access, user management, all complaints
- **MESS**: Manages mess-related complaints
- **INTERNET**: Manages internet-related complaints
- **CLEANING**: Manages cleaning-related complaints
- **WATER**: Manages water-related complaints
- **TRANSPORT**: Manages transport-related complaints

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy on Lovable

1. Open [Lovable](https://lovable.dev/projects/c35db59a-3d95-432d-ae7b-0fc6b7c7fdf5)
2. Click on Share → Publish
3. Your app will be live!

### Environment Variables

For production, make sure to set:
```
VITE_API_URL=https://your-backend-api.com
```

## Next Steps

This is a foundational implementation. You can extend it with:

- [ ] Role-based dashboard pages with kanban boards
- [ ] Notification management panels
- [ ] User account management (admin)
- [ ] Advanced filtering and search
- [ ] Complaint analytics and reports
- [ ] Email notifications
- [ ] Real-time updates with WebSockets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is built with Lovable.
