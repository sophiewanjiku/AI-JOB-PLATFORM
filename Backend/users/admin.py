from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Columns shown in the user list
    list_display = ['email', 'full_name', 'is_staff', 'is_verified', 'is_active', 'date_joined']
    
    # Fields you can search by
    search_fields = ['email', 'full_name']
    
    # Filters on the right side
    list_filter = ['is_staff', 'is_verified', 'is_active']
    
    # Use email instead of username
    ordering = ['-date_joined']

    # What fields show when you open a user
    fieldsets = (
        (None,          {'fields': ('email', 'password')}),
        ('Personal',    {'fields': ('full_name', 'phone_number')}),
        ('Permissions', {'fields': ('is_staff', 'is_superuser', 'is_active', 'is_verified')}),
    )

    # What fields show when creating a new user in admin
    add_fieldsets = (
        (None, {
            'fields': ('email', 'full_name', 'phone_number', 'password1', 'password2'),
        }),
    )