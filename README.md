# 🚌✨ SmartLink — Your Bus, Your Way!

<img width="4096" height="2140" alt="Gemini_Generated_Image_tc5juctc5juctc5j" src="https://github.com/user-attachments/assets/d6d3b412-6464-4511-a19a-92c70a4af814" />




Say goodbye to waiting and hello to **smart commuting** with **SmartLink**! 🚀  

📍 **Live Bus Tracking** — Know exactly where your bus is, in real-time.  
🗺️ **Route Monitoring** — Plan your ride, avoid delays, and stay ahead.  
📲 **User-Friendly Interface** — Smooth, simple, and super intuitive.  
⚡ **Fast & Reliable** — Built for speed, performance, and zero stress.  

Hop on, track it, ride smart — **SmartLink makes every commute effortless!** 🎉🚌💨


# 🚀 SmartLink Features

### 👥 For Users (Passengers)
- 🗺️ **Track Buses Live** – Watch all buses move in real-time on an interactive map.  
- 🔔 **Instant Updates** – Receive notifications about bus location, route changes, and arrival times.  
- 📱 **Smooth Experience** – Fully responsive and mobile-friendly; check your commute anytime, anywhere.  

### 🛠️ For Admins & Operators
- ➕ **Manage Buses & Routes** – Easily add new buses, update routes, and keep everything organized.  
- 👥 **User & Role Management** – Assign roles like admin, operator, or passenger, and control access.  
- 📊 **Monitor Operations** – Track bus availability, status, and performance in real-time to keep things running smoothly.

### ⚡ Technical Features — What Makes SmartLink Unique  

- ⏱️ **Smart ETA Predictions** – Our AI-powered model predicts bus arrival times using historical data. No more waiting, no more guessing!  
- 🚀 **Real-Time Location Streaming** – Lightning-fast updates powered by **Redis 🟢** in-memory caching. Track buses live with zero lag.  
- 🗺️ **Interactive Maps** – Sleek, user-friendly maps built with **Leaflet 🟦**, showing buses moving in real-time.  
- 🔒 **Secure Authentication** – **Firebase 🔥** ensures safe logins for passengers, operators, and admins.  
- 🌐 **RESTful APIs** – Smooth delivery of bus data, routes, and live locations for a seamless experience.  
- 🏗️ **Modular & Scalable Architecture** – Built to handle high traffic with ease, ready for growth and expansion.  



# 🚀 Why SmartLink Stands Out
SmartLink isn’t just a bus tracker — it’s a **full smart commuting experience**:  
- ⚡ **Faster Updates**  
- 🎯 **Accurate ETAs**  
- 🚌 **Real-Time Tracking**  
- 🌟 **Intuitive, user-friendly interface**  

SmartLink combines **speed, intelligence, and reliability** to make every ride smooth, stress-free, and smarter than ever! 🎉💨


# 🏗️ SmartLink Tech Stack  

SmartLink is built with **modern, reliable, and scalable technologies** to deliver seamless real-time bus tracking. 🚍💨  



### 🖥️ **Frontend**
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="25"/> **React.js** – Dynamic UI with Hooks & Context API / Zustand for state management  
- <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" width="25"/> **Shadcn UI / TailwindCSS** – Beautiful, reusable components and responsive styling  
- <img src="https://leafletjs.com/docs/images/logo.png" width="55"/> **Leaflet.js** – Interactive maps for real-time bus tracking  
- 🗺️ **Google Maps API** – Route visualization and location services
- 🌍**OSMR** – OpenStreetMap routing for optimal paths  

### 🛠️ **Backend**
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="25"/> **Node.js** & <img src="https://img.icons8.com/color/48/000000/express-js.png" width="40"/> **Express.js** – Fast, scalable server-side logic  
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" width="25"/> **MongoDB Atlas** – Cloud database for buses, routes, and users  

### 🔒 **Authentication & Security**
- <img src="https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg" width="25"/> **Firebase Authentication** – Secure sign-in for users and admins   
- 👥 **Role-Based Access Control** – Admin, Operator, Passenger permissions  

✨ SmartLink combines **⚡ speed**, **🗺️ interactivity**, and **🔒 security** — the ultimate stack for real-time bus tracking! 🚍💨


## 🔧 Architecture Overview  

```mermaid
flowchart LR
    A[Bus GPS Device] -->|Sends Location Data| B[Backend API - Node.js/Express]
    B --> C[Redis Cache - Real-time Data]
    B --> D[Database - MongoDB/SQL]
    C --> E[Frontend - React UI]
    D --> E
    E -->|Interactive Map| User[User/Admin]
```

- Location data is ingested by the backend.  
- Redis caches live bus data for fast retrieval.  
- Persistent information (buses, routes, users) is stored in the database.  
- Frontend fetches live data via APIs and updates maps in real time.  

---

# ⚙️ Installation & Setup  

Follow these steps to get **SmartLink – Real-Time Bus Tracking** running on your local machine. This guide covers both **frontend** and **backend** setup. 🚀



### 1️⃣ Clone the Repository  
First, clone the project repository and navigate into it:  
```bash
git clone https://github.com/YourUsername/SmartLink-Bus-Tracking.git
cd SmartLink-Bus-Tracking
```
This will create a local copy of the project on your machine.

---

### 2️⃣ Setup Backend (Node.js + Express.js + MongoDB Atlas)

1. Navigate to the backend folder and install all dependencies:

```bash
cd backend
npm install
````

2. Create a `.env` file inside the `backend` folder and configure the environment variables:

```env
# Server configuration
PORT=5000

# MongoDB Atlas connection string
MONGO_URI=your_mongodb_connection_string

# Redis for real-time caching
REDIS_URL=redis://localhost:6379

# JWT secret key for authentication
JWT_SECRET=your_secret_key

# Firebase service account (JSON string)
FIREBASE_SERVICE_ACCOUNT='{
  "type": "service_account",
  "project_id": "your_project_id",
  "private_key_id": "your_private_key_id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
  "client_email": "your_client_email",
  "client_id": "your_client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "your_client_x509_cert_url",
  "universe_domain": "googleapis.com"
}'
```

3. Start the backend server:

```bash
npm start
```

The backend server will run on `http://localhost:5000`, handling:

* API requests
* Database operations with MongoDB Atlas
* Real-time caching with Redis
* Authentication using JWT and Firebase ⚡

---

### 3️⃣ Setup Frontend (React.js + Zustand + Shadcn UI + Leaflet + OSMR + Google Maps API)

1. Navigate to the frontend folder and install dependencies:

```bash
cd ../frontend
npm install
```

2. Create a `.env` file in the `frontend` folder and add the following configuration:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_APP_ID=your_firebase_app_id
```

3. Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`, providing:

* Responsive UI for desktop and mobile 📱
* Interactive maps using Leaflet, OSMR, and Google Maps API 🗺️
* Real-time bus tracking and route monitoring
* Authentication via Clerk and Firebase 🔒





### 4️⃣ Access the App

Open your browser and go to:

```
http://localhost:3000
```

✅ **Tip:** Make sure **MongoDB Atlas**, **Redis**, and **Firebase** services are correctly configured. Otherwise, backend APIs or authentication may not work properly.





# 🧑‍💻 API Endpoints – SmartLink

Here’s a complete list of all API endpoints for **SmartLink**, organized by functionality. Each endpoint includes the HTTP method, URL, description, and authentication requirement. 🚀

---

### 🔑 Authentication

| Method | Endpoint | Description | Auth Required |
| :---: | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | 📝 Register a new user account. | ❌ No |
| `POST` | `/api/auth/login` | 🚪 Log in to an existing account and receive a JWT token. | ❌ No |
| `POST` | `/admin/set-admin` | 👑 Grant administrative privileges to a user. | ✅ Admin Only |

> **Tip:** Use `/register` for new users and `/login` to get the token required for protected routes.

---

### 🚌 Bus Management

| Method | Endpoint | Description | Auth Required |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/buses` | 🗺️ Fetch a paginated list of all buses with live location and status. | ✅ Yes |
| `GET` | `/api/buses/:id` | 🆔 Retrieve details for a specific bus by its ID. | ✅ Yes |
| `POST` | `/api/buses` | ✨ Add a new bus to the system. | ✅ Admin Only |
| `POST` | `/api/buses/bulk` | 🚍 Add multiple buses in a single request. | ✅ Admin Only |
| `PATCH` | `/api/buses/:id` | 🔄 Update a bus's details (e.g., capacity, route). | ✅ Admin Only |
| `PUT` | `/api/buses/:id/change-route` | 🛣️ Assign a new route to a bus. | ✅ Admin Only |
| `PUT` | `/api/buses/:id/change-status` | 🚦 Update the operational status of a bus (active/inactive). | ✅ Admin Only |
| `PUT` | `/api/buses/:id/change-driver` | 👨‍✈️ Assign a driver to a bus. | ✅ Admin Only |

> **Note:** Bus endpoints allow admins to manage fleet operations and track live bus data.

---

### 🗺️ Route Management

| Method | Endpoint | Description | Auth Required |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/routes` | 📜 List all available routes with details. | ✅ Yes |
| `GET` | `/api/routes/:code` | 🔍 Get information about a specific route. | ✅ Yes |
| `GET` | `/api/routes/:code/assigned-buses` | 🚌 See all buses assigned to a particular route. | ✅ Yes |
| `POST` | `/api/routes` | ➕ Create a new route with stops and stations. | ✅ Admin Only |
| `POST` | `/api/routes/bulk` | 📚 Add multiple routes at once. | ✅ Admin Only |
| `PUT` | `/api/routes/:code/assign-bus` | ✅ Assign one or more buses to a route. | ✅ Admin Only |
| `PUT` | `/api/routes/:code/unassign-bus` | ❌ Unassign buses from a route. | ✅ Admin Only |
| `POST` | `/api/routes/update-connectivitys` | 🔗 Update connectivity between different routes. | ✅ Admin Only |

> **Tip:** Use route management endpoints to keep your network organized and efficient.

---

### 🚉 Station & Stop Management

| Method | Endpoint | Description | Auth Required |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/stations` | 🚉 List all stations with details. | ✅ Yes |
| `POST` | `/api/stations` | ➕ Add a new station. | ✅ Admin Only |
| `POST` | `/api/stations/bulk` | 🏢 Add multiple stations in bulk. | ✅ Admin Only |
| `GET` | `/api/stops` | 🚏 List all bus stops. | ✅ Yes |
| `POST` | `/api/stops` | ➕ Add a new bus stop. | ✅ Admin Only |
| `POST` | `/api/stops/bulk` | 🏫 Add multiple stops at once. | ✅ Admin Only |

> **Note:** Stations and stops are essential for accurate route planning and live tracking.

---

### 👨‍✈️ Driver Management

| Method | Endpoint | Description | Auth Required |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/drivers` | 👥 Get a list of all drivers. | ✅ Admin Only |
| `GET` | `/api/drivers/:id` | 🆔 Fetch details of a specific driver. | ✅ Admin Only |
| `GET` | `/api/drivers/status/:status` | 🚦 Filter drivers by status (e.g., active). | ✅ Admin Only |
| `POST` | `/api/drivers` | ➕ Add a new driver to the system. | ✅ Admin Only |

> **Tip:** Keep driver information updated to ensure smooth fleet operations.

---

### 📊 Admin Dashboard

| Method | Endpoint | Description | Auth Required |
| :---: | :--- | :--- | :---: |
| `GET` | `/admin/dashboard` | 📈 Retrieve analytics, summaries, and key metrics for the admin panel. | ✅ Admin Only |

> **Note:** Admin endpoints are protected.  🔒

# 📜 License

This project is licensed under the **MIT License**.  

---

✨ **Thank you for checking out SmartLink!**  
Hop on, track your bus in real-time, and make commuting effortless. 🚌💨  

💡 **Want to contribute?**  
Feel free to fork the repo, submit issues, or open a pull request. Every little contribution makes SmartLink better! 🚀  

📬 **Stay Connected:**  
- Star ⭐ this repo if you like it  
- Follow for updates and new features  

---

Built with ❤️ through **hard work, dedication, and collaboration** by the SmartLink team.  
Every feature, every line of code, crafted to make commuting seamless and enjoyable! 🚌💡
crafted to make commuting effortless and fun! 🚌💡🚀




