import sys
import os
import random
from datetime import datetime, timedelta
import uuid

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.dirname(os.path.abspath(__file__)))

import app.db.base
from app.db.session import SessionLocal
from app.modules.users.model import User
from app.modules.locations.model import City, State
from app.modules.categories.model import Category, CategoryAttribute
from app.modules.ads.model import Ad, AdImage, AdAttributeValue
from app.modules.chat.model import ChatRoom, Message
from app.modules.favorites.model import Favorite
from app.modules.reports.model import AdReport
from app.modules.reviews.model import Review
from app.modules.search_alerts.model import SearchAlert

PASSWORD_HASH = "$2b$12$v6cm4i1SzV9o9xuuV8.38.cyIwx4H3dYXoWwoMUKUjPs7vbdBhSKS"

def get_random_date(start_days_ago=30, end_days_ago=0):
    start_date = datetime.now() - timedelta(days=start_days_ago)
    end_date = datetime.now() - timedelta(days=end_days_ago)
    return start_date + (end_date - start_date) * random.random()

def seed_users(db):
    print("Seeding Users...")
    cities = db.query(City).all()
    if not cities:
        print("Please run seed.py first to create cities!")
        return []

    users = []
    
    # 1. Super Admin
    if not db.query(User).filter(User.email == "john@example.com").first():
        sa = User(
            name="John Doe",
            username="johndoe",
            email="john@example.com",
            password=PASSWORD_HASH,
            phone="1231231231",
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=John",
            city_id=random.choice(cities).id,
            is_active=True,
            is_verified=True,
            role_id=1,
            uuid="66515ede-23ad-4d60-9747-ababec03dc71"
        )
        db.add(sa)
        users.append(sa)

    # 2. System Admin
    if not db.query(User).filter(User.email == "alice@example.com").first():
        sa2 = User(
            name="Alice Smith",
            username="alicesmith",
            email="alice@example.com",
            password=PASSWORD_HASH,
            phone="1122331122",
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
            city_id=random.choice(cities).id,
            is_active=True,
            is_verified=True,
            role_id=2,
            uuid="735ff09e-eb3c-4828-8e87-5898b148ebe2"
        )
        db.add(sa2)
        users.append(sa2)

    # 3. Normal Test User
    if not db.query(User).filter(User.email == "user@example.com").first():
        u = User(
            name="Normal User",
            username="normaluser",
            email="user@example.com",
            password=PASSWORD_HASH,
            phone="9876543210",
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=User",
            city_id=random.choice(cities).id,
            is_active=True,
            is_verified=True,
            role_id=3,
            uuid=str(uuid.uuid4())
        )
        db.add(u)
        users.append(u)

    # 4. 15 Random Users
    first_names = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Neha", "Rohit", "Pooja", "Arjun", "Kavya", "Suresh", "Meera", "Karan", "Anjali", "Sanjay"]
    last_names = ["Sharma", "Patel", "Singh", "Kumar", "Gupta", "Deshmukh", "Reddy", "Verma", "Rao", "Das", "Joshi", "Bose", "Mehta", "Chawla", "Nair"]

    for i in range(15):
        fn = first_names[i]
        ln = last_names[i]
        email = f"{fn.lower()}.{ln.lower()}{i}@example.com"
        if not db.query(User).filter(User.email == email).first():
            ru = User(
                name=f"{fn} {ln}",
                username=f"{fn.lower()}{ln.lower()}{i}",
                email=email,
                password=PASSWORD_HASH,
                phone=f"99{random.randint(10000000, 99999999)}",
                avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={fn}{i}",
                city_id=random.choice(cities).id,
                is_active=True,
                is_verified=random.choice([True, True, False]),
                role_id=3,
                uuid=str(uuid.uuid4()),
                created_at=get_random_date(30, 5)
            )
            db.add(ru)
            users.append(ru)

    db.commit()
    print(f"Created {len(users)} new users.")
    return db.query(User).all()

def seed_ads(db, users):
    print("Seeding Ads...")
    categories = db.query(Category).all()
    cities = db.query(City).all()
    
    if not categories:
        print("No subcategories found. Run seed.py first.")
        return []

    ad_templates = {
        "mobile-phones": [
            {"title": "iPhone 13 Pro Max 256GB", "price": 65000, "condition": "like_new"},
            {"title": "Samsung S23 Ultra - 1 Year Old", "price": 85000, "condition": "used"},
            {"title": "OnePlus 11R 5G", "price": 32000, "condition": "like_new"},
            {"title": "Brand New iPhone 15 Sealed", "price": 75000, "condition": "new"},
            {"title": "Redmi Note 12 Pro", "price": 15000, "condition": "used"}
        ],
        "cars": [
            {"title": "Hyundai Creta 2021 SX Opt", "price": 1450000, "condition": "used"},
            {"title": "Maruti Swift VXI 2019", "price": 550000, "condition": "used"},
            {"title": "Honda City ZX CVT 2022", "price": 1250000, "condition": "like_new"},
            {"title": "Toyota Fortuner Diesel AT", "price": 3500000, "condition": "used"},
            {"title": "Mahindra Thar 4x4", "price": 1500000, "condition": "used"}
        ],
        "bikes": [
            {"title": "Royal Enfield Classic 350", "price": 150000, "condition": "used"},
            {"title": "KTM Duke 390 Mint Condition", "price": 220000, "condition": "like_new"},
            {"title": "Honda Activa 6G", "price": 65000, "condition": "used"},
            {"title": "TVS Apache RTR 160", "price": 85000, "condition": "used"}
        ],
        "laptops": [
            {"title": "MacBook Air M1 8GB 256GB", "price": 55000, "condition": "used"},
            {"title": "Dell XPS 13 i7 16GB RAM", "price": 85000, "condition": "used"},
            {"title": "HP Pavilion Gaming Laptop", "price": 45000, "condition": "used"}
        ]
    }

    ad_images = [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop"
    ]

    new_ads = []
    
    for cat in categories:
        templates = ad_templates.get(cat.slug, [{"title": f"Awesome {cat.name}", "price": random.randint(1000, 100000), "condition": "used"}])
        
        for tmpl in templates:
            user = random.choice(users)
            city = random.choice(cities)
            
            ad = Ad(
                title=tmpl["title"],
                description=f"Selling my {tmpl['title']} in {tmpl['condition']} condition. It works perfectly and has no issues. Contact me for more details.",
                price=tmpl["price"],
                price_negotiable=random.choice([True, False]),
                condition=tmpl["condition"],
                ad_type="sell",
                status="active",
                user_id=user.id,
                category_id=cat.id,
                city_id=city.id,
                locality=f"{city.name} Central",
                views_count=random.randint(5, 500),
                created_at=get_random_date(20, 1)
            )
            db.add(ad)
            db.commit()
            db.refresh(ad)
            new_ads.append(ad)

            # Add 2-3 images per ad
            for i in range(random.randint(1, 3)):
                img = AdImage(
                    ad_id=ad.id,
                    image_url=random.choice(ad_images),
                    display_order=i,
                    is_primary=(i == 0)
                )
                db.add(img)

            # Assign Dynamic Attributes
            attrs = db.query(CategoryAttribute).filter(CategoryAttribute.category_id == cat.id).all()
            for attr in attrs:
                val = "N/A"
                if attr.options:
                    val = random.choice(attr.options)
                elif attr.field_type == "number":
                    val = str(random.randint(10, 100))
                elif attr.field_type == "boolean":
                    val = random.choice(["True", "False"])
                
                ad_val = AdAttributeValue(
                    ad_id=ad.id,
                    attribute_id=attr.id,
                    value=val
                )
                db.add(ad_val)

    db.commit()
    print(f"Created {len(new_ads)} new ads with images and attributes.")
    return new_ads

def seed_interactions(db, users, ads):
    print("Seeding Favorites, Chats, Reviews, Reports, Alerts...")
    
    # 1. Favorites
    favorite_pairs = set()
    attempts = 0
    while len(favorite_pairs) < 30 and attempts < 100:
        u_id = random.choice(users).id
        a_id = random.choice(ads).id
        favorite_pairs.add((u_id, a_id))
        attempts += 1
        
    for u_id, a_id in favorite_pairs:
        fav = Favorite(
            user_id=u_id,
            ad_id=a_id
        )
        db.add(fav)
    
    # 2. Chat Rooms & Messages
    chat_pairs = set()
    attempts = 0
    while len(chat_pairs) < 15 and attempts < 100:
        ad = random.choice(ads)
        buyer = random.choice(users)
        if buyer.id != ad.user_id:
            chat_pairs.add((ad.id, buyer.id, ad.user_id))
        attempts += 1
        
    for a_id, b_id, s_id in chat_pairs:
        room = ChatRoom(
            ad_id=a_id,
            buyer_id=b_id,
            seller_id=s_id,
            created_at=get_random_date(10, 5)
        )
        db.add(room)
        db.commit()
        db.refresh(room)
        
        # 3 Messages per room
        for i in range(3):
            sender_id = b_id if i % 2 == 0 else s_id
            msg = Message(
                chat_room_id=room.id,
                sender_id=sender_id,
                content=f"Test message {i+1}",
                is_read=(i != 2),
                created_at=room.created_at + timedelta(hours=i)
            )
            db.add(msg)
            
    # 3. Reviews
    review_pairs = set()
    attempts = 0
    while len(review_pairs) < 15 and attempts < 100:
        ad = random.choice(ads)
        reviewer = random.choice(users)
        if reviewer.id != ad.user_id:
            review_pairs.add((ad.id, reviewer.id, ad.user_id))
        attempts += 1
            
    for a_id, r_id, u_id in review_pairs:
        rev = Review(
            ad_id=a_id,
            reviewer_id=r_id,
            reviewed_user_id=u_id,
            rating=random.randint(3, 5),
            comment="Great seller, smooth transaction!",
            created_at=get_random_date(5, 1)
        )
        db.add(rev)

    # 4. Reports
    for _ in range(5):
        ad = random.choice(ads)
        reporter = random.choice(users)
        rep = AdReport(
            ad_id=ad.id,
            reporter_id=reporter.id,
            reason=random.choice(["spam", "fraud", "offensive"]),
            description="This ad looks suspicious.",
            status="pending"
        )
        db.add(rep)

    # 5. Search Alerts
    categories = db.query(Category).all()
    for _ in range(10):
        alert = SearchAlert(
            user_id=random.choice(users).id,
            keyword=random.choice(["iphone", "honda", "laptop", "1bhk"]),
            category_id=random.choice(categories).id,
            max_price=random.randint(10000, 50000),
            is_active=True
        )
        db.add(alert)
        
    db.commit()
    print("Interactions seeded successfully.")

def run():
    print("Starting Dummy Data Seeding...")
    db = SessionLocal()
    try:
        users = seed_users(db)
        ads = seed_ads(db, users)
        seed_interactions(db, users, ads)
        print("✅ Seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error during seeding: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    run()
