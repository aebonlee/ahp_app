#!/usr/bin/env bash
# Dead simple build script that WORKS
pip install -r requirements.txt
python manage.py collectstatic --noinput --clear
python manage.py migrate --noinput