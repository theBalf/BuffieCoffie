import json
import logging
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

logger = logging.getLogger(__name__)

SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


class TurnstileUnavailable(Exception):
    pass


def verify_turnstile(token):
    if not settings.TURNSTILE_REQUIRED:
        return True
    if not isinstance(token, str) or not token.strip():
        return False
    if not settings.TURNSTILE_SECRET_KEY:
        raise ImproperlyConfigured(
            "TURNSTILE_SECRET_KEY is required when TURNSTILE_REQUIRED is enabled."
        )

    request = Request(
        SITEVERIFY_URL,
        data=urlencode({
            "secret": settings.TURNSTILE_SECRET_KEY,
            "response": token.strip(),
        }).encode(),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=5) as response:
            result = json.load(response)
    except (OSError, TimeoutError, URLError, ValueError) as exc:
        logger.exception("Cloudflare Turnstile verification request failed.")
        raise TurnstileUnavailable from exc

    if not isinstance(result, dict) or not result.get("success"):
        logger.warning(
            "Cloudflare Turnstile rejected a login challenge: %s",
            result.get("error-codes", []) if isinstance(result, dict) else "invalid response",
        )
        return False

    allowed_hostnames = settings.TURNSTILE_ALLOWED_HOSTNAMES
    if allowed_hostnames and result.get("hostname") not in allowed_hostnames:
        logger.warning("Cloudflare Turnstile returned an unexpected hostname.")
        return False

    return True
