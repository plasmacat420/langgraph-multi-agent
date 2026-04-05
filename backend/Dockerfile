FROM python:3.11-slim
WORKDIR /app

# Copy source and metadata together so pip can build the wheel
COPY pyproject.toml .
COPY app/ ./app/

RUN pip install --no-cache-dir .

# Create non-root user and outputs directory
RUN useradd -m appuser && mkdir -p outputs && chown -R appuser /app
USER appuser

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
