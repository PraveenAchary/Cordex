from django.urls import path

from .views import compile_code,validate_code

urlpatterns = [
    path("compile/",compile_code,name="compile_code"),
    path("validate/",validate_code,name="validate_code"),
]

