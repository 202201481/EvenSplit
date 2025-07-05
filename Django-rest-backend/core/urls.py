from django.urls import path
from .views import RegisterView,UserSearchView,FriendListCreateView,BillListCreateView,SettlementListCreateView,BalancesView,GroupListCreateView,AnalyticsView,InsightsView
from rest_framework.authtoken.views import obtain_auth_token


urlpatterns = [
    path('register/',RegisterView.as_view(), name='register'),
    path('login/',obtain_auth_token,name='login'), 
    path('search/',UserSearchView.as_view(),name='user-search'),
    path('friends/',FriendListCreateView.as_view(),name='friend-list-create'),
    path('bills/', BillListCreateView.as_view(), name='bill-list-create'),
    path('settlements/', SettlementListCreateView.as_view(), name='settlement-list-create'),
    path('balances/', BalancesView.as_view(), name='balances'),
    path('groups/', GroupListCreateView.as_view(), name='group-list-create'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
    path('insights/', InsightsView.as_view(), name='insights'),
]   