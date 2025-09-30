@echo off
echo Starting AHP Django Backend...
echo.

cd django_backend

echo Installing requirements...
pip install -r requirements.txt

echo.
echo Running migrations...
python manage.py migrate

echo.
echo Starting development server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver 0.0.0.0:8000