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
    
# Task model — represents a job posted by an admin on the marketplace
class Task(models.Model):

    # Job type choices
    JOB_TYPE_CHOICES = [
        ('fixed', 'Fixed Price'),
        ('hourly', 'Hourly'),
    ]

    # Experience level choices
    EXPERIENCE_CHOICES = [
        ('entry', 'Entry Level'),
        ('intermediate', 'Intermediate'),
        ('expert', 'Expert'),
    ]

    # Project length choices
    LENGTH_CHOICES = [
        ('less_1_week', 'Less than 1 week'),
        ('1_4_weeks', '1 to 4 weeks'),
        ('1_3_months', '1 to 3 months'),
        ('3_plus_months', '3+ months'),
    ]

    # Data type choices
    DATA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('text', 'Text'),
        ('audio', 'Audio'),
        ('video', 'Video'),
        ('tabular', 'Tabular'),
    ]

    # Category choices
    CATEGORY_CHOICES = [
        ('labeling', 'Data Labeling'),
        ('transcription', 'Transcription'),
        ('verification', 'Verification'),
        ('review', 'Dataset Review'),
        ('annotation', 'Annotation'),
    ]

    # Core fields
    title           = models.CharField(max_length=255)
    description     = models.TextField()
    category        = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    data_type       = models.CharField(max_length=50, choices=DATA_TYPE_CHOICES)
    job_type        = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='fixed')
    experience      = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES, default='entry')
    project_length  = models.CharField(max_length=20, choices=LENGTH_CHOICES, default='1_4_weeks')

    # Compensation
    budget          = models.DecimalField(max_digits=10, decimal_places=2)
    hours_per_week  = models.IntegerField(null=True, blank=True)

    # Skills stored as comma-separated string e.g. "Python,Annotation"
    skills          = models.TextField(blank=True)

    # Extra instructions from the admin
    instructions    = models.TextField(blank=True)

    # Visibility settings
    is_published             = models.BooleanField(default=True)
    allow_multiple           = models.BooleanField(default=False)
    require_verification     = models.BooleanField(default=True)

    # Who posted this task (admin user)
    posted_by       = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='posted_tasks'
    )

    # Timestamps
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    # Helper to return skills as a list
    def skills_list(self):
        return [s.strip() for s in self.skills.split(',') if s.strip()]


# Saved jobs — tracks which tasks a user has bookmarked
class SavedTask(models.Model):
    user    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_tasks')
    task    = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    # Prevent duplicate saves
    class Meta:
        unique_together = ['user', 'task']

    def __str__(self):
        return f"{self.user.email} saved {self.task.title}"