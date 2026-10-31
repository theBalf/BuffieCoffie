import os
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent


def environment_list(name, default):
    return [
        value.strip()
        for value in os.environ.get(name, ",".join(default)).split(",")
        if value.strip()
    ]


DEBUG = os.environ.get("DJANGO_DEBUG", "False").lower() in {"1", "true", "yes"}
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    if not DEBUG:
        raise ImproperlyConfigured("DJANGO_SECRET_KEY must be set when DJANGO_DEBUG is false.")
    SECRET_KEY = "dev-only-change-me"

ALLOWED_HOSTS = environment_list("DJANGO_ALLOWED_HOSTS", ["localhost", "127.0.0.1"])

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


def build_database_config(database_url, debug, sslmode=None, sslrootcert=None):
    parsed_database_url = urlparse(database_url)
    if parsed_database_url.scheme not in {"postgres", "postgresql"}:
        raise ImproperlyConfigured(
            "DATABASE_URL must use the postgres or postgresql scheme."
        )
    database_host = os.environ.get("DATABASE_HOST") or (parsed_database_url.hostname or "")
    is_local_socket = database_host == "/var/run/postgresql"

    if not debug and not is_local_socket and sslmode != "verify-full":
        raise ImproperlyConfigured(
            "DATABASE_SSLMODE must be verify-full when DJANGO_DEBUG is false."
        )

    options = {}
    if sslmode:
        options["sslmode"] = sslmode
    if sslrootcert:
        options["sslrootcert"] = sslrootcert

    return {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": unquote(parsed_database_url.path.lstrip("/")),
        "USER": unquote(parsed_database_url.username or ""),
        "PASSWORD": unquote(parsed_database_url.password or ""),
        "HOST": database_host,
        "PORT": parsed_database_url.port or "",
        "CONN_MAX_AGE": 60,
        "OPTIONS": options,
    }


DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL:
    parsed_database_url = urlparse(DATABASE_URL)
    database_sslmode = os.environ.get("DATABASE_SSLMODE") or parse_qs(
        parsed_database_url.query
    ).get("sslmode", [None])[0]
    DATABASES = {
        "default": build_database_config(
            DATABASE_URL,
            DEBUG,
            database_sslmode,
            os.environ.get("DATABASE_SSLROOTCERT"),
        )
    }
else:
    if not DEBUG:
        raise ImproperlyConfigured(
            "DATABASE_URL must be set when DJANGO_DEBUG is false."
        )
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

LANGUAGE_CODE = "fa"
TIME_ZONE = 'Asia/Baku'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = Path(os.environ.get("STATIC_ROOT", BASE_DIR / "staticfiles"))
MEDIA_URL = "/media/"
MEDIA_ROOT = Path(os.environ.get("MEDIA_ROOT", BASE_DIR / "media"))
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173").rstrip("/")
TURNSTILE_SECRET_KEY = os.environ.get("TURNSTILE_SECRET_KEY", "")
TURNSTILE_REQUIRED = os.environ.get(
    "TURNSTILE_REQUIRED",
    "False" if DEBUG else "True",
).lower() in {"1", "true", "yes"}
if TURNSTILE_REQUIRED and not TURNSTILE_SECRET_KEY:
    raise ImproperlyConfigured(
        "TURNSTILE_SECRET_KEY must be set when TURNSTILE_REQUIRED is enabled."
    )
TURNSTILE_ALLOWED_HOSTNAMES = environment_list("TURNSTILE_ALLOWED_HOSTNAMES", [])
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = environment_list(
    "CORS_ALLOWED_ORIGINS",
    ["http://127.0.0.1:5173", "http://localhost:5173"],
)
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = environment_list(
    "CSRF_TRUSTED_ORIGINS",
    ["http://127.0.0.1:5173", "http://localhost:5173"],
)
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_SSL_REDIRECT = not DEBUG
SECURE_HSTS_SECONDS = 0 if DEBUG else 31_536_000
SECURE_PROXY_SSL_HEADER = (
    ("HTTP_X_FORWARDED_PROTO", "https") if not DEBUG else None
)
if os.environ.get("CROSS_SITE_SESSION_COOKIES", "False").lower() in {"1", "true", "yes"}:
    if DEBUG:
        raise ImproperlyConfigured("Cross-site session cookies require HTTPS and DEBUG=False.")
    SESSION_COOKIE_SAMESITE = "None"
    CSRF_COOKIE_SAMESITE = "None"

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

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
if not DEBUG:
    MIDDLEWARE.insert(
        MIDDLEWARE.index("django.middleware.security.SecurityMiddleware") + 1,
        "whitenoise.middleware.WhiteNoiseMiddleware",
    )
LOGOUT_REDIRECT_URL = f"{FRONTEND_URL}/shop"
UNFOLD = {
    "SITE_TITLE": "BuffieCoffee Admin",
    "SITE_HEADER": "BuffieCoffee",
    "SITE_URL": f"{FRONTEND_URL}/",
    
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