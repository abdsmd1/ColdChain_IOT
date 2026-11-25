from django.urls import path
from . import views, api

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('history/', views.history, name='history'),
    path('api/get', api.Dlist, name='api-get'),
    path('api/post', api.Dhtviews.as_view(), name='api-post'),
]
