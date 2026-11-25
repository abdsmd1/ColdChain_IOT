from django.conf import settings
from django.core.mail import send_mail
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Dht11
from .serializers import DHT11serialize

SEUIL_ALERTE = 25  # °C : au-dessus, on envoie une alerte (Gmail + Telegram)


@api_view(['GET'])
def Dlist(request):
    all_data = Dht11.objects.all()
    data = DHT11serialize(all_data, many=True).data
    return Response({'data': data})


class Dhtviews(generics.CreateAPIView):
    queryset = Dht11.objects.all()
    serializer_class = DHT11serialize

    def perform_create(self, serializer):
        data = serializer.save()
        if data.temp is not None and data.temp > SEUIL_ALERTE:
            message = f"Alerte ! Temperature = {data.temp} °C"

            # Email (seulement si Gmail est configure dans le .env)
            if settings.EMAIL_HOST_USER and settings.ALERT_EMAIL_TO:
                try:
                    send_mail("Alerte Temperature", message, settings.EMAIL_HOST_USER,
                              settings.ALERT_EMAIL_TO, fail_silently=False)
                    print("[ALERTE] Email envoye")
                except Exception as e:
                    print("[ALERTE] Echec email :", e)

            # Telegram (seulement si le bot est configure dans le .env)
            if settings.TELEGRAM_TOKEN and settings.TELEGRAM_CHAT_ID:
                try:
                    import telebot
                    telebot.TeleBot(settings.TELEGRAM_TOKEN).send_message(settings.TELEGRAM_CHAT_ID, message)
                    print("[ALERTE] Telegram envoye")
                except Exception as e:
                    print("[ALERTE] Echec Telegram :", e)
