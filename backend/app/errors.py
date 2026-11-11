from typing import Any, Dict, List, Optional
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


def error_response(
    status_code: int,
    message: str,
    errors: Optional[Dict[str, List[str]]] = None,
    headers: Optional[Dict[str, str]] = None,
) -> JSONResponse:
    payload: Dict[str, Any] = {
        "success": False,
        "message": message,
    }
    if errors:
        payload["errors"] = errors
    return JSONResponse(status_code=status_code, content=payload, headers=headers)


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    headers = getattr(exc, "headers", None)
    message = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return error_response(
        status_code=exc.status_code,
        message=message,
        headers=headers,
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors_dict: Dict[str, List[str]] = {}
    first_error_msg = "Validation error"

    for err in exc.errors():
        loc = err.get("loc", [])
        field_name = str(loc[-1]) if loc else "general"
        msg = err.get("msg", "Invalid value")
        errors_dict.setdefault(field_name, []).append(msg)
        if first_error_msg == "Validation error":
            first_error_msg = f"Invalid input for {field_name}: {msg}"

    return error_response(
        status_code=status.HTTP_400_BAD_REQUEST,
        message=first_error_msg,
        errors=errors_dict,
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    import logging
    logging.exception(f"Unhandled server error at {request.method} {request.url.path}: {exc}")
    return error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="An unexpected server error occurred. Please try again later.",
    )
