🧑‍🏫 Real-Time Whiteboard Collaboration App

A full-stack real-time collaborative whiteboard application built using React, Node.js, Express, MongoDB, and Socket.IO.
Users can sign up, log in, and draw together live on a shared canvas — all in real-time.

✨ Features
🖌️ Whiteboard

Real-time drawing and erasing shared across all connected users

Smooth canvas updates using Socket.IO

Multi-user synchronization

🔐 Authentication

Secure Signup & Login using JWT

Protected whiteboard access via PrivateRoute

Token validation middleware

🧩 Rooms (optional)

Create and join collaborative rooms

Isolated sessions for different teams or groups

⚙️ Tech Stack
Layer	Technology
Frontend	React.js (Vite), Context API, Socket.IO Client
Backend	Node.js, Express.js, Socket.IO
Database	MongoDB (via Mongoose)
Auth	JWT (JSON Web Token)
Hosting	Vercel (frontend) + Render (backend)
📁 Folder Structure
whiteboard-app/
├── client/                           # Frontend (React)
│   ├── src/
│   │   ├── assets/
│   │   ├── components/               # Navbar, Toolbar, etc.
│   │   ├── context/                  # AuthContext.jsx
│   │   ├── pages/                    # Home, Login, Signup, WhiteBoard
│   │   ├── utils/                    # PrivateRoute, socket setup
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── vite.config.js
│   └── package.json
│
└── server/                           # Backend (Node.js)
    ├── config/
    │   └── db.js                     # MongoDB connection
    ├── controllers/
    │   ├── authController.js         # Signup/Login logic
    │   └── roomController.js         # Room creation/join logic
    ├── middleware/
    │   └── auth.js                   # JWT verification middleware
    ├── models/
    │   ├── User.js                   # User schema
    │   └── Room.js                   # Room schema
    ├── routes/
    │   ├── auth.js                   # Auth endpoints
    │   └── roomRoutes.js             # Room-related routes
    ├── server.js                     # Express + Socket.IO setup
    ├── .env
    └── package.json

⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/ankit-singh26/Whiteboard-Project.git
cd whiteboard-app

2️⃣ Setup the Backend
cd server
npm install


Create a .env file inside the server/ directory:

PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/whiteboard
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173


Run the server:

npm start


Your backend should run on http://localhost:5000

3️⃣ Setup the Frontend
cd ../client
npm install


Create a .env file in the client/ directory:

VITE_BACKEND_URL=http://localhost:5000


Run the client:

npm run dev


Your frontend should run on http://localhost:5173

🔌 API Endpoints
Auth Routes (/api/auth)
Method	Endpoint	Description
POST	/signup	Register a new user
POST	/login	Authenticate and return a JWT
Room Routes (/api/rooms)
Method	Endpoint	Description
POST	/create	Create a new room
GET	/join/:id	Join an existing room
⚡ Socket.IO Events
Event	Description
draw	Broadcast drawing data to all users
clear	Clears the canvas for everyone
join-room	Allows a user to join a collaborative room
disconnect	Notifies when a user leaves
🧠 How It Works

User logs in → token stored in localStorage

Authenticated user navigates to /whiteboard

The client connects to the server via Socket.IO

Drawing actions emit socket events

The server broadcasts those events to all connected users in the same room

🧰 Future Improvements

🖌️ Undo/Redo support

🧾 Export board as image or PDF

🧑‍🤝‍🧑 Add user avatars on board

📦 Store board states in MongoDB

🌐 Deployment
Service	Description
Frontend	Deploy using Vercel

Backend	Deploy using Render

Database	Use MongoDB Atlas

Ensure to update your environment variables in the hosted environments.

👨‍💻 Author

Ankit Singh
🎓 NIT Jamshedpur
💻 Full Stack Developer | Web Enthusiast