from django.contrib.auth.models import User
from django.db import models
from rest_framework import generics,filters,permissions
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer, FriendSerializer, FriendCreateSerializer, BillSerializer,SettlementSerializer,GroupSerializer
from .models import Friend,Bill,BillSplit,Settlement,Group
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
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
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FriendCreateSerializer
        return FriendSerializer

    def get_queryset(self):
        # Get all friendships where user is involved
        from django.db.models import Q
        friendships = Friend.objects.filter(
            Q(user=self.request.user) | Q(friend=self.request.user)
        )
        
        # Filter to avoid showing the same person twice
        seen_friends = set()
        unique_friendships = []
        
        for friendship in friendships:
            # Determine the "other" user (not the current user)
            if friendship.user == self.request.user:
                other_user = friendship.friend
            else:
                other_user = friendship.user
            
            # Only include if we haven't seen this friend before
            if other_user.id not in seen_friends:
                seen_friends.add(other_user.id)
                unique_friendships.append(friendship)
        
        return unique_friendships

    def perform_create(self, serializer):
        friend = serializer.validated_data['friend']
        # Create the friendship from current user to friend
        friendship1, created1 = Friend.objects.get_or_create(
            user=self.request.user, 
            friend=friend
        )
        # Create the reverse friendship from friend to current user
        friendship2, created2 = Friend.objects.get_or_create(
            user=friend, 
            friend=self.request.user
        )

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
        else:
            # For both 'amount' and 'percentage', frontend sends amount
            total_split_amount = sum(float(split['amount']) for split in splits_data)
            if round(total_split_amount, 2) != float(bill.amount):
                raise ValidationError({'splits': 'Sum of split amounts must equal bill amount.'})
            
            for split in splits_data:
                BillSplit.objects.create(
                    bill=bill,
                    user_id=split['user_id'],
                    amount=split['amount']
                )


class SettlementListCreateView(generics.ListCreateAPIView):
    serializer_class = SettlementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Settlement.objects.filter(
            models.Q(payer=self.request.user) | models.Q(payee=self.request.user)
        ).order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        print(f"Settlement creation request data: {request.data}")  # Debug log
        try:
            response = super().create(request, *args, **kwargs)
            print(f"Settlement created successfully")  # Debug log
            return response
        except Exception as e:
            print(f"Settlement creation error: {str(e)}")  # Debug log
            return Response({'error': str(e)}, status=400)
    
    def perform_create(self, serializer):
        # The payer is always the current user
        settlement = serializer.save(payer=self.request.user)
        print(f"Created settlement: {settlement.payer.username} paid {settlement.payee.username} ${settlement.amount}")  # Debug log

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

        # Apply settlements to balance calculations
        # When user pays someone, it reduces what they owe (makes negative balance less negative)
        settlements_paid = Settlement.objects.filter(payer=user)
        for s in settlements_paid:
            balances.setdefault(s.payee.username, 0)
            balances[s.payee.username] += float(s.amount)  # Reduces debt (less negative)

        # When user receives payment, it reduces what others owe them (makes positive balance less positive)
        settlements_received = Settlement.objects.filter(payee=user)
        for s in settlements_received:
            balances.setdefault(s.payer.username, 0)
            balances[s.payer.username] -= float(s.amount)  # Reduces what they owe to user

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
        
        # Get bills where user participated (not just created)
        user_bills = Bill.objects.filter(participants=user)
        
        # Total spent per category
        category_data = (
            user_bills
            .values('category')
            .annotate(
                total=models.Sum('amount'),
                count=models.Count('id'),
                avg=models.Avg('amount')
            )
            .order_by('-total')
        )
        
        # Total spent per month with more details
        monthly_data = (
            user_bills
            .extra({'month': "strftime('%%Y-%%m', created_at)"})
            .values('month')
            .annotate(
                total=models.Sum('amount'),
                count=models.Count('id'),
                avg=models.Avg('amount')
            )
            .order_by('month')
        )
        
        # Calculate additional stats
        total_bills = user_bills.count()
        total_amount = user_bills.aggregate(total=models.Sum('amount'))['total'] or 0
        avg_bill_amount = user_bills.aggregate(avg=models.Avg('amount'))['avg'] or 0
        
        # Most expensive bill
        most_expensive = user_bills.order_by('-amount').first()
        
        # Recent trends (last 30 days vs previous 30 days)
        from datetime import datetime, timedelta
        now = datetime.now()
        last_30_days = now - timedelta(days=30)
        prev_30_days = now - timedelta(days=60)
        
        recent_spending = user_bills.filter(created_at__gte=last_30_days).aggregate(
            total=models.Sum('amount'), count=models.Count('id')
        )
        previous_spending = user_bills.filter(
            created_at__gte=prev_30_days, created_at__lt=last_30_days
        ).aggregate(
            total=models.Sum('amount'), count=models.Count('id')
        )
        
        return Response({
            'by_category': list(category_data),
            'by_month': list(monthly_data),
            'summary': {
                'total_bills': total_bills,
                'total_amount': float(total_amount),
                'avg_bill_amount': float(avg_bill_amount),
                'most_expensive_bill': {
                    'amount': float(most_expensive.amount) if most_expensive else 0,
                    'description': most_expensive.desc if most_expensive else '',
                    'category': most_expensive.category if most_expensive else ''
                },
                'recent_trend': {
                    'last_30_days': {
                        'total': float(recent_spending['total'] or 0),
                        'count': recent_spending['count']
                    },
                    'previous_30_days': {
                        'total': float(previous_spending['total'] or 0),
                        'count': previous_spending['count']
                    }
                }
            }
        })
    
class InsightsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        user_bills = Bill.objects.filter(participants=user)
        
        insights = []
        
        if not user_bills.exists():
            insights.append({
                'type': 'welcome',
                'title': '👋 Welcome to EvenSplit!',
                'message': 'Start by creating your first bill to track expenses with friends.',
                'priority': 'high'
            })
            return Response({'insights': insights})
        
        # Category analysis
        category_data = (
            user_bills
            .values('category')
            .annotate(
                total=models.Sum('amount'),
                count=models.Count('id'),
                avg=models.Avg('amount')
            )
            .order_by('-total')
        )
        
        if category_data:
            top_category = category_data[0]
            total_spent = sum(item['total'] for item in category_data)
            percentage = (top_category['total'] / total_spent) * 100 if total_spent > 0 else 0
            
            if percentage > 50:
                insights.append({
                    'type': 'spending_pattern',
                    'title': f'🎯 High {top_category["category"].title()} Spending',
                    'message': f'You spend {percentage:.1f}% of your money on {top_category["category"]}. Consider balancing your expenses across categories.',
                    'priority': 'medium'
                })
        
        # Recent spending trends
        from datetime import datetime, timedelta
        now = datetime.now()
        last_30_days = now - timedelta(days=30)
        prev_30_days = now - timedelta(days=60)
        
        recent_spending = user_bills.filter(created_at__gte=last_30_days).aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
        previous_spending = user_bills.filter(
            created_at__gte=prev_30_days, created_at__lt=last_30_days
        ).aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
        if previous_spending > 0:
            change_percentage = ((recent_spending - previous_spending) / previous_spending) * 100
            if change_percentage > 20:
                insights.append({
                    'type': 'trend',
                    'title': '📈 Spending Increased',
                    'message': f'Your spending increased by {change_percentage:.1f}% this month. Consider reviewing your recent expenses.',
                    'priority': 'high'
                })
            elif change_percentage < -20:
                insights.append({
                    'type': 'trend',
                    'title': '📉 Great Job Saving!',
                    'message': f'Your spending decreased by {abs(change_percentage):.1f}% this month. Keep up the good work!',
                    'priority': 'low'
                })
        
        # Debt analysis
        from .views import BalancesView
        balances_view = BalancesView()
        balances_view.request = request
        balances_response = balances_view.get(request)
        balances = balances_response.data
        
        total_debt = sum(amount for amount in balances.values() if amount < 0)
        total_owed = sum(amount for amount in balances.values() if amount > 0)
        
        if abs(total_debt) > 100:  # If owing more than ₹100
            insights.append({
                'type': 'debt',
                'title': '💳 Outstanding Debts',
                'message': f'You owe ₹{abs(total_debt):.2f} to friends. Consider settling some payments.',
                'priority': 'medium'
            })
        
        if total_owed > 100:  # If owed more than ₹100
            insights.append({
                'type': 'credit',
                'title': '💰 Money Owed to You',
                'message': f'Friends owe you ₹{total_owed:.2f}. You might want to remind them about pending payments.',
                'priority': 'low'
            })
        
        # Activity insights
        bills_this_week = user_bills.filter(
            created_at__gte=now - timedelta(days=7)
        ).count()
        
        if bills_this_week == 0:
            insights.append({
                'type': 'activity',
                'title': '😴 Quiet Week',
                'message': 'No bills this week. Planning any outings with friends?',
                'priority': 'low'
            })
        elif bills_this_week > 10:
            insights.append({
                'type': 'activity',
                'title': '🎉 Active Week!',
                'message': f'{bills_this_week} bills this week. You\'re staying social!',
                'priority': 'low'
            })
        
        # Sort insights by priority
        priority_order = {'high': 3, 'medium': 2, 'low': 1}
        insights.sort(key=lambda x: priority_order.get(x['priority'], 0), reverse=True)
        
        return Response({'insights': insights[:5]})  # Return top 5 insights