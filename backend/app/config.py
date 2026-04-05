from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    MAX_ITERATIONS: int = 10
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "https://plasmacat420.github.io",
    ]

    class Config:
        env_file = ".env"


settings = Settings()
