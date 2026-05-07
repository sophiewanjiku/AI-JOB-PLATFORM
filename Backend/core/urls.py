from django.contrib import admin
from django.urls import path, include
# Add to imports
from .views import (
    # ... existing imports ...
    ConnectMpesaView,
    UserPayoutListView,
    AdminPayoutListView,
    AdminVerifyPayoutView,
    AdminSendPayoutView,
    MpesaCallbackView,
)

urlpatterns = [
    # Django admin panel
    path('admin/', admin.site.urls),

    # All our API endpoints live in users/urls.py
    path('api/auth/', include('users.urls')),

    path('payment-method/',         ConnectMpesaView.as_view(),      name='connect-mpesa'),

    # ── User payouts ──
    path('payouts/',                UserPayoutListView.as_view(),    name='user-payouts'),

    # ── Admin payouts ──
    path('admin/payouts/',          AdminPayoutListView.as_view(),   name='admin-payouts'),
    path('admin/payouts/<int:payout_id>/verify/', AdminVerifyPayoutView.as_view(), name='verify-payout'),
    path('admin/payouts/<int:payout_id>/send/',   AdminSendPayoutView.as_view(),   name='send-payout'),

    # ── Daraja callback — Safaricom calls this ──
    path('mpesa/callback/result/',  MpesaCallbackView.as_view(),    name='mpesa-callback'),
]