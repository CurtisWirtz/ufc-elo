from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

# from api.views import FighterViewSet, EventViewSet, BoutViewSet

# router = DefaultRouter()
# router.register(r'fighters', FighterViewSet)
# router.register(r'events', EventViewSet)
# router.register(r'bouts', BoutViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('api/', include(router.urls)),

    # JWT auth endpoints
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # PRODUCTION_XXX nice for developement, but I'll strip this out for production
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
