import requests
import base64
from datetime import datetime
from django.conf import settings


def get_access_token():
    """
    Gets a fresh OAuth access token from Daraja.
    This token is required for every API call and expires after 1 hour.
    """
    url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

    # Base64 encode the consumer key and secret for Basic Auth
    credentials = f"{settings.MPESA_CONSUMER_KEY}:{settings.MPESA_CONSUMER_SECRET}"
    encoded = base64.b64encode(credentials.encode()).decode()

    response = requests.get(url, headers={'Authorization': f'Basic {encoded}'})
    response.raise_for_status()
    return response.json()['access_token']


def generate_password():
    """
    Generates the Lipa na M-Pesa password.
    Format: Base64(Shortcode + Passkey + Timestamp)
    """
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    raw = f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}"
    password = base64.b64encode(raw.encode()).decode()
    return password, timestamp


def send_b2c_payment(phone_number: str, amount: float, remarks: str = 'Task payout'):
    """
    Sends money from the business to a worker's M-Pesa number.
    This is the B2C (Business to Customer) API call.

    Args:
        phone_number: Worker's phone in format 2547XXXXXXXX (no + sign)
        amount: Amount in KES to send
        remarks: Description of the payment

    Returns:
        dict with ConversationID and ResponseDescription from Daraja
    """
    token = get_access_token()

    # Format phone number — remove + if present
    phone = phone_number.replace('+', '').replace(' ', '')

    url = 'https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest'

    payload = {
        'InitiatorName':      settings.MPESA_B2C_INITIATOR_NAME,
        'SecurityCredential': settings.MPESA_B2C_SECURITY_CREDENTIAL,
        'CommandID':          'BusinessPayment',  # Direct payment to phone
        'Amount':             int(amount),
        'PartyA':             settings.MPESA_SHORTCODE,
        'PartyB':             phone,
        'Remarks':            remarks,
        'QueueTimeOutURL':    settings.MPESA_CALLBACK_URL + 'timeout/',
        'ResultURL':          settings.MPESA_CALLBACK_URL + 'result/',
        'Occasion':           'Taskr AI Payout',
    }

    response = requests.post(
        url,
        json=payload,
        headers={'Authorization': f'Bearer {token}'}
    )
    response.raise_for_status()
    return response.json()


def stk_push(phone_number: str, amount: float, account_ref: str = 'Taskr AI'):
    """
    Initiates an STK Push (prompt on user's phone to pay).
    Used if we ever need users to make payments TO the platform.
    Not used for payouts but useful to have.

    Args:
        phone_number: User's phone in format 2547XXXXXXXX
        amount: Amount in KES
        account_ref: Reference shown on user's phone
    """
    token = get_access_token()
    password, timestamp = generate_password()

    phone = phone_number.replace('+', '').replace(' ', '')

    url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

    payload = {
        'BusinessShortCode': settings.MPESA_SHORTCODE,
        'Password':          password,
        'Timestamp':         timestamp,
        'TransactionType':   'CustomerPayBillOnline',
        'Amount':            int(amount),
        'PartyA':            phone,
        'PartyB':            settings.MPESA_SHORTCODE,
        'PhoneNumber':       phone,
        'CallBackURL':       settings.MPESA_CALLBACK_URL,
        'AccountReference':  account_ref,
        'TransactionDesc':   'Taskr AI payment',
    }

    response = requests.post(
        url,
        json=payload,
        headers={'Authorization': f'Bearer {token}'}
    )
    response.raise_for_status()
    return response.json()