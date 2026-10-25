from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'dev-only-change-me'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    "unfold",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",


    'corsheaders',
    'rest_framework',
    'django_filters',
    'drf_spectacular',

    'menu',
    'orders',
    'accounts',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

LANGUAGE_CODE = "fa"
TIME_ZONE = 'Asia/Baku'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Brewly Cafe API',
    'DESCRIPTION': 'Cafe shop backend API for menu, categories, products and orders.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}
LOGOUT_REDIRECT_URL = "http://localhost:5173/shop"
UNFOLD = {
    "SITE_TITLE": "BuffieCoffee Admin",
    "SITE_HEADER": "BuffieCoffee",
"SITE_URL": "http://localhost:5173/",
    
    "COLORS": {
        "base": {
            "50": "oklch(98% 0.01 75)",
            "100": "oklch(96% 0.015 72)",
            "200": "oklch(91% 0.02 70)",
            "300": "oklch(84% 0.025 68)",
            "400": "oklch(70% 0.03 65)",
            "500": "oklch(56% 0.035 60)",
            "600": "oklch(44% 0.04 55)",
            "700": "oklch(34% 0.04 50)",
            "800": "oklch(26% 0.035 45)",
            "900": "oklch(20% 0.03 40)",
            "950": "oklch(14% 0.025 35)",
        },

        "primary": {
            "50": "oklch(97% 0.02 65)",
            "100": "oklch(93% 0.035 65)",
            "200": "oklch(86% 0.055 60)",
            "300": "oklch(76% 0.075 55)",
            "400": "oklch(66% 0.085 50)",
            "500": "oklch(56% 0.09 45)",
            "600": "oklch(47% 0.085 42)",
            "700": "oklch(39% 0.075 40)",
            "800": "oklch(31% 0.06 38)",
            "900": "oklch(25% 0.045 36)",
            "950": "oklch(18% 0.03 34)",
        },
    },
}