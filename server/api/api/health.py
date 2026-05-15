from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get('/health', tags=['health'])
async def health_check():
    """Healthcheck simple para load balancers y orquestadores."""
    return {
        'status': 'ok',
        'time': datetime.utcnow().isoformat() + 'Z'
    }
