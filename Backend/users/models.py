# Import necessary Django modules for building a custom user model
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


# UserManager handles the logic for creating regular users and superusers
class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        # Ensure every user has an email address
        if not email:
            raise ValueError('Email is required')
        
        # Normalize the email (lowercases the domain part)
        email = self.normalize_email(email)
        
        # Create a new user instance with the given email and extra fields
        user = self.model(email=email, **extra_fields)
        
        # Hash and set the password securely (never stored as plain text)
        user.set_password(password)
        
        # Save the user to the database
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        # Superusers must have staff and superuser privileges
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        # Reuse the create_user logic with elevated permissions
        return self.create_user(email, password, **extra_fields)


# The main User model — replaces Django's default User
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    # These two lines fix the clash — they give our custom User model
    # its own unique reverse accessors so it doesn't conflict with Django's built-in User
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',  # avoids clash with auth.User.groups
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',  # avoids clash with auth.User.user_permissions
        blank=True
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']
    objects = UserManager()

    def __str__(self):
        return self.email