# ClickCart

ClickCart is a mini online shopping web application built with the MERN stack (MongoDB, Express.js, React, Node.js) that offers most of the features used in an online shopping platform such as products, cart, checkout, pagination, payments, and more.

## Features

- User sign-up and authentication
- Password reset through email notifications
- Pagination
- Email notifications for successful logins
- Image uploads
- Stripe payment integration
- Add, edit, update, and delete products as a Vendor

## Getting Started

Follow the instructions below to have a copy of this project up and running on your local machine for development and testing purposes.

### Prerequisites

- **Node.js**: A JavaScript runtime that allows you to run applications outside the browser.
- **Express.js**: A Node.js web application framework used to build APIs and handle server-side middleware efficiently.
- **NPM**: A package manager for Node.js software packages (comes bundled with Node.js).
- **MongoDB installation**: Familiarity with setting up and using MongoDB.
- **Stripe account**: Or knowledge of any payment integration service.
- **Nodemailer**: A tool used to send emails, such as Gmail notifications.


### Installing the Project

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/shashikira02/ClickCart.git
2. Navigate to the Client folder:
   ```bash
   cd Client
3. Install client dependencies:
   ```bash
   npm install
4. Navigate to the Server folder:
   ```bash
   cd Server
5. Install Server dependencies:
   ```bash
   npm install
6. Create a .env file based on the .env.example file and populate the following variables:
   ```env
   USER=<nodemailer-gmail>
   APP_PASSWORD=<App-Password>
   MONGO_USER=<Mongo-user-id>
   MONGO_PASSWORD=<Mongo-password>
   MONGO_DEFAULT_DATABASE=<database-name>
   STRIPE_KEY=<Stripe-Secret-Key>
   PORT=<Server-Port>
   SK=<JWT-secretKey>
   
### .env.example Brief

- **USER**: Gmail used for sending emails
- **APP_PASSWORD**: App password for the above Gmail from Google's 2-Step Verification
- **MONGO_USER**: MongoDB user ID for the database
- **MONGO_PASSWORD**: MongoDB password for the database
- **MONGO_DEFAULT_DATABASE**: MongoDB database name
- **STRIPE_KEY**: Stripe secret key for payment integration
- **PORT**: Server port for the client
- **SK**: JWT secret key for authentication

### Installing the Project

1. Navigate to the Client folder:
   ```bash
   cd Client
2. Start the client application:
   ```bash
   npm start
3. Navigate to the Server folder:
   ```bash
   cd Server
4. Start the server application:
   ```bash
   npm start

## Built With
- Node.js
- Express.js
- MongoDB
- GraphQL API
- React

## Project Debrief
**ClickCart** is a simple e-commerce application with user authentication and payment integration using Stripe. The application is developed with most of the industrial standards for project development and offers a wide range of features used in online shopping platforms.

### Features:
- **User Authentication**: The application uses JWT for authentication, sets secure response headers, and uses SSL/TLS for HTTPS connections.
- **Security**: The application uses cookies for storing data on the browser, sessions for client authentication, and has minor security measures to prevent attacks.
- **Email Integration**: Uses Nodemailer with Gmail for sending sign-up notifications and password reset emails using a token.
- **Payment Integration**: Integrated with Stripe for payments and includes invoice generation upon payment.
- **Data Handling**: Uses REST API, WebSockets, and GraphQL for querying data and performing mutations for a cleaner user experience and inter-app communication.
- **Database**: MongoDB is used as the database for storing user data and order information along with Mongoose.
- **Frontend**: The client-side application is built using React and is responsible for rendering the user interface and handling user interactions.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
