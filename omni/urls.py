from django.contrib import admin
from django.urls import path, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.http import HttpResponseRedirect

# Define a custom redirect view for static files
def static_redirect_view(request, path):
    # Construct the full URL to the static files server
    redirect_url = f"{settings.STATIC_URL}{path}"
    return HttpResponseRedirect(redirect_url)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Redirect all static file requests to the STATIC_URL defined in settings.py
    re_path(r'^static/(?P<path>.*)$', static_redirect_view),

    # Serve index.html for all other requests
    re_path(r'^(?!static/).*$', TemplateView.as_view(template_name='index.html')),
]
