from django.db import models
from django.contrib.auth.models import User
# Create your models here.
CATEGORY_CHOICES = (
    ('food', 'Food'),
    ('travel', 'Travel'),
    ('utilities', 'Utilities'),
    ('entertainment', 'Entertainment'),
    ('other', 'Other'),
)
RECURRENCE_CHOICES = [
    ('none', 'None'),
    ('daily', 'Daily'),
    ('weekly', 'Weekly'),
    ('monthly', 'Monthly'),
]


class Friend(models.Model):
    user = models.ForeignKey(User, related_name='owner', on_delete=models.CASCADE)
    friend = models.ForeignKey(User,related_name='friend', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user','friend')


class Bill(models.Model):
    desc = models.CharField(max_length=500)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name="bills_created", on_delete=models.CASCADE)
    participants = models.ManyToManyField(User, related_name="bills_participated")
    split_type = models.CharField(max_length=20, choices=[('equal', 'Equal'), ('percentage', 'Percentage'), ('amount', 'Amount')], default='equal')
    group = models.ForeignKey('Group', related_name='bills', on_delete=models.CASCADE, null=True, blank=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='other')

    is_recurring = models.BooleanField(default=False)
    recurrence_type = models.CharField(max_length=20, choices=RECURRENCE_CHOICES, default='none')
    next_due_date = models.DateField(null=True, blank=True)
    def __str__(self):
        return f"{self.desc} - {self.amount} by {self.created_by.username} on {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"

class BillSplit(models.Model):
    bill = models.ForeignKey(Bill, related_name='splits', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    

    def __str__(self):
        return f"{self.user.username} owes {self.amount} for {self.bill.desc}"
    

class Settlement(models.Model):
    payer = models.ForeignKey(User, related_name='settlements_made', on_delete=models.CASCADE)
    payee = models.ForeignKey(User, related_name='settlements_received', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    bill = models.ForeignKey(Bill, related_name='settlements', on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.payer.username} paid {self.payee.username} {self.amount}"
    
class Group(models.Model):
    name = models.CharField(max_length=100)
    members = models.ManyToManyField(User, related_name='bill_split_groups')
    created_by = models.ForeignKey(User, related_name='groups_created', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
