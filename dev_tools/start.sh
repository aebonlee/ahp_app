#!/usr/bin/env bash
python manage.py migrate
gunicorn ahp_backend.wsgi:application