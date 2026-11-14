import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.config import settings
from app.errors import (
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from app.routers import assistant, auth, constitution, health, law_history, user
from app.services.providers import validate_provider_models

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Validate provider models on startup without crashing
    try:
        await validate_provider_models()
    except Exception as e:
        logger.warning("Startup provider models check skipped: %s", type(e).__name__)
    yield


app = FastAPI(
    title="Samvidhan API",
    version="1.0.0",
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url=None,
    lifespan=lifespan,
)

# Exception Handlers enforcing client contract: {success: false, message: "...", errors: ...}
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Idempotency-Key",
        "X-CSRF-Token",
        "Accept",
        "X-Forwarded-For",
    ],
    expose_headers=["Retry-After"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    if request.url.path.startswith("/api/user") or request.url.path.startswith("/api/auth"):
        response.headers["Cache-Control"] = "no-store"
    return response


# Include Routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(assistant.router)
app.include_router(constitution.router, prefix="/api")
app.include_router(law_history.router, prefix="/api")
