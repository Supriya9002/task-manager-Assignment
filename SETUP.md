# TaskFlow - MERN Stack Task Management Application

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads
```

4. Start the backend server:
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root with:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Features Implemented

### ✅ Completed Features

1. **User Authentication**
   - JWT-based authentication
   - User registration and login
   - Protected routes

2. **Backend API**
   - RESTful API with Express.js
   - MongoDB integration with Mongoose
   - User, Board, List, Card, and Activity models
   - Comprehensive CRUD operations
   - Real-time updates with Socket.IO

3. **Frontend Features**
   - React with TypeScript
   - Redux Toolkit for state management
   - Drag-and-drop functionality with @dnd-kit
   - Responsive design with Tailwind CSS
   - Modern UI components

4. **Core Functionality**
   - Create, read, update, delete boards
   - Create, read, update, delete lists
   - Create, read, update, delete cards
   - Drag-and-drop for lists and cards
   - Real-time collaboration
   - Activity logging

### 🔄 In Progress Features

1. **Search and Filter**
   - Board search functionality
   - Card filtering by labels, due dates, etc.

2. **Collaboration Features**
   - User invitation to boards
   - Role-based permissions (Admin, Editor, Viewer)
   - Real-time updates

### 🎯 Key Features

- **Drag-and-Drop**: Lists and cards can be reordered using drag-and-drop
- **Real-time Updates**: Changes are synchronized across all connected clients
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Activity Logging**: Track all changes and activities on boards
- **File Attachments**: Upload and manage file attachments on cards
- **Comments**: Add comments to cards for collaboration
- **Labels**: Organize cards with colored labels
- **Due Dates**: Set and track due dates for cards
- **User Assignment**: Assign cards to team members

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Boards
- `GET /api/boards` - Get all boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get board by ID
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Lists
- `GET /api/boards/:boardId/lists` - Get all lists for a board
- `POST /api/boards/:boardId/lists` - Create new list
- `PUT /api/boards/:boardId/lists/:listId` - Update list
- `DELETE /api/boards/:boardId/lists/:listId` - Delete list
- `POST /api/boards/:boardId/lists/reorder` - Reorder lists

### Cards
- `GET /api/boards/:boardId/cards` - Get all cards for a board
- `POST /api/boards/:boardId/cards` - Create new card
- `PUT /api/boards/:boardId/cards/:cardId` - Update card
- `DELETE /api/boards/:boardId/cards/:cardId` - Delete card
- `POST /api/boards/:boardId/cards/:cardId/move` - Move card between lists
- `POST /api/boards/:boardId/cards/reorder` - Reorder cards

## Demo Credentials

For testing purposes, you can use:
- Email: `demo@taskflow.com`
- Password: `demo123456`

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT
- bcryptjs
- multer (file uploads)

### Frontend
- React 18
- TypeScript
- Redux Toolkit
- @dnd-kit (drag-and-drop)
- Tailwind CSS
- Lucide React (icons)
- Axios (HTTP client)

## Project Structure

```
project/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   └── server.js       # Main server file
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utility libraries
│   ├── store/          # Redux store and slices
│   └── types/          # TypeScript type definitions
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
