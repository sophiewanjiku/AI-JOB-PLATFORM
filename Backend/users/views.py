# Views handle incoming HTTP requests and return responses
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, UserSerializer
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from django.db import models as django_models
from django.db.models import Q
from .models import Task, SavedTask
from .serializers import TaskSerializer

User = get_user_model()

# Handles POST /api/auth/register/
class RegisterView(APIView):
    # Allow anyone to access this endpoint (no login required)
    permission_classes = [AllowAny]

    def post(self, request):
        # Pass the incoming request data into the registration serializer
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            # Save the new user to the database
            user = serializer.save()
            
            # Generate a JWT refresh token for the newly registered user
            refresh = RefreshToken.for_user(user)
            
            # Return the user's info along with both tokens
            return Response({
                'user': UserSerializer(user).data,   # Safe user info (no password)
                'refresh': str(refresh),              # Long-lived token for getting new access tokens
                'access': str(refresh.access_token), # Short-lived token for authenticating requests
            }, status=status.HTTP_201_CREATED)
        
        # If validation fails, return the errors so the frontend can display them
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Handles POST /api/auth/login/
class LoginView(APIView):
    # Allow anyone to access this endpoint (no login required)
    permission_classes = [AllowAny]

    def post(self, request):
        # Extract email and password from the request body
        email = request.data.get('email')
        password = request.data.get('password')
        
        # Verify the credentials against the database
        # authenticate() returns the user object if valid, or None if not
        user = authenticate(request, username=email, password=password)

        if user:
            # Credentials are correct — generate fresh JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        
        # Credentials don't match — return a 401 Unauthorized error
        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Returns platform-wide stats for the admin dashboard
# Only accessible by admin users (is_staff=True)
class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({
            # Count all registered users
            'total_users': User.objects.count(),

            # Count only verified users
            'verified_users': User.objects.filter(is_verified=True).count(),

            # Count flagged/inactive accounts
            'flagged_users': User.objects.filter(is_active=False).count(),
        })


# Returns a list of all users for the admin user management table
# Only accessible by admin users
class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Get all users, most recently joined first
        users = User.objects.all().order_by('-date_joined')

        # Serialize each user into a safe dictionary
        data = [
            {
                'id': u.id,
                'full_name': u.full_name,
                'email': u.email,
                'phone_number': u.phone_number,
                'is_verified': u.is_verified,
                'is_active': u.is_active,
                'date_joined': u.date_joined,
            }
            for u in users
        ]
        return Response(data)

# Allows admin to toggle a user's active status (flag/unflag account)
class AdminToggleUserActiveView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, user_id):
        try:
            # Find the user by their ID
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        # Flip the active status — True becomes False and vice versa
        user.is_active = not user.is_active
        user.save()

        return Response({
            'id': user.id,
            'is_active': user.is_active,
            'message': f"User {'activated' if user.is_active else 'deactivated'} successfully"
        })
# Returns all published tasks, with optional search and filter support
class TaskListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Start with all published tasks
        tasks = Task.objects.filter(is_published=True).order_by('-created_at')

        # Search by title or description if query param provided
        search = request.query_params.get('search')
        if search:
            tasks = tasks.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )

        # Filter by category
        category = request.query_params.get('category')
        if category:
            tasks = tasks.filter(category=category)

        # Filter by data type
        data_type = request.query_params.get('data_type')
        if data_type:
            tasks = tasks.filter(data_type=data_type)

        # Filter by job type
        job_type = request.query_params.get('job_type')
        if job_type:
            tasks = tasks.filter(job_type=job_type)

        # Filter by experience level
        experience = request.query_params.get('experience')
        if experience:
            tasks = tasks.filter(experience=experience)

        # Filter by max budget
        max_budget = request.query_params.get('max_budget')
        if max_budget:
            tasks = tasks.filter(budget__lte=max_budget)

        # Filter by project length
        project_length = request.query_params.get('project_length')
        if project_length:
            tasks = tasks.filter(project_length=project_length)

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)


# Returns a single task by ID
class TaskDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id, is_published=True)
        except Task.DoesNotExist:
            return Response({'error': 'Task not found'}, status=404)

        serializer = TaskSerializer(task)
        return Response(serializer.data)


# Saves or unsaves a task for the logged-in user (toggle)
class SaveTaskView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({'error': 'Task not found'}, status=404)

        # Check if already saved — if so, unsave it
        existing = SavedTask.objects.filter(user=request.user, task=task).first()
        if existing:
            existing.delete()
            return Response({'saved': False, 'message': 'Task removed from saved jobs'})

        # Otherwise save it
        SavedTask.objects.create(user=request.user, task=task)
        return Response({'saved': True, 'message': 'Task saved successfully'})


# Returns all saved tasks for the logged-in user
class SavedTaskListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get all saved task IDs for this user
        saved = SavedTask.objects.filter(user=request.user).values_list('task_id', flat=True)
        tasks = Task.objects.filter(id__in=saved, is_published=True)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)    
# Admin only — creates a new task from the upload form
class AdminUploadTaskView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        # Convert the skills list from frontend back to a comma-separated string
        skills_input = request.data.get('skills', [])
        if isinstance(skills_input, list):
            skills_str = ', '.join(skills_input)
        else:
            skills_str = skills_input

        # Create the task with all fields from the form
        task = Task.objects.create(
            title                = request.data.get('title'),
            description          = request.data.get('description'),
            category             = request.data.get('category'),
            data_type            = request.data.get('data_type'),
            job_type             = request.data.get('job_type', 'fixed'),
            experience           = request.data.get('experience', 'entry'),
            project_length       = request.data.get('project_length', '1_4_weeks'),
            budget               = request.data.get('budget'),
            hours_per_week       = request.data.get('hours_per_week') or None,
            skills               = skills_str,
            instructions         = request.data.get('instructions', ''),
            is_published         = request.data.get('is_published', True),
            allow_multiple       = request.data.get('allow_multiple', False),
            require_verification = request.data.get('require_verification', True),
            posted_by            = request.user,
        )

        serializer = TaskSerializer(task)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# Admin only — returns all tasks including unpublished drafts
class AdminTaskListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Admin sees all tasks, not just published ones
        tasks = Task.objects.all().order_by('-created_at')
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)    