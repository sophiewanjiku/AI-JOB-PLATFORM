# Serializers convert complex data (like model instances) to JSON and back
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Task, SavedTask

# Get the active User model (our custom one defined in models.py)
User = get_user_model()


# Handles incoming registration data and creates a new user
class RegisterSerializer(serializers.ModelSerializer):
    # Password is write-only — it will never be returned in responses
    # min_length enforces a basic password strength requirement
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        # These are the fields accepted during registration
        fields = ['email', 'password', 'full_name', 'phone_number']

    def create(self, validated_data):
        # Use the custom manager's create_user method to hash the password properly
        return User.objects.create_user(**validated_data)


# Handles outgoing user data — what we send back in responses
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # These are the fields returned to the client (no password)
        fields = ['id', 'email', 'full_name', 'phone_number', 'is_verified', 'date_joined']

# Converts a Task object to JSON for the API response
class TaskSerializer(serializers.ModelSerializer):
    # Convert skills string back to a list for the frontend
    skills_list = serializers.SerializerMethodField()

    # Show the poster's name instead of just their ID
    posted_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = Task
        fields = [
            'id', 'title', 'description', 'category', 'data_type',
            'job_type', 'experience', 'project_length', 'budget',
            'hours_per_week', 'skills', 'skills_list', 'instructions',
            'is_published', 'allow_multiple', 'require_verification',
            'posted_by_name', 'created_at',
        ]

    def get_skills_list(self, obj):
        # Split comma-separated skills into a list
        return obj.skills_list()

    def get_posted_by_name(self, obj):
        # Return the poster's full name or fallback to email
        return obj.posted_by.full_name if obj.posted_by else 'Admin'        