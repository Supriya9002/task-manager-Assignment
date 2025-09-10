# TaskFlow - Complete MERN Stack Task Management Application

A comprehensive task management application built with the MERN stack (MongoDB, Express.js, React, Node.js), featuring drag-and-drop functionality, real-time collaboration, JWT authentication, and a modern responsive design.

## 🚀 Features

### Core Functionality
- **User Authentication**: Complete sign-up, sign-in, and session management
- **Dashboard**: Clean interface for managing multiple project boards
- **Board Management**: Create, edit, and delete project boards
- **List Management**: Organize tasks into customizable columns/lists
- **Card Management**: Create detailed task cards with descriptions, due dates, and labels
- **Drag & Drop**: Intuitive drag-and-drop interface for moving cards between lists
- **Search & Filter**: Advanced search and filtering capabilities across all boards and cards

### Advanced Features
- **Collaboration**: Multi-user board sharing with role-based permissions
- **Real-time Updates**: Live synchronization of changes across users
- **Activity Tracking**: Comprehensive audit log of all board activities
- **Comments System**: Card-level discussions and collaboration
- **Due Date Management**: Visual indicators for overdue and upcoming tasks
- **Labels & Tags**: Organize cards with customizable labels
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Design Highlights
- **Modern UI**: Clean, professional interface inspired by leading productivity tools
- **Smooth Animations**: Polished micro-interactions and transitions
- **Accessibility**: Built with accessibility best practices
- **Progressive Enhancement**: Works seamlessly across all device types

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS** for utility-first styling and responsive design
- **Lucide React** for consistent iconography
- **HTML5 Drag and Drop API** for intuitive interactions

### Backend & Database
- **Node.js** with Express.js for RESTful API
- **MongoDB** with Mongoose for data modeling
- **JWT** for secure authentication
- **Socket.IO** for real-time updates
- **Multer** for file upload handling
- **bcryptjs** for password hashing

### Development Tools
- **Vite** for fast development and building
- **ESLint** for code quality
- **TypeScript** for type safety
- **Nodemon** for development server auto-restart

## 📋 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local installation or MongoDB Atlas)

### Demo Credentials
For quick testing, use these demo credentials:
- **Email**: demo@taskflow.com
- **Password**: demo123456

### Setup Instructions

1. **Clone and Install**
   ```bash
   cd taskflow
   npm install
   cd backend
   npm install
   cd ..
   ```

2. **Database Setup**
   - Install MongoDB locally or create a MongoDB Atlas account
   - Create a new database named `taskflow`
   - Copy `backend/.env.example` to `backend/.env`
   - Update the MongoDB connection string in `backend/.env`

3. **Environment Configuration**
   ```bash
   # Frontend (.env)
   cp .env.example .env
   
   # Backend (backend/.env)
   cp backend/.env.example backend/.env
   ```
   
   Update the environment variables with your configuration.

4. **Start Development Servers**
   
   **Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend Server:**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open your browser to `http://localhost:5173`
   - Backend API runs on `http://localhost:5000`
   - Sign up for a new account or use the demo credentials

## 🗄 Database Schema (MongoDB)

The application uses a comprehensive MongoDB schema with Mongoose:

### Core Tables
- **users**: User accounts with authentication
- **boards**: Project boards with metadata and member management
- **lists**: Task columns within boards with positioning
- **cards**: Individual tasks with rich metadata, comments, and attachments
- **activities**: Complete audit log of all actions

### Security Features
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Input validation and sanitization
- Rate limiting and security headers

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Boards
- `GET /api/boards` - Get user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get board details
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `POST /api/boards/:id/members` - Add board member
- `DELETE /api/boards/:id/members/:userId` - Remove member

### Lists
- `GET /api/boards/:boardId/lists` - Get board lists
- `POST /api/boards/:boardId/lists` - Create new list
- `PUT /api/boards/:boardId/lists/:listId` - Update list
- `DELETE /api/boards/:boardId/lists/:listId` - Delete list

### Cards
- `GET /api/boards/:boardId/cards` - Get board cards
- `POST /api/boards/:boardId/cards` - Create new card
- `GET /api/boards/:boardId/cards/:cardId` - Get card details
- `PUT /api/boards/:boardId/cards/:cardId` - Update card
- `DELETE /api/boards/:boardId/cards/:cardId` - Delete card
- `POST /api/boards/:boardId/cards/:cardId/move` - Move card
- `POST /api/boards/:boardId/cards/:cardId/comments` - Add comment

## 🚀 Deployment

### Frontend Deployment
Build the frontend for production:

```bash
npm run build
```

Deploy the `dist` folder to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting provider

### Backend Deployment
The backend can be deployed to:
- Heroku
- Railway
- DigitalOcean App Platform
- AWS EC2
- Any Node.js hosting provider

Make sure to:
1. Set all environment variables
2. Use a production MongoDB database (MongoDB Atlas recommended)
3. Configure CORS for your frontend domain
4. Set up file storage for attachments

## 📱 Responsive Design

TaskFlow is designed to work seamlessly across all devices:

- **Desktop (1024px+)**: Full feature set with multi-column layouts
- **Tablet (768-1024px)**: Optimized interface with touch-friendly controls
- **Mobile (<768px)**: Single-column layout with swipe gestures

## 🎯 Key Features Demonstrated

### Project Management
- Multi-project organization
- Kanban-style workflow
- Task prioritization and categorization

### Collaboration
- Real-time multi-user editing
- Role-based permissions (Admin, Editor, Viewer)
- Activity tracking and notifications

### User Experience
- Intuitive drag-and-drop interface
- Smooth animations and micro-interactions
- Contextual menus and shortcuts

### Technical Excellence
- Type-safe development with TypeScript
- Scalable component architecture
- Optimized performance and loading states
- Comprehensive error handling

## 🔧 Development

### Code Structure
```
backend/
├── controllers/        # Route controllers
├── models/            # Mongoose models
├── routes/            # Express routes
├── middleware/        # Custom middleware
└── server.js          # Main server file

src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard and board management
│   └── board/          # Board view and task management
├── hooks/              # Custom React hooks
├── lib/                # API client and utilities
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component
```

### Key Patterns
- **RESTful API**: Clean, consistent API design
- **JWT Authentication**: Secure token-based auth
- **Mongoose ODM**: Elegant MongoDB object modeling
- **Custom Hooks**: Reusable logic for auth, data fetching
- **Type Safety**: Comprehensive TypeScript coverage
- **Component Composition**: Modular, reusable components
- **Error Handling**: Comprehensive error handling and validation

## 📈 Performance Optimizations

### Frontend
- Optimized bundle size with tree shaking
- Lazy loading for improved initial load times
- Efficient re-rendering with React best practices

### Backend
- Database query optimization with MongoDB indexes
- Request rate limiting
- Efficient data pagination
- File upload optimization

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Input validation and sanitization
- Rate limiting protection
- CORS configuration
- Security headers with Helmet
- HTTPS enforcement in production

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) for main actions
- **Secondary**: Teal (#14B8A6) for secondary actions
- **Success**: Green (#10B981) for positive states
- **Warning**: Amber (#F59E0B) for warnings
- **Error**: Red (#EF4444) for errors

### Typography
- Consistent font hierarchy
- Optimal line spacing (150% body, 120% headings)
- Limited font weights for clarity

### Spacing
- 8px grid system for consistent spacing
- Responsive padding and margins
- Proper visual hierarchy

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
npm test
```

## 🔄 Real-time Features

The application includes real-time updates using Socket.IO:
- Live board updates when members make changes
- Real-time card movements and updates
- Instant notifications for comments and activities
- Multi-user collaboration indicators

## 📊 Demo Data

New users automatically get demo data including:
- 3 sample boards (Project Alpha, Marketing Campaign, Launch Prep)
- Pre-populated lists and cards
- Sample labels, due dates, and descriptions
- Realistic project management scenarios

## 📄 License

This project is built as a demonstration of modern web development practices and full-stack application architecture.

---

Built with ❤️ using the MERN Stack (MongoDB, Express.js, React, Node.js)#   t a s k - m a n a g e r - A s s i g n m e n t  
 