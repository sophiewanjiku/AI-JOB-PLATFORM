from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    AdminStatsView,
    AdminUserListView,
    AdminToggleUserActiveView,
)
urlpatterns = [
    # ── Auth endpoints ──
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # ── Admin endpoints — require is_staff=True ──
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:user_id>/toggle/', AdminToggleUserActiveView.as_view(), name='admin-toggle-user'),
]