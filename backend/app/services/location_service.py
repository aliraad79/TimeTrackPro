from geopy.distance import geodesic
from sqlalchemy.orm import Session
from app.models.location import Location
from app.core.config import settings

class LocationService:
    @staticmethod
    def is_within_geofence(
        user_lat: float, 
        user_lng: float, 
        location: Location
    ) -> bool:
        """
        Check if user coordinates are within the location's geofence
        """
        location_coords = (location.latitude, location.longitude)
        user_coords = (user_lat, user_lng)
        
        distance = geodesic(location_coords, user_coords).meters
        return distance <= location.radius_meters
    
    @staticmethod
    def get_distance_to_location(
        user_lat: float, 
        user_lng: float, 
        location: Location
    ) -> float:
        """
        Get distance in meters from user to location
        """
        location_coords = (location.latitude, location.longitude)
        user_coords = (user_lat, user_lng)
        
        return geodesic(location_coords, user_coords).meters
    
    @staticmethod
    def find_nearest_location(
        db: Session, 
        user_lat: float, 
        user_lng: float
    ) -> Location:
        """
        Find the nearest active location to the user
        """
        locations = db.query(Location).filter(Location.is_active == True).all()
        
        if not locations:
            return None
        
        nearest_location = None
        min_distance = float('inf')
        
        for location in locations:
            distance = LocationService.get_distance_to_location(
                user_lat, user_lng, location
            )
            if distance < min_distance:
                min_distance = distance
                nearest_location = location
        
        return nearest_location
    
    @staticmethod
    def validate_location_access(
        db: Session, 
        location_id: int, 
        user_lat: float, 
        user_lng: float
    ) -> tuple[bool, str]:
        """
        Validate if user can access a specific location
        Returns (is_valid, error_message)
        """
        location = db.query(Location).filter(Location.id == location_id).first()
        
        if not location:
            return False, "Location not found"
        
        if not location.is_active:
            return False, "Location is not active"
        
        if not LocationService.is_within_geofence(user_lat, user_lng, location):
            print(user_lat, user_lng, location)
            distance = LocationService.get_distance_to_location(user_lat, user_lng, location)
            return False, f"You are {distance:.0f}m away from the work area"
        
        return True, ""
