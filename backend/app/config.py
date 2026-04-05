from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    MAX_ITERATIONS: int = 10
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"


settings = Settings()
