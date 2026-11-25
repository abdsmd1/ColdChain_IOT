# Cold Chain IoT — ESP8266 + DHT11 + Django

Supervision de la chaîne du froid : un ESP8266 lit un capteur DHT11 et envoie les mesures
(JSON, HTTP POST) à une API Django REST. Un dashboard web affiche les mesures en temps réel
et l'historique des incidents. Au-delà de 25 °C, une alerte est envoyée (Gmail / Telegram).

## Routes
- `/` : dashboard temps réel
- `/history/` : archives des incidents
- `/api/get` : liste des mesures (GET)
- `/api/post` : ajout d'une mesure (POST, ex. `{"temp": 24.5, "hum": 48}`) → 201 Created
- `/admin/` : administration Django

## Installation
```
pip install -r requirements.txt
cp .env.example .env      # puis remplir les valeurs
python manage.py migrate
python manage.py runserver
```
