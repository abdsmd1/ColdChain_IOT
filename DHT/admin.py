from django.contrib import admin
from .models import Dht11


@admin.register(Dht11)
class Dht11Admin(admin.ModelAdmin):
    list_display = ("id", "temp", "hum", "dt")
    ordering = ("-dt",)
