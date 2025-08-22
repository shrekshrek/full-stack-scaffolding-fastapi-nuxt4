# 1. Base Image
FROM python:3.11-slim

# 2. Set Environment Variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Set Work Directory
WORKDIR /app

# 4. Install uv
RUN pip install --no-cache-dir uv

# 5. Configure uv environment variables
ENV UV_SYSTEM_PYTHON=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_CACHE_DIR=/tmp/uv_cache \
    UV_LINK_MODE=copy

# 6. Copy dependency files and install dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-cache

# 7. Copy application code
COPY ./src ./src

# 8. Expose port
EXPOSE 8000

# 9. Command to run the application
# Gunicorn with Uvicorn workers for production
# The number of workers is typically (2 * CPU_CORES) + 1
CMD ["uv", "run", "--no-sync", "gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "src.main:app"] 