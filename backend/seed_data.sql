-- Clear existing data completely
TRUNCATE TABLE ad_attribute_values, ad_images, ads, category_attributes, categories, cities, states, users RESTART IDENTITY CASCADE;

-- ==========================================
-- PASSWORD FOR BOTH USERS IS: 123456
-- ==========================================

-- 1. Create Users
INSERT INTO users (uuid, name, username, email, phone, password, role_id, is_verified, is_active, created_at, modified_at, is_delete) VALUES
(gen_random_uuid()::text, 'John Doe', 'johndoe', 'john@example.com', '9876543210', '$2b$12$v6cm4i1SzV9o9xuuV8.38.cyIwx4H3dYXoWwoMUKUjPs7vbdBhSKS', 2, true, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 'Alice Smith', 'alicesmith', 'alice@example.com', '9876543211', '$2b$12$v6cm4i1SzV9o9xuuV8.38.cyIwx4H3dYXoWwoMUKUjPs7vbdBhSKS', 2, true, true, NOW(), NOW(), false);

-- 2. Create States & Cities
INSERT INTO states (id, uuid, name, slug, created_at, modified_at, is_delete) VALUES
(1, gen_random_uuid()::text, 'Maharashtra', 'maharashtra', NOW(), NOW(), false),
(2, gen_random_uuid()::text, 'Delhi', 'delhi', NOW(), NOW(), false),
(3, gen_random_uuid()::text, 'Karnataka', 'karnataka', NOW(), NOW(), false);

-- Adjusting sequences since we manually inserted IDs
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

-- 5. Create Ads
INSERT INTO ads (id, uuid, title, description, price, price_negotiable, condition, ad_type, status, user_id, category_id, city_id, locality, views_count, created_at, modified_at, is_delete, is_premium) VALUES
(1, gen_random_uuid()::text, 'iPhone 13 Pro 256GB - Pristine Condition', 'Selling my iPhone 13 Pro. Works perfectly, battery health 92%. Comes with box and charger.', 55000.00, true, 'used', 'sell', 'active', (SELECT id FROM users WHERE username='johndoe'), 1, 1, 'Andheri West', 124, NOW() - interval '2 days', NOW(), false, true),
(2, gen_random_uuid()::text, 'Samsung Galaxy S23 Ultra', 'Brand new sealed box. Got it as a gift but I use Apple.', 95000.00, false, 'new', 'sell', 'active', (SELECT id FROM users WHERE username='alicesmith'), 1, 3, 'Connaught Place', 45, NOW() - interval '5 hours', NOW(), false, false),
(3, gen_random_uuid()::text, '2019 Hyundai Creta SX Opt', 'First owner, non-accidental, fully serviced at authorized center.', 1150000.00, true, 'used', 'sell', 'active', (SELECT id FROM users WHERE username='johndoe'), 2, 4, 'Koramangala', 320, NOW() - interval '5 days', NOW(), false, true),
(4, gen_random_uuid()::text, 'Royal Enfield Classic 350', '2021 model, well maintained. Urgent sell as I am moving abroad.', 160000.00, true, 'used', 'sell', 'active', (SELECT id FROM users WHERE username='alicesmith'), 2, 2, 'Kothrud', 89, NOW() - interval '1 day', NOW(), false, false),
(5, gen_random_uuid()::text, 'MacBook Pro M2 16-inch', 'Used for just 3 months. Perfect for video editing and coding.', 180000.00, false, 'like_new', 'sell', 'active', (SELECT id FROM users WHERE username='johndoe'), 3, 1, 'Bandra', 210, NOW() - interval '3 days', NOW(), false, true),
(6, gen_random_uuid()::text, 'Sony PlayStation 5 Console', 'PS5 Disc edition with 2 controllers and 3 games.', 42000.00, true, 'used', 'sell', 'active', (SELECT id FROM users WHERE username='alicesmith'), 3, 3, 'Hauz Khas', 512, NOW() - interval '12 hours', NOW(), false, false),
(7, gen_random_uuid()::text, 'Spacious 2BHK Apartment for Rent', 'Semi-furnished 2BHK flat with modular kitchen and AC in both bedrooms.', 45000.00, false, NULL, 'rent', 'active', (SELECT id FROM users WHERE username='johndoe'), 4, 4, 'Indiranagar', 75, NOW() - interval '4 days', NOW(), false, true),
(8, gen_random_uuid()::text, 'Commercial Office Space 1500 sqft', 'Prime location office space available immediately. Fully furnished.', 120000.00, true, NULL, 'rent', 'active', (SELECT id FROM users WHERE username='alicesmith'), 4, 1, 'Lower Parel', 22, NOW() - interval '6 hours', NOW(), false, false),
(9, gen_random_uuid()::text, 'OnePlus 11R 5G', 'Box opened but unused. Bill and warranty available.', 38000.00, true, 'like_new', 'sell', 'active', (SELECT id FROM users WHERE username='johndoe'), 1, 2, 'Viman Nagar', 67, NOW() - interval '1 day', NOW(), false, false),
(10, gen_random_uuid()::text, 'Honda City ZX CVT', '2022 Top model, Sunroof, Leather seats, barely driven.', 1450000.00, true, 'used', 'sell', 'active', (SELECT id FROM users WHERE username='alicesmith'), 2, 3, 'Vasant Kunj', 143, NOW() - interval '2 days', NOW(), false, true);

SELECT setval('ads_id_seq', (SELECT MAX(id) FROM ads));

-- 6. Create Ad Images
INSERT INTO ad_images (uuid, ad_id, image_url, display_order, is_primary, created_at, modified_at, is_delete) VALUES
(gen_random_uuid()::text, 1, 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=800', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 2, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 3, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 4, 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 5, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 6, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 7, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 8, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 9, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800', 0, true, NOW(), NOW(), false),
(gen_random_uuid()::text, 10, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800', 0, true, NOW(), NOW(), false);

-- 7. Create Ad Attribute Values
INSERT INTO ad_attribute_values (uuid, ad_id, attribute_id, value, created_at, modified_at, is_delete) VALUES
(gen_random_uuid()::text, 1, 1, 'Apple', NOW(), NOW(), false),
(gen_random_uuid()::text, 1, 2, '8GB', NOW(), NOW(), false),
(gen_random_uuid()::text, 2, 1, 'Samsung', NOW(), NOW(), false),
(gen_random_uuid()::text, 2, 2, '12GB', NOW(), NOW(), false),
(gen_random_uuid()::text, 3, 3, '2019', NOW(), NOW(), false),
(gen_random_uuid()::text, 3, 4, 'Petrol', NOW(), NOW(), false),
(gen_random_uuid()::text, 4, 3, '2021', NOW(), NOW(), false),
(gen_random_uuid()::text, 4, 4, 'Petrol', NOW(), NOW(), false),
(gen_random_uuid()::text, 5, 5, 'Laptop', NOW(), NOW(), false),
(gen_random_uuid()::text, 6, 5, 'Gaming Console', NOW(), NOW(), false),
(gen_random_uuid()::text, 7, 6, '2', NOW(), NOW(), false),
(gen_random_uuid()::text, 9, 1, 'OnePlus', NOW(), NOW(), false),
(gen_random_uuid()::text, 9, 2, '8GB', NOW(), NOW(), false),
(gen_random_uuid()::text, 10, 3, '2022', NOW(), NOW(), false),
(gen_random_uuid()::text, 10, 4, 'Petrol', NOW(), NOW(), false);

-- DONE
