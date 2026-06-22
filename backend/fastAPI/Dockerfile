FROM python:3.12-slim

WORKDIR /app

# Install ffmpeg for audio conversion and system libs for WeasyPrint PDF rendering
RUN apt-get update && apt-get install -y \
    ffmpeg git \
    libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf-2.0-0 \
    libffi-dev libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# Prevent pip installation timeouts in slow network environments
ENV PIP_DEFAULT_TIMEOUT=1000
ENV PIP_RETRIES=10

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Start FastAPI with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]