from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "TimeTrack Pro"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = (
        "postgresql://timetrack_user:timetrack_password@localhost/timetrack"
    )

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS - Parse as comma-separated string from env
    ALLOWED_HOSTS: str = (
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://192.168.64.5:3000,http://192.168.64.1:3000"
    )

    # Trusted hosts for TrustedHostMiddleware
    TRUSTED_HOSTS: str = "localhost,127.0.0.1,192.168.64.5,192.168.64.1"

    # Location Settings
    DEFAULT_RADIUS_METERS: int = 100  # Default geofence radius

    # Google Maps API (for geocoding)
    GOOGLE_MAPS_API_KEY: Optional[str] = None

    @property
    def allowed_hosts_list(self) -> List[str]:
        """Convert ALLOWED_HOSTS string to list"""
        return [host.strip() for host in self.ALLOWED_HOSTS.split(",") if host.strip()]

    @property
    def trusted_hosts_list(self) -> List[str]:
        """Convert TRUSTED_HOSTS string to list"""
        return [host.strip() for host in self.TRUSTED_HOSTS.split(",") if host.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
