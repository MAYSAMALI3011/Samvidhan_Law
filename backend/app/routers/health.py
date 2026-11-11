from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check():
    """Liveness health check for hosts and uptime pingers."""
    return {"status": "ok"}
