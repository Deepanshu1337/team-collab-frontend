# TeamCollab Frontend

TeamCollab is a real-time team collaboration platform that enables teams to manage projects, tasks, and communicate effectively. The frontend provides an intuitive user interface built with React and TypeScript, featuring role-based access, real-time updates, and a responsive design.

## Features

- **Role-based Dashboard**: Different views for Admin, Manager, and Member roles
- **Project Management**: Create, view, and manage projects
- **Task Management**: Create, assign, and track tasks with drag-and-drop functionality
- **Real-time Chat**: Team communication with role-based visibility
- **Team Management**: Invite members, assign roles, and manage team structure
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Real-time Updates**: Live updates for tasks, messages, and team changes
- **Toast Notifications**: User-friendly feedback for all actions

## Tech Stack

- **React**: JavaScript library for building user interfaces
- **TypeScript**: Strong typing for better code quality
- **Redux Toolkit**: State management
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Socket.io-client**: Real-time bidirectional event-based communication
- **Axios**: HTTP client for API requests
- **Lucide React**: Icon library
- **React Hot Toast**: Toast notifications
- **Firebase**: Authentication and real-time features

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd frontend-collab
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-firebase-app-id
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start the development server with hot reloading
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run linting (if configured)

## Folder Structure

```
src/
├── components/         # Reusable UI components
│   ├── assistant/      # AI assistant components (if enabled)
│   ├── chat/           # Chat-related components
│   ├── dashboard/      # Dashboard components
│   ├── layout/         # Layout components
│   └── ui/             # UI components (buttons, cards, etc.)
├── firebase/           # Firebase configuration
├── lib/                # Utility libraries and functions
├── pages/              # Page components
│   ├── admin/          # Admin-specific pages
│   ├── common/         # Shared pages
│   ├── manager/        # Manager-specific pages
│   └── member/         # Member-specific pages
├── routes/             # Route components
├── store/              # Redux store configuration
├── App.tsx             # Main application component
├── index.css           # Global styles
└── main.tsx            # Application entry point
```

## Components Overview

### Core Components
- **AppLayout**: Main layout component with navigation
- **ChatPanel**: Real-time chat interface with team switching
- **UserCard**: Display user information and role
- **StatsCards**: Dashboard cards for different metrics

### Dashboard Components
- **AdminStatsCard**: Statistics for admin users
- **ManagerStatsCard**: Statistics for manager users
- **MemberStatsCard**: Statistics for member users

### UI Components
- **Button**: Custom button component
- **Card**: Container for content sections
- **Input**: Form input fields
- **Dialog**: Modal dialogs for user interactions
- **Tabs**: Tab navigation components

### Page Components

#### Authentication
- **LoginNew**: User login page
- **SignUp**: User registration page

#### Dashboard
- **Dashboard**: Main dashboard with role-based views

#### Team Management
- **TeamOverview**: Team details and member management
- **AdminTeamsView**: Admin view for managing all teams

#### Project Management
- **ProjectBoard**: Kanban-style project management
- **AdminProjectsView**: Admin view for managing all projects
- **ManagerProjects**: Manager view for their projects
- **MemberProjects**: Member view for assigned projects

#### Task Management
- **ManagerTasks**: Manager view for team tasks
- **MemberTasks**: Member view for assigned tasks

#### Communication
- **Chat**: Team chat interface

## State Management

The application uses Redux Toolkit for state management with the following slices:

- **auth.slice**: Authentication and user information
- **dashboard.slice**: Dashboard statistics
- **project.slice**: Project-related state
- **task.slice**: Task-related state
- **chat.slice**: Chat and messaging state

## API Integration

The frontend communicates with the backend API using Axios with the following key features:

- **Interceptors**: Automatically attach authentication tokens
- **Error Handling**: Centralized error handling
- **Loading States**: UI feedback during API calls
- **Toast Notifications**: User feedback for API responses

## Real-time Features

The application uses Socket.io for real-time updates:

- **Chat Messages**: Real-time message updates
- **Task Updates**: Live task status changes
- **Team Changes**: Real-time member and role updates

## Responsive Design

The application is built with Tailwind CSS to ensure responsiveness across devices:

- **Mobile-First**: Design starts with mobile and scales up
- **Adaptive Layouts**: Components adapt to different screen sizes
- **Touch-Friendly**: Interactive elements are optimized for touch

## Authentication Flow

1. **Sign Up/Login**: Users authenticate via Firebase
2. **Token Management**: Authentication tokens are stored and managed
3. **Role Assignment**: User roles are determined after authentication
4. **Team Context**: Team information is established for the user
5. **Route Protection**: Protected routes check authentication and roles

## Role-Based Access

The application implements role-based access control:

- **Admin**: Full access to all features, can manage teams and users
- **Manager**: Can manage projects and tasks within their team
- **Member**: Can view and update their assigned tasks

## Development Guidelines

### Component Structure
- Use functional components with TypeScript
- Implement proper typing for props and state
- Follow React best practices for performance
- Keep components focused and reusable

### Styling
- Use Tailwind CSS utility classes
- Follow the design system established in the project
- Maintain consistent spacing and typography
- Ensure proper responsive behavior

### State Management
- Use Redux Toolkit for global state
- Use React hooks for component-level state
- Implement proper error handling and loading states
- Follow Redux best practices

### API Integration
- Use Axios for HTTP requests
- Implement proper error handling
- Add loading indicators for user feedback
- Include toast notifications for user actions

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Deployment

### Build for Production
```bash
npm run build
```

The build artifacts will be placed in the `dist/` directory, ready for deployment to a static hosting service.

### Recommended Hosting
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **GitHub Pages**: `gh-pages`
- **Any static hosting service**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.