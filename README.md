
# GamanAPI

## BSc Hons in Computing  
**2023.2**  
**Web API Development**  
**Course Work**

### Coventry Index: 14946028  
### NIBM Index: YR3COBSCCOMP232P-039  
### NIBM Registered Name: M V N Hirushan  

**Faculty of Engineering, Environment and Computing**  
**School of Computing, Electronics and Mathematics**  
**Coventry University**

**School of Computing and Engineering**  
**National Institute of Business Management**  
**Colombo-7**

---

## Project Overview
**GamanAPI** is a comprehensive backend API developed for a bus booking and travel management system named **Gaman**. The API is designed using modern web development practices and follows RESTful principles to provide robust and scalable solutions for NTC administrators, bus operators, and commuters.

## Features
- **User Management**: Supports CRUD operations for users with role-based access control for admin, operator, and commuter roles.
- **Bus Management**: Full CRUD capabilities for bus details, including schedules.
- **Route Management**: Management of routes with start and end locations, stops, and durations.
- **Booking System**: An OTP-based booking confirmation system for commuters without the need for login.
- **Security**: Integration of JWT authentication, rate limiting, and Helmet for security enhancements.
- **Input Validation**: Implemented using Joi to ensure data integrity.

## Tech Stack
- **Node.js** and **Express.js** for the server.
- **MongoDB** for the database.
- **Twilio** for sending OTPs via SMS.
- **Joi** for request validation.
- **JWT** for authentication and authorization.
- **Helmet** and **express-rate-limit** for security.

## Project Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Hirushan-N/GamanAPI.git
   cd GamanAPI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the project root and add the following:
   ```env
   MONGO_URI=your_mongo_db_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

4. **Run the server**:
   ```bash
   npm run dev
   ```
   Use `nodemon` for development to automatically restart the server on code changes.

5. **Production build**:
   ```bash
   npm start
   ```

## API Endpoints

### Auth
- **POST** `/api/auth/register` – Register a new user.
- **POST** `/api/auth/login` – User login to obtain JWT token.

### Users (Admin)
- **GET** `/api/users` – Retrieve all users.
- **POST** `/api/users` – Create a new user.
- **PUT** `/api/users/:id` – Update user details.
- **DELETE** `/api/users/:id` – Delete a user.

### Routes
- **GET** `/api/routes` – Retrieve all routes.
- **POST** `/api/routes` – Create a new route.
- **PUT** `/api/routes/:id` – Update route details.
- **DELETE** `/api/routes/:id` – Delete a route.

### Buses
- **GET** `/api/buses` – Retrieve all buses.
- **POST** `/api/buses` – Create a new bus.
- **PUT** `/api/buses/:id` – Update bus details.
- **DELETE** `/api/buses/:id` – Delete a bus.

### Bookings
- **GET** `/api/bookings` – Retrieve all bookings.
- **POST** `/api/bookings` – Create a new booking (with OTP sent to the phone).
- **POST** `/api/bookings/confirm` – Confirm a booking with an OTP.
- **PUT** `/api/bookings/:id` – Update a booking.
- **DELETE** `/api/bookings/:id` – Cancel a booking.

## Project Structure
```
GamanAPI/
│
├── src/
│   ├── config/                # Database configuration
│   ├── controllers/           # API controllers
│   ├── middleware/            # Middleware for validation and security
│   ├── models/                # Mongoose models
│   ├── repositories/          # Data access layer
│   ├── services/              # Business logic layer
│   ├── utils/                 # Utility functions (e.g., OTP generation)
│   └── app.js                 # Main server file
└── package.json
```

## Architecture Pattern
**GamanAPI** is designed with a layered architecture pattern to ensure separation of concerns and maintainability:

- **Controller Layer**: Handles HTTP requests and formulates responses.
- **Service Layer**: Contains the business logic, acting as an intermediary between the controllers and repositories.
- **Repository Layer**: Manages database interactions, providing an abstraction over raw database operations.
- **Middleware Layer**: Handles authentication, validation, and error management across routes.
- **Model Layer**: Defines data structures using Mongoose schemas and interacts with the MongoDB database.

**Benefits**:
- Improved code modularity and separation of concerns.
- Easier maintenance and testing of individual components.
- Clearer responsibilities, aligning with the single responsibility principle.

## REST Best Practices
The API follows RESTful design principles, ensuring consistency and scalability:
- **HTTP Methods**: Proper use of methods like GET, POST, PUT, DELETE for respective actions.
- **Status Codes**: Use of standard HTTP status codes (e.g., `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`).
- **Resource-Based URLs**: Endpoints are designed around resources (e.g., `/api/routes`, `/api/bookings`).
- **Statelessness**: Each API call is independent, carrying necessary state via JWT tokens.
- **Validation**: Implemented using Joi to enforce input validation and data integrity.
- **Error Handling**: Centralized error handling middleware provides meaningful error messages to the client.

## Security Practices
- **JWT Authentication**: Secure access to protected routes.
- **Rate Limiting**: Prevents abuse by limiting requests from a single IP.
- **Helmet**: Provides secure HTTP headers.
- **OTP Verification**: Commuters confirm bookings via OTP without login.

## Future Enhancements
- Integrate additional payment gateway options.
- Add real-time notifications for booking updates.
- Implement advanced data analytics for route optimization.

## License
