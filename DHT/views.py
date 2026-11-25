from django.shortcuts import render


def dashboard(request):
    return render(request, "DHT/dashboard.html")


def history(request):
    return render(request, "DHT/history.html")
