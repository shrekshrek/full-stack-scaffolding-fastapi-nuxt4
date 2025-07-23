# 1. Base Image
FROM python:3.11-slim

# 2. Set Environment Variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Set Work Directory
WORKDIR /app

# 4. Configure PyPI mirror for China and install PDM
RUN pip install --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple pdm

# 5. Configure PDM to use PyPI mirror
RUN pdm config pypi.url https://pypi.tuna.tsinghua.edu.cn/simple

# 6. Copy dependency files and install production dependencies
COPY pyproject.toml pdm.lock ./
RUN PIP_DEFAULT_TIMEOUT=1200 pdm install --prod --no-editable

# 7. Copy application code
COPY ./src ./src

# 8. Expose port
EXPOSE 8000

# 9. Command to run the application
# Gunicorn with Uvicorn workers for production
# The number of workers is typically (2 * CPU_CORES) + 1
CMD ["pdm", "run", "gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "src.main:app"] 