FROM python:3.11-slim AS builder
WORKDIR /app

# Instalar dependencias del sistema necesarias para paquetes Python compilados
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Copiar requirements y preparar entorno
COPY requirements.txt requirements-extras.txt ./
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt
RUN if [ -f requirements-extras.txt ]; then pip install -r requirements-extras.txt; fi

# App image (slim)
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Crear usuario sin privilegios
RUN useradd -m appuser || true
USER appuser

# Copiar código
COPY --chown=appuser:appuser . /app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependencias del sistema mínimas
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar y instalar dependencias
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY . /app

# Establecer variable para que SQLAlchemy use una DB sqlite dentro del contenedor
ENV SQLALCHEMY_DATABASE_URL=sqlite:///./test.db

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
