#!/usr/bin/env python3
"""
Database initialization script for TimeTrack Pro
Creates sample users, locations, and other data for testing
"""

from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models import Base
from app.models.location import Location
from app.models.user import User, UserRole


def init_db():
    """Initialize database with sample data"""
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.email == "admin@timetrack.com").first()
        if not admin_user:
            # Create admin user
            admin_user = User(
                email="admin@timetrack.com",
                username="admin",
                full_name="System Administrator",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True,
            )
            db.add(admin_user)
            print("✅ Created admin user: admin@timetrack.com / admin123")

        # Check if manager user already exists
        manager_user = (
            db.query(User).filter(User.email == "manager@timetrack.com").first()
        )
        if not manager_user:
            # Create manager user
            manager_user = User(
                email="manager@timetrack.com",
                username="manager",
                full_name="John Manager",
                hashed_password=get_password_hash("manager123"),
                role=UserRole.MANAGER,
                is_active=True,
            )
            db.add(manager_user)
            print("✅ Created manager user: manager@timetrack.com / manager123")

        # Check if employee user already exists
        employee_user = (
            db.query(User).filter(User.email == "employee@timetrack.com").first()
        )
        if not employee_user:
            # Create employee user
            employee_user = User(
                email="employee@timetrack.com",
                username="employee",
                full_name="Jane Employee",
                hashed_password=get_password_hash("employee123"),
                role=UserRole.EMPLOYEE,
                is_active=True,
            )
            db.add(employee_user)
            print("✅ Created employee user: employee@timetrack.com / employee123")

        # Check if sample locations already exist
        main_office = db.query(Location).filter(Location.name == "Main Office").first()
        if not main_office:
            # Create main office location
            main_office = Location(
                name="Main Office",
                address="123 Business St, Downtown, City",
                latitude=40.7128,
                longitude=-74.0060,
                radius_meters=100,
                description="Main office building",
                is_active=True,
            )
            db.add(main_office)
            print("✅ Created Main Office location")

        warehouse = db.query(Location).filter(Location.name == "Warehouse").first()
        if not warehouse:
            # Create warehouse location
            warehouse = Location(
                name="Warehouse",
                address="456 Industrial Ave, Industrial District, City",
                latitude=40.7589,
                longitude=-73.9851,
                radius_meters=150,
                description="Main warehouse facility",
                is_active=True,
            )
            db.add(warehouse)
            print("✅ Created Warehouse location")

        # Commit all changes
        db.commit()
        print("✅ Database initialized successfully!")

    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("🚀 Initializing TimeTrack Pro database...")
    init_db()
    print("✨ Done!")
