from django.contrib import admin
from django.urls import path, re_path
from django.views.generic import RedirectView
from django.conf import settings
from django.http import HttpResponseRedirect

# Define a custom redirect view for static files
def static_redirect_view(request, path):
    # Construct the full URL to the static files server
    redirect_url = f"{settings.STATIC_URL}{path}"
    return HttpResponseRedirect(redirect_url)

# Define a custom redirect view for serving index.html from an external server
def index_redirect_view(request):
    # Redirect to index.html hosted on the external server
    return HttpResponseRedirect('http://localhost:3000/index.html')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Redirect all static file requests to the STATIC_URL defined in settings.py
    re_path(r'^static/(?P<path>.*)$', static_redirect_view),

    # Redirect requests for the root URL and all non-static paths to the external server's index.html
    re_path(r'^(?!static/).*$', index_redirect_view),
]
