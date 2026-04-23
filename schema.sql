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


INSERT INTO products (name, category, price, stock, image_url, description, created_at)
VALUES
('Cricket Bat', 'Cricket', 120.00, 15, 'images/cricket bat.jpg', 'High quality cricket bat', NOW()),
('Cricket Ball', 'Cricket', 15.00, 50, 'images/cricket-ball-isolated.jpg', 'Durable leather cricket ball', NOW()),
('Football', 'Football', 30.00, 40, 'images/football.jpg', 'Standard size football', NOW()),
('Hockey Bat', 'Hockey', 80.00, 20, 'images/hockey-bat.jpg', 'Professional hockey stick', NOW()),
('Table Tennis Bat', 'Table Tennis', 25.00, 35, 'images/table-tennis-bat.jpg', 'Lightweight TT bat', NOW()),
('Tennis Ball', 'Tennis', 10.00, 60, 'images/tennis-ball.jpg', 'Pack of tennis balls', NOW());