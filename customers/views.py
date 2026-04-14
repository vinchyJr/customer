from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Customer
from .serializers import CustomerSerializer, AddressSerializer


class CustomerListView(APIView):
    def get(self, request):
        customers = Customer.objects.all()
        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data)


class CustomerDetailView(APIView):
    def get(self, request, pk):
        try:
            customer = Customer.objects.get(pk=pk)
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CustomerSerializer(customer)
        return Response(serializer.data)


class CustomerAddressesView(APIView):
    def get(self, request, pk):
        try:
            customer = Customer.objects.get(pk=pk)
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = AddressSerializer(customer.addresses.all(), many=True)
        return Response(serializer.data)
