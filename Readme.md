# Sportscart

Sportscart is a full-stack sports e-commerce web application. It allows users to browse sports products, add items to a cart, place orders, write reviews, like reviews, and track order status. The project also includes an admin dashboard for managing products and orders.

## Features

### User Features
- User registration and login
- Browse sports products
- Search products
- View product details
- Add products to cart
- Place orders
- Track order status
- Add and like product reviews
- Edit own review comments

### Admin Features
- Admin dashboard
- Add new products
- Edit existing products
- Delete products
- View all customer orders
- Update order status
- Delete orders
- Delete customer reviews

## Technologies Used

### Frontend
- HTML
- CSS
- JavaScript
- Bootstrap

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL

### Deployment
- Render

## Project Structure

webProject-26/
│
├── public/
│   ├── css/
│   │   └── style.css
│   │
│   ├── images/
│   │
│   ├── js/
│   │   ├── app.js
│   │   ├── cart.js
│   │   ├── contact.js
│   │   ├── dashboard.js
│   │   ├── home.js
│   │   ├── login.js
│   │   ├── product.js
│   │   ├── products.js
│   │   ├── reviews.js
│   │   ├── search.js
│   │   └── signup.js
│   │
│   ├── about.html
│   ├── cart.html
│   ├── contact.html
│   ├── dashboard.html
│   ├── index.html
│   ├── login.html
│   ├── product.html
│   ├── products.html
│   └── signup.html
│
├── routes/
│   ├── authRoutes.js
│   ├── feedbackRoutes.js
│   ├── orderRoutes.js
│   ├── productRoutes.js
│   └── reviewRoutes.js
│
├── db.js
├── server.js
├── schema.sql
├── package.json
├── package-lock.json
├── .env
├── .gitignore
└── README.md


Database Tables

The application uses the following PostgreSQL tables:

users
products
feedback
cart_items
reviews
review_likes
orders
order_items

The database schema is available in:

schema.sql

## Project Structure

Clone the repository:

git clone <your-repository-url>

Go into the project folder:

cd webProject-26

Install dependencies:

npm install
Environment Variables

Create a .env file in the root folder and add your database details:

DB_USER=your_database_user
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_database_password
DB_PORT=5432

Running the Project Locally

Start the server:

npm start

Then open the website in your browser:

http://localhost:5000


## Author

Muhammad Tabish
Muhammad Shafiq

## Project Purpose

This project was developed as a web programming project. The aim was to build a functional full-stack e-commerce application using frontend, backend, and database technologies.

## Future Improvements

Add online payment integration
Add JWT-based authentication
Improve admin security
Add product filtering by price and category
Add order invoice generation
Add email notifications
Improve mobile responsiveness