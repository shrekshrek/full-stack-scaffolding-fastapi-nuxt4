# 1. Base Image
FROM python:3.11-slim

# 2. Set Environment Variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Set Work Directory
WORKDIR /app

# 4. Install Poetry
RUN pip install --no-cache-dir poetry

# 5. Configure Poetry and install dependencies
# Note: poetry.lock should be committed to your repository
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_CACHE_DIR=/tmp/poetry_cache

COPY pyproject.toml poetry.lock* ./
RUN poetry install --without dev --no-root && rm -rf $POETRY_CACHE_DIR

# 6. Copy application code
COPY ./src ./src

# 7. Expose port
EXPOSE 8000

# 8. Command to run the application
# Gunicorn with Uvicorn workers for production
# The number of workers is typically (2 * CPU_CORES) + 1
CMD ["poetry", "run", "gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "src.main:app"] 