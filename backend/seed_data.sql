-- Clear existing data completely
TRUNCATE TABLE ad_attribute_values, ad_images, ads, category_attributes, categories, cities, states, users RESTART IDENTITY CASCADE;

-- ==========================================
-- PASSWORD FOR ALL USERS IS: $2b$12$v6cm4i1SzV9o9xuuV8.38.cyIwx4H3dYXoWwoMUKUjPs7vbdBhSKS
-- ==========================================

-- 1. Create Users
INSERT INTO users (uuid, name, username, email, phone, password, role_id, is_verified, is_active, created_at, modified_at, is_delete) VALUES
-- Super Admin (Role 1)
(gen_random_uuid()::text, 'Super Admin', 'superadmin', 'superadmin@example.com', '9876543200', '$2b$12$v6cm4i1SzV9o9xuuV8.38.cyIwx4H3dYXoWwoMUKUjPs7vbdBhSKS', 1, true, true, NOW(), NOW(), false),

-- System Admin (Role 2)
(gen_random_uuid()::text, 'System Admin', 'sysadmin', 'sysadmin@example.com', '9876543201', '$2b$12$v6cm4i1SzV9o9xuuV8.38.cyIwx4H3dYXoWwoMUKUjPs7vbdBhSKS', 2, true, true, NOW(), NOW(), false),

-- 10 Normal Users (Role 3)
(gen_random_uuid()::text, 'John Doe', 'johndoe', 'john@example.com', '9876543210', '$2b$12$v6cm4i1SzV9o9xuuV8.38.cyIwx4H3dYXoWwoMUKUjPs7vbdBhSKS', 3, true, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 'Alice Smith', 'alicesmith', 'alice@example.com', '9876543211', '$2b$12$v6cm4i1SzV9o9xuuV8.38.cyIwx4H3dYXoWwoMUKUjPs7vbdBhSKS', 3, true, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 'Rahul Sharma', 'rahulsharma', 'rahul@example.com', '9876543212', '$2b$12$v6cm4i1SzV9o9xuuV8.38.cyIwx4H3dYXoWwoMUKUjPs7vbdBhSKS', 3, true, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 'Priya Patel', 'priyapatel', 'priya@example.com', '9876543213', '$2b$12$v6cm4i1SzV9o9xuuV8.38.cyIwx4H3dYXoWwoMUKUjPs7vbdBhSKS', 3, true, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 'Amit Singh', 'amitsingh', 'amit@example.com', '9876543214', '$2b$12$v6cm4i1SzV9o9xuuV8.38.cyIwx4H3dYXoWwoMUKUjPs7vbdBhSKS', 3, true, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 'Sneha Kumar', 'snehakumar', 'sneha@example.com', '9876543215', '$2b$12$v6cm4i1SzV9o9xuuV8.38.cyIwx4H3dYXoWwoMUKUjPs7vbdBhSKS', 3, true, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 'Vikram Gupta', 'vikramgupta', 'vikram@example.com', '9876543216', '$2b$12$v6cm4i1SzV9o9xuuV8.38.cyIwx4H3dYXoWwoMUKUjPs7vbdBhSKS', 3, true, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 'Neha Deshmukh', 'nehadeshmukh', 'neha@example.com', '9876543217', '$2b$12$v6cm4i1SzV9o9xuuV8.38.cyIwx4H3dYXoWwoMUKUjPs7vbdBhSKS', 3, true, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 'Rohit Reddy', 'rohitreddy', 'rohit@example.com', '9876543218', '$2b$12$v6cm4i1SzV9o9xuuV8.38.cyIwx4H3dYXoWwoMUKUjPs7vbdBhSKS', 3, true, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 'Pooja Verma', 'poojaverma', 'pooja@example.com', '9876543219', '$2b$12$v6cm4i1SzV9o9xuuV8.38.cyIwx4H3dYXoWwoMUKUjPs7vbdBhSKS', 3, true, true, NOW(), NOW(), false);

-- 2. Create States & Cities
INSERT INTO states (id, uuid, name, slug, created_at, modified_at, is_delete) VALUES
(1, gen_random_uuid()::text, 'Maharashtra', 'maharashtra', NOW(), NOW(), false),
(2, gen_random_uuid()::text, 'Delhi', 'delhi', NOW(), NOW(), false),
(3, gen_random_uuid()::text, 'Karnataka', 'karnataka', NOW(), NOW(), false);

SELECT setval('states_id_seq', (SELECT MAX(id) FROM states));

INSERT INTO cities (id, uuid, name, slug, state_id, is_popular, created_at, modified_at, is_delete) VALUES
(1, gen_random_uuid()::text, 'Mumbai', 'mumbai', 1, true, NOW(), NOW(), false),
(2, gen_random_uuid()::text, 'Pune', 'pune', 1, true, NOW(), NOW(), false),
(3, gen_random_uuid()::text, 'New Delhi', 'new-delhi', 2, true, NOW(), NOW(), false),
(4, gen_random_uuid()::text, 'Bangalore', 'bangalore', 3, true, NOW(), NOW(), false);

SELECT setval('cities_id_seq', (SELECT MAX(id) FROM cities));

-- 3. Create Categories
INSERT INTO categories (id, uuid, name, slug, icon_url, parent_id, created_at, modified_at, is_delete) VALUES
(1, gen_random_uuid()::text, 'Mobiles', 'mobiles', '📱', NULL, NOW(), NOW(), false),
(2, gen_random_uuid()::text, 'Cars & Bikes', 'cars-bikes', '🚗', NULL, NOW(), NOW(), false),
(3, gen_random_uuid()::text, 'Electronics', 'electronics', '💻', NULL, NOW(), NOW(), false),
(4, gen_random_uuid()::text, 'Real Estate', 'real-estate', '🏠', NULL, NOW(), NOW(), false);

SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- 4. Create Category Attributes
INSERT INTO category_attributes (id, uuid, category_id, name, slug, field_type, is_required, options, created_at, modified_at, is_delete) VALUES
(1, gen_random_uuid()::text, 1, 'Brand', 'brand', 'text', true, NULL, NOW(), NOW(), false),
(2, gen_random_uuid()::text, 1, 'RAM', 'ram', 'select', false, '["4GB", "8GB", "12GB", "16GB"]', NOW(), NOW(), false),
(3, gen_random_uuid()::text, 2, 'Year', 'year', 'number', true, NULL, NOW(), NOW(), false),
(4, gen_random_uuid()::text, 2, 'Fuel Type', 'fuel-type', 'select', true, '["Petrol", "Diesel", "Electric", "CNG"]', NOW(), NOW(), false),
(5, gen_random_uuid()::text, 3, 'Type', 'type', 'text', true, NULL, NOW(), NOW(), false),
(6, gen_random_uuid()::text, 4, 'BHK', 'bhk', 'number', true, NULL, NOW(), NOW(), false);

SELECT setval('category_attributes_id_seq', (SELECT MAX(id) FROM category_attributes));

-- 5. Create Ads (distributed among users)
INSERT INTO ads (id, uuid, title, description, price, price_negotiable, condition, ad_type, status, user_id, category_id, city_id, locality, views_count, created_at, modified_at, is_delete, is_premium) VALUES
(1, gen_random_uuid()::text, 'Apple iPhone 15 Pro Max 256GB', 'Brand new sealed iPhone 15 Pro Max. Never opened. Cash only, no exchange.', 145000.00, true, 'new', 'sell', 'active', (SELECT id FROM users WHERE username='johndoe'), 1, 1, 'Andheri West', 124, NOW() - interval '2 days', NOW(), false, true),
(2, gen_random_uuid()::text, 'Samsung Galaxy S24 Ultra 512GB', 'Slightly used Galaxy S24 Ultra. Pristine condition with original box and accessories.', 115000.00, false, 'like_new', 'sell', 'active', (SELECT id FROM users WHERE username='alicesmith'), 1, 3, 'Connaught Place', 45, NOW() - interval '5 hours', NOW(), false, false),
(3, gen_random_uuid()::text, 'OnePlus 12 16GB RAM 512GB Storage', 'OnePlus 12, mint condition, 3 months old. Selling because switching to iOS.', 62000.00, true, 'like_new', 'sell', 'active', (SELECT id FROM users WHERE username='rahulsharma'), 1, 4, 'Indiranagar', 88, NOW() - interval '1 day', NOW(), false, true),
(4, gen_random_uuid()::text, '2022 Hyundai Creta SX Opt Diesel', 'First owner, non-accidental, fully serviced at authorized center. Insurance valid till next year.', 1650000.00, true, 'used', 'sell', 'active', (SELECT id FROM users WHERE username='priyapatel'), 2, 4, 'Koramangala', 320, NOW() - interval '5 days', NOW(), false, true),
(5, gen_random_uuid()::text, '2021 Maruti Suzuki Swift VXI', 'Well maintained Swift VXI, 45,000 kms driven. New tyres, recently serviced.', 580000.00, true, 'used', 'sell', 'active', (SELECT id FROM users WHERE username='amitsingh'), 2, 2, 'Kothrud', 89, NOW() - interval '1 day', NOW(), false, false),
(6, gen_random_uuid()::text, '2023 Honda City ZX CVT', 'Top model Honda City. Sunroof, leather seats. Single hand driven.', 1480000.00, false, 'like_new', 'sell', 'active', (SELECT id FROM users WHERE username='snehakumar'), 2, 3, 'Vasant Kunj', 210, NOW() - interval '3 days', NOW(), false, true),
(7, gen_random_uuid()::text, 'Royal Enfield Classic 350 - 2021', 'Gunmetal Grey Classic 350. Excellent condition, regular servicing done.', 175000.00, true, 'used', 'sell', 'active', (SELECT id FROM users WHERE username='vikramgupta'), 2, 2, 'Shivajinagar', 150, NOW() - interval '2 days', NOW(), false, false),
(8, gen_random_uuid()::text, 'KTM Duke 390 BS6', 'Orange Duke 390, thrilling performance. Very well kept. Need urgent cash.', 230000.00, true, 'used', 'sell', 'active', (SELECT id FROM users WHERE username='nehadeshmukh'), 2, 1, 'Bandra', 220, NOW() - interval '4 days', NOW(), false, true),
(9, gen_random_uuid()::text, 'Apple MacBook Air M2 8GB 256GB', 'Midnight Blue MacBook Air M2. Spotless, works perfectly. Battery cycle count 45.', 85000.00, false, 'like_new', 'sell', 'active', (SELECT id FROM users WHERE username='rohitreddy'), 3, 3, 'Hauz Khas', 512, NOW() - interval '12 hours', NOW(), false, false),
(10, gen_random_uuid()::text, 'Dell XPS 15 OLED i7 16GB 1TB', 'Premium laptop, great for creators. 4K OLED screen. Includes original charger.', 110000.00, true, 'used', 'sell', 'active', (SELECT id FROM users WHERE username='poojaverma'), 3, 4, 'Whitefield', 310, NOW() - interval '6 days', NOW(), false, true),
(11, gen_random_uuid()::text, 'Sony PlayStation 5 Console', 'PS5 Disc edition with 1 controller and 2 games (Spider-Man 2, God of War Ragnarok).', 42000.00, false, 'used', 'sell', 'active', (SELECT id FROM users WHERE username='johndoe'), 3, 1, 'Andheri East', 400, NOW() - interval '8 hours', NOW(), false, false),
(12, gen_random_uuid()::text, 'Spacious 2BHK Apartment for Rent', 'Semi-furnished 2BHK flat with modular kitchen and AC in both bedrooms. Ready to move.', 45000.00, false, NULL, 'rent', 'active', (SELECT id FROM users WHERE username='alicesmith'), 4, 4, 'Indiranagar', 75, NOW() - interval '4 days', NOW(), false, true),
(13, gen_random_uuid()::text, 'Commercial Office Space 1500 sqft', 'Prime location office space available immediately. Fully furnished with cabins and workstations.', 120000.00, true, NULL, 'rent', 'active', (SELECT id FROM users WHERE username='rahulsharma'), 4, 1, 'Lower Parel', 22, NOW() - interval '6 hours', NOW(), false, false),
(14, gen_random_uuid()::text, 'Luxury 3BHK Villa in Whitefield', 'Beautiful 3BHK villa in a gated community. Modern amenities, swimming pool, clubhouse.', 35000000.00, true, NULL, 'sell', 'active', (SELECT id FROM users WHERE username='priyapatel'), 4, 4, 'Whitefield', 180, NOW() - interval '1 week', NOW(), false, true);

SELECT setval('ads_id_seq', (SELECT MAX(id) FROM ads));

-- 6. Create Ad Images
INSERT INTO ad_images (uuid, ad_id, image_url, display_order, is_primary, created_at, modified_at, is_delete) VALUES
(gen_random_uuid()::text, 1, 'http://localhost:8000/uploads/ads/iphone_15_pro_max/main.jpg', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 2, 'http://localhost:8000/uploads/ads/samsung_galaxy_s24_ultra/main.jpg', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 3, 'http://localhost:8000/uploads/ads/oneplus_12/main.jpg', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 4, 'http://localhost:8000/uploads/ads/hyundai_creta_2022/main.jpg', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 5, 'http://localhost:8000/uploads/ads/maruti_swift_2021/main.jpg', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 6, 'http://localhost:8000/uploads/ads/honda_city_2023/main.jpg', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 7, 'http://localhost:8000/uploads/ads/royal_enfield_classic_350/main.jpg', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 8, 'http://localhost:8000/uploads/ads/ktm_duke_390/main.jpg', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 9, 'http://localhost:8000/uploads/ads/macbook_air_m2/main.jpg', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 10, 'http://localhost:8000/uploads/ads/dell_xps_15/main.jpg', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 11, 'http://localhost:8000/uploads/ads/ps5_console/main.jpg', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 12, 'http://localhost:8000/uploads/ads/apartment_2bhk_andheri/main.jpg', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 13, 'http://localhost:8000/uploads/ads/office_space_bkc/main.jpg', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 14, 'http://localhost:8000/uploads/ads/villa_4bhk_whitefield/main.jpg', 0, true, NOW(), NOW(), false);

-- 7. Create Ad Attribute Values
INSERT INTO ad_attribute_values (uuid, ad_id, attribute_id, value, created_at, modified_at, is_delete) VALUES
(gen_random_uuid()::text, 1, 1, 'Apple', NOW(), NOW(), false),
(gen_random_uuid()::text, 1, 2, '8GB', NOW(), NOW(), false),
(gen_random_uuid()::text, 2, 1, 'Samsung', NOW(), NOW(), false),
(gen_random_uuid()::text, 2, 2, '12GB', NOW(), NOW(), false),
(gen_random_uuid()::text, 3, 1, 'OnePlus', NOW(), NOW(), false),
(gen_random_uuid()::text, 3, 2, '16GB', NOW(), NOW(), false),
(gen_random_uuid()::text, 4, 3, '2022', NOW(), NOW(), false),
(gen_random_uuid()::text, 4, 4, 'Diesel', NOW(), NOW(), false),
(gen_random_uuid()::text, 5, 3, '2021', NOW(), NOW(), false),
(gen_random_uuid()::text, 5, 4, 'Petrol', NOW(), NOW(), false),
(gen_random_uuid()::text, 6, 3, '2023', NOW(), NOW(), false),
(gen_random_uuid()::text, 6, 4, 'Petrol', NOW(), NOW(), false),
(gen_random_uuid()::text, 7, 3, '2021', NOW(), NOW(), false),
(gen_random_uuid()::text, 7, 4, 'Petrol', NOW(), NOW(), false),
(gen_random_uuid()::text, 8, 3, '2020', NOW(), NOW(), false),
(gen_random_uuid()::text, 8, 4, 'Petrol', NOW(), NOW(), false),
(gen_random_uuid()::text, 9, 5, 'Laptop', NOW(), NOW(), false),
(gen_random_uuid()::text, 10, 5, 'Laptop', NOW(), NOW(), false),
(gen_random_uuid()::text, 11, 5, 'Gaming Console', NOW(), NOW(), false),
(gen_random_uuid()::text, 12, 6, '2', NOW(), NOW(), false),
(gen_random_uuid()::text, 14, 6, '3', NOW(), NOW(), false);

-- DONE
