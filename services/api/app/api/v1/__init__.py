from fastapi import APIRouter

from app.api.v1 import (
    alerts,
    auth,
    auth_oauth,
    billing,
    comments,
    health,
    market,
    market_advanced,
    market_content,
    research_cards,
    review,
    strategies,
    trading,
    user,
    user_credentials,
    watchlist,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(auth_oauth.router, prefix="/auth", tags=["auth"])
api_router.include_router(market.router, tags=["market"])
api_router.include_router(market_advanced.router, tags=["market-advanced"])
api_router.include_router(market_content.router, tags=["market-content"])
api_router.include_router(watchlist.router, tags=["watchlist"])
api_router.include_router(trading.router, prefix="/trading", tags=["trading"])
api_router.include_router(strategies.router, tags=["strategies"])
api_router.include_router(user.router, tags=["user"])
api_router.include_router(user_credentials.router, tags=["user"])
api_router.include_router(alerts.router, tags=["alerts"])
api_router.include_router(comments.router, tags=["comments"])
api_router.include_router(research_cards.router, tags=["research-cards"])
api_router.include_router(review.router, tags=["review"])
api_router.include_router(billing.router, tags=["billing"])
