from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    AdminStatsView,
    AdminUserListView,
    AdminToggleUserActiveView,
    TaskListView,
    TaskDetailView,
    SaveTaskView,
    SavedTaskListView,
    AdminUploadTaskView,
    AdminTaskListView,
)

urlpatterns = [
    # ── Auth ──
    path('register/',           RegisterView.as_view(),        name='register'),
    path('login/',              LoginView.as_view(),           name='login'),
    path('token/refresh/',      TokenRefreshView.as_view(),    name='token_refresh'),

    # ── Admin user management ──
    path('admin/stats/',                        AdminStatsView.as_view(),           name='admin-stats'),
    path('admin/users/',                        AdminUserListView.as_view(),         name='admin-users'),
    path('admin/users/<int:user_id>/toggle/',   AdminToggleUserActiveView.as_view(), name='admin-toggle-user'),

    # ── Tasks (public) ──
    path('tasks/',                      TaskListView.as_view(),    name='task-list'),
    path('tasks/<int:task_id>/',        TaskDetailView.as_view(),  name='task-detail'),
    path('tasks/<int:task_id>/save/',   SaveTaskView.as_view(),    name='save-task'),
    path('tasks/saved/',                SavedTaskListView.as_view(),name='saved-tasks'),

    # ── Tasks (admin only) ──
    path('admin/tasks/',        AdminTaskListView.as_view(),   name='admin-task-list'),
    path('admin/tasks/upload/', AdminUploadTaskView.as_view(), name='admin-upload-task'),
]