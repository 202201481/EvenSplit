from django.contrib.auth.models import User
from django.db import models
from rest_framework import generics,filters,permissions
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer, FriendSerializer,BillSerializer,SettlementSerializer,GroupSerializer
from .models import Friend,Bill,BillSplit,Settlement,Group
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum

class RegisterView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserSearchView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email']

class FriendListCreateView(generics.ListCreateAPIView):
    serializer_class = FriendSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Friend.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BillListCreateView(generics.ListCreateAPIView):
    serializer_class = BillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bill.objects.filter(participants=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        bill = serializer.save(created_by=self.request.user)
        if self.request.user not in bill.participants.all():
            bill.participants.add(self.request.user)
        splits_data = self.request.data.get('splits')
        if bill.split_type == 'equal' or not splits_data:
            participants = bill.participants.all()
            split_amount = bill.amount / participants.count()
            for user in participants:
                BillSplit.objects.create(bill=bill, user=user, amount=split_amount)
        elif bill.split_type == 'amount':
            total = sum(float(split['amount']) for split in splits_data)
            if round(total, 2) != float(bill.amount):
                raise ValidationError({'splits': 'Sum of split amounts must equal bill amount.'})
            for split in splits_data:
                BillSplit.objects.create(
                    bill=bill,
                    user_id=split['user_id'],
                    amount=split['amount']
                )
        elif bill.split_type == 'percentage':
            total = sum(float(split['percentage']) for split in splits_data)
            if round(total, 2) != 100.0:
                raise ValidationError({'splits': 'Sum of split percentages must be 100.'})
            for split in splits_data:
                BillSplit.objects.create(
                    bill=bill,
                    user_id=split['user_id'],
                    amount=bill.amount * (float(split['percentage']) / 100)
                )


class SettlementListCreateView(generics.ListCreateAPIView):
    serializer_class = SettlementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Settlement.objects.filter(
            models.Q(payer=self.request.user) | models.Q(payee=self.request.user)
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(payer=self.request.user)

class BalancesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        balances = {}

        # Calculate what the user owes to others (from BillSplits)
        splits = BillSplit.objects.filter(user=user)
        for split in splits:
            if split.bill.created_by != user:
                friend = split.bill.created_by
                balances.setdefault(friend.username, 0)
                balances[friend.username] -= float(split.amount)

        # Calculate what others owe to the user (from BillSplits)
        bills = Bill.objects.filter(created_by=user)
        for bill in bills:
            for split in bill.splits.all():
                if split.user != user:
                    balances.setdefault(split.user.username, 0)
                    balances[split.user.username] += float(split.amount)

        # Subtract settlements
        settlements_paid = Settlement.objects.filter(payer=user)
        for s in settlements_paid:
            balances.setdefault(s.payee.username, 0)
            balances[s.payee.username] += float(s.amount)

        settlements_received = Settlement.objects.filter(payee=user)
        for s in settlements_received:
            balances.setdefault(s.payer.username, 0)
            balances[s.payer.username] -= float(s.amount)

        return Response(balances)
    
class GroupListCreateView(generics.ListCreateAPIView):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Group.objects.filter(members=self.request.user)

    def perform_create(self, serializer):
        group = serializer.save(created_by=self.request.user)
        group.members.add(self.request.user)

class AnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        # Total spent per category
        data = (
            Bill.objects.filter(participants=user)
            .values('category')
            .annotate(total=models.Sum('amount'))
            .order_by('-total')
        )
        # Total spent per month
        monthly = (
            Bill.objects.filter(participants=user)
            .extra({'month': "strftime('%%Y-%%m', created_at)"})
            .values('month')
            .annotate(total=models.Sum('amount'))
            .order_by('month')
        )
        return Response({'by_category': list(data), 'by_month': list(monthly)})
    
class InsightsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        # Example: Find top category
        data = (
            Bill.objects.filter(participants=user)
            .values('category')
            .annotate(total=models.Sum('amount'))
            .order_by('-total')
        )
        if data:
            top = data[0]
            suggestion = f"You spend most on {top['category']}. Consider reducing expenses in this category."
        else:
            suggestion = "No spending data available yet."
        return Response({'insight': suggestion})