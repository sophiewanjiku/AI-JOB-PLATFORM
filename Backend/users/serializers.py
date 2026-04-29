# Serializers convert complex data (like model instances) to JSON and back
from rest_framework import serializers
from django.contrib.auth import get_user_model

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