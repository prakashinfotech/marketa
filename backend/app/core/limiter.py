"""
Shared `slowapi` rate limiter instance.

Endpoints should import `limiter` from this module and apply `@limiter.limit(...)`
to public, auth, or otherwise abuse-prone routes. The instance is registered with
the FastAPI app in `main.py` via `app.state.limiter = limiter`.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address


limiter = Limiter(key_func=get_remote_address)
