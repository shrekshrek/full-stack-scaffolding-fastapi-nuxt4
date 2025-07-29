# 1. Base Image
FROM python:3.11-slim

# 2. Set Environment Variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Set Work Directory
WORKDIR /app

# 4. Install PDM (using default PyPI)
RUN pip install --no-cache-dir pdm

# 5. Copy dependency files and install production dependencies
COPY pyproject.toml pdm.lock ./
RUN PIP_DEFAULT_TIMEOUT=1200 pdm install --prod --no-editable

# 6. Copy application code
COPY ./src ./src

# 7. Expose port
EXPOSE 8000

# 8. Command to run the application
# Gunicorn with Uvicorn workers for production
# The number of workers is typically (2 * CPU_CORES) + 1
CMD ["pdm", "run", "gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "src.main:app"] 