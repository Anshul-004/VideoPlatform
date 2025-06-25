# Video Platform Backend

A robust backend for a video-sharing platform, built with Node.js and Express. This project demonstrates a full-featured REST API where users can register, authenticate (using JWT), upload videos, subscribe to channels, comment, edit content, and more.

## Features

- **User Authentication**
  - Register and login with secure password hashing
  - JWT-based authentication for protected routes

- **Video Management**
  - Upload videos (with Cloudinary integration)
  - Edit and delete videos
  - Fetch videos by user, trending, or search

- **User Interactions**
  - Subscribe/unsubscribe to channels
  - Like/dislike videos
  - Comment on videos
  - Edit and delete comments

- **Profile Management**
  - Update user profile, avatar, and cover image

- **API Error Handling**
  - Consistent error responses using custom `ApiError` class

- **Consistent API Responses**
  - Standardized success responses with `ApiResponse` class

## Tech Stack

- **Node.js** & **Express.js**
- **MongoDB** (with Mongoose)
- **JWT** for authentication
- **Cloudinary** for media storage
- **Multer** for file uploads
- **dotenv** for environment variable management

## Getting Started

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/video-platform-backend.git
   cd video-platform-backend
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   And use the .env.sample for all the environment variables.
   

4. **Run the server**
   ```
   npm start
   ```

## API Endpoints 

- `POST /api/auth/v1/register` — Register a new user
- `POST /api/auth/v1/login` — Login and receive JWT
- `POST /api/v1videos` — Upload a new video (authenticated)
- `GET /api/v1videos/:id` — Get video details
- `POST /api/v1videos/:id/comments` — Add a comment
- `POST /api/v1users/:id/subscribe` — Subscribe to a user

## Skills Showcased

- RESTful API design
- JWT authentication and authorization
- File uploads and cloud storage integration
- Modular and scalable code structure
- Robust error handling and response formatting

---
