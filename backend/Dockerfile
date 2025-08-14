FROM python:3.12-slim

# Needed for faiss-cpu on Debian slim
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Install Python deps first (layer caching)
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY backend/ ./

# Quiet HF tokenizers & friends
ENV PYTHONUNBUFFERED=1 \
    TOKENIZERS_PARALLELISM=false

# Entrypoint
COPY backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
