from typing import List, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_ENV: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:5173,https://samvidhan-law.pages.dev,https://maysamali3011.github.io"

    # Supabase Configuration
    # Supports both anon/publishable and service_role/secret naming conventions
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_PUBLISHABLE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_SECRET_KEY: str = ""

    FRONTEND_URL: str = "http://localhost:5173"

    COOKIE_SAMESITE: str = "lax"
    COOKIE_SECURE: bool = False
    CSRF_STRICT: bool = True
    APP_TIMEZONE: str = "Asia/Kolkata"

    # AI Chat Limits
    GUEST_DAILY_AI_LIMIT: int = 3
    FREE_DAILY_AI_LIMIT: int = 5
    AI_PROVIDER_ORDER: str = "gemini,groq,mistral,openrouter"
    AI_REQUEST_TIMEOUT_SECONDS: float = 25.0
    AI_DEFAULT_ANSWER: str = (
        "Our AI assistant is very busy right now. Please try again a little later, "
        "or browse the Library and Constitution sections in the meantime."
    )

    # Free AI Providers
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-flash-lite-latest"
    GEMINI_RPM: Optional[int] = None
    GEMINI_RPD: Optional[int] = None

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "qwen/qwen3.8-27b"
    GROQ_RPM: Optional[int] = None
    GROQ_RPD: Optional[int] = None

    MISTRAL_API_KEY: str = ""
    MISTRAL_MODEL: str = "mistral-small-latest"
    MISTRAL_RPM: Optional[int] = None
    MISTRAL_RPD: Optional[int] = None

    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "inclusionai/ling-3.2-flash:free"
    OPENROUTER_RPM: Optional[int] = None
    OPENROUTER_RPD: Optional[int] = None

    @field_validator("OPENROUTER_MODEL")
    @classmethod
    def validate_openrouter_model(cls, v: str) -> str:
        if v and not v.endswith(":free"):
            raise ValueError("OPENROUTER_MODEL must end with ':free' to enforce zero-cost usage.")
        return v

    @property
    def anon_key(self) -> str:
        return self.SUPABASE_ANON_KEY or self.SUPABASE_PUBLISHABLE_KEY

    @property
    def service_role_key(self) -> str:
        return self.SUPABASE_SERVICE_ROLE_KEY or self.SUPABASE_SECRET_KEY

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def effective_cookie_secure(self) -> bool:
        if self.COOKIE_SAMESITE.lower() == "none" or self.APP_ENV.lower() == "production":
            return True
        return self.COOKIE_SECURE


settings = Settings()
