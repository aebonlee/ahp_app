from django.contrib import admin
from .models import Project, Criteria, Alternative, Comparison

admin.site.register(Project)
admin.site.register(Criteria)
admin.site.register(Alternative)
admin.site.register(Comparison)