from django.contrib import admin
from django.urls import path, re_path
from django.conf import settings
from django.http import HttpResponseRedirect, HttpResponse
import requests

# Define a custom redirect view for static files
def static_redirect_view(request, path):
    # Construct the full URL to the static files server
    redirect_url = f"{settings.STATIC_URL}{path}"
    return HttpResponseRedirect(redirect_url)

# Define a custom view to fetch and serve remote HTML file
def serve_remote_html(request):
    try:
        # URL of the remote server hosting the HTML file
        remote_html_url = "http://react:80/index.html"  # Docker network hostname `react` on port 80
        # Fetch the remote HTML file content
        response = requests.get(remote_html_url)

        # If the request was successful, return the content as an HttpResponse
        if response.status_code == 200:
            return HttpResponse(response.content, content_type="text/html")
        else:
            return HttpResponse(f"Error fetching HTML file: {response.status_code}", status=response.status_code)
    except requests.RequestException as e:
        return HttpResponse(f"Error fetching HTML file: {str(e)}", status=500)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Redirect all static file requests to the STATIC_URL defined in settings.py
    re_path(r'^static/(?P<path>.*)$', static_redirect_view),

    # Serve the remote index.html for all other requests
    re_path(r'^(?!static/).*$', serve_remote_html),
]
