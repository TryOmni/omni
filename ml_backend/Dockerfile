# Dockerfile for ML Backend
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project files
COPY . /app/

# Expose port 5500
EXPOSE 5500

# Run the application with Gunicorn (assuming Flask app named "app")
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5500"]
