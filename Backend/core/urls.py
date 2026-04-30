"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

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