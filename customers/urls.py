from django.urls import path
from .views import CustomerListView, CustomerDetailView, CustomerAddressesView

urlpatterns = [
    path('customers/', CustomerListView.as_view()),
    path('customers/<int:pk>/', CustomerDetailView.as_view()),
    path('customers/<int:pk>/addresses/', CustomerAddressesView.as_view()),
]
