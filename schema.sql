DROP TABLE IF EXISTS review_likes CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  stock INT DEFAULT 0,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE review_likes (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(review_id, user_id)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_number VARCHAR(30) UNIQUE NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  estimated_delivery DATE,
  shipping_address TEXT,
  admin_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  price_at_purchase NUMERIC(10,2) NOT NULL
);

INSERT INTO products (name, category, price, stock, image_url, description)
VALUES
('Hiking Kit', 'Outdoor', 60.00, 8, '/images/Hiking kit.jpg', 'Complete hiking kit with essential gear'),
('Towel', 'Accessories', 10.00, 25, '/images/Towel.jpg', 'Soft and absorbent sports towel'),
('Bicycle Helmet', 'Outdoor', 30.00, 20, '/images/Bicycle helmet.jpg', 'Safety bicycle helmet for outdoor riding'),
('Cricket Ball', 'Sports Equipment', 8.00, 30, '/images/cricket-ball-isolated.jpg', 'Durable leather cricket ball'),
('Tennis Ball', 'Sports Equipment', 5.00, 40, '/images/tennis-ball.jpg', 'Soft and durable tennis ball'),
('Football', 'Sports Equipment', 15.00, 20, '/images/football.jpg', 'Standard size football for outdoor play'),
('Cricket Bat', 'Sports Equipment', 40.00, 10, '/images/cricket bat.jpg', 'High‑quality wooden cricket bat'),
('Table Tennis Bat', 'Sports Equipment', 12.00, 15, '/images/table-tennis-bat.jpg', 'Lightweight table tennis bat'),
('Hockey Bat', 'Sports Equipment', 35.00, 12, '/images/hockey-bat.jpg', 'Strong and durable hockey bat'),
('Sports Shirt', 'Clothing', 20.00, 10, '/images/Sports Shirt.jpg', 'High‑quality sports shirt for training'),
('Running Shoes', 'Footwear', 45.00, 15, '/images/Running Shoes.jpg', 'Comfortable running shoes for daily workouts'),
('Football Shoes', 'Footwear', 50.00, 12, '/images/Football Shoes.jpg', 'Durable football shoes with strong grip');














