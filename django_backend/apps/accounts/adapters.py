"""
Social Account Adapters for OAuth Integration
"""
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter as BaseAdapter
from allauth.account.utils import user_email, user_field, user_username
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class DefaultSocialAccountAdapter(BaseAdapter):
    """
    Custom social account adapter for AHP Platform
    """
    
    def pre_social_login(self, request, sociallogin):
        """
        Called before social login is processed.
        Connect social account to existing user if email matches.
        """
        user = sociallogin.user
        if user.id:
            return
        
        # Try to connect to existing user by email
        if user.email:
            try:
                existing_user = User.objects.get(email=user.email)
                sociallogin.connect(request, existing_user)
                logger.info(f"Connected social account to existing user: {existing_user.email}")
            except User.DoesNotExist:
                # No existing user with this email, will create new one
                logger.info(f"No existing user found for email: {user.email}")
                pass
    
    def populate_user(self, request, sociallogin, data):
        """
        Populates user information from social account data
        """
        user = sociallogin.user
        
        # Get provider-specific data
        provider = sociallogin.account.provider
        extra_data = sociallogin.account.extra_data
        
        # Set basic fields
        user_email(user, data.get('email'))
        user_username(user, data.get('username') or data.get('email', '').split('@')[0])
        
        # Set name fields based on provider
        if provider == 'google':
            user_field(user, 'first_name', extra_data.get('given_name', ''))
            user_field(user, 'last_name', extra_data.get('family_name', ''))
            full_name = extra_data.get('name', '')
        elif provider == 'kakao':
            kakao_account = extra_data.get('kakao_account', {})
            profile = kakao_account.get('profile', {})
            full_name = profile.get('nickname', '')
        elif provider == 'naver':
            response = extra_data.get('response', {})
            full_name = response.get('name', '')
            user_field(user, 'first_name', response.get('first_name', ''))
            user_field(user, 'last_name', response.get('last_name', ''))
        else:
            full_name = data.get('name', '')
        
        # Set full name if available
        if full_name:
            user_field(user, 'full_name', full_name)
        
        # Set user as active
        user.is_active = True
        
        logger.info(f"Populated user data for {provider} login: {user.email}")
        return user
    
    def save_user(self, request, sociallogin, form=None):
        """
        Save user with social account information
        """
        user = super().save_user(request, sociallogin, form)
        
        # Create or update user profile
        try:
            from .models import UserProfile
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            if created:
                # Set some defaults for social users
                profile.is_evaluator = True
                profile.notification_preferences = {
                    'email_notifications': True,
                    'project_invitations': True,
                    'evaluation_reminders': True
                }
                profile.save()
                logger.info(f"Created profile for social user: {user.email}")
            
        except Exception as e:
            logger.error(f"Error creating profile for social user {user.email}: {e}")
        
        return user