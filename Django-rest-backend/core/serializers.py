from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Friend,Bill,BillSplit, Settlement,Group
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
    def create(self, validated_data):
        user = User(username=validated_data['username'],email=validated_data['email'])
        user.set_password(validated_data['password'])
        user.save()
        return user
    def validate_email(self,value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

class FriendSerializer(serializers.ModelSerializer):
    friend = UserSerializer(read_only=True)
    friend_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='friend', write_only=True
    )

    class Meta:
        model = Friend
        fields = ['id', 'friend', 'friend_id', 'created_at']

class BillSplitSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )

    class Meta:
        model = BillSplit
        fields = ['id', 'bill', 'user', 'user_id', 'amount']


class BillSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.all()
    )
    splits = BillSplitSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    split_type = serializers.ChoiceField(
        choices=[('equal', 'Equal'), ('percentage', 'Percentage'), ('amount', 'Amount')],
        default='equal'
    )
    group = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(), required=False, allow_null=True
    )
    category = serializers.ChoiceField(choices=[
        ('food', 'Food'),
        ('travel', 'Travel'),
        ('utilities', 'Utilities'),
        ('shopping', 'Shopping'),
        ('entertainment', 'Entertainment'),
        ('other', 'Other'),
    ], default='other')
    is_recurring = serializers.BooleanField(default=False)
    recurrence_type = serializers.ChoiceField(
        choices=[
            ('none', 'None'),
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('monthly', 'Monthly'),
        ],
        default='none'
    )
    next_due_date = serializers.DateField(required=False, allow_null=True)
    class Meta:
        model = Bill
        fields = ['id', 'desc', 'amount', 'created_at', 'created_by', 'participants', 'splits','split_type','group','category','is_recurring', 'recurrence_type', 'next_due_date']

class SettlementSerializer(serializers.ModelSerializer):
    payer = UserSerializer(read_only=True)
    payee = UserSerializer(read_only=True)
    payer_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='payer', write_only=True
    )
    payee_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='payee', write_only=True
    )

    class Meta:
        model = Settlement
        fields = ['id', 'payer', 'payee', 'amount', 'bill', 'created_at', 'payer_id', 'payee_id']

    
class GroupSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    members_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.all(), source='members', write_only=True
    )
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'members', 'members_ids', 'created_by', 'created_at']