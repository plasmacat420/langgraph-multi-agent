FROM python:3.11-slim
WORKDIR /app

# Copy backend source into the image
COPY backend/pyproject.toml .
COPY backend/app/ ./app/

RUN pip install --no-cache-dir .

RUN useradd -m appuser && mkdir -p outputs && chown -R appuser /app
USER appuser

EXPOSE 8000
# Use $PORT so Render can inject its dynamic port; fall back to 8000 locally
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
