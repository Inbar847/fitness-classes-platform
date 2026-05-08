from contextlib import asynccontextmanager
import os
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.routers.classes import router as classes_router
from app.api.routers.auth import router as auth_router
from app.api.routers.bookings import router as bookings_router
from app.database.database import Base, engine
import app.models.db_models


def wait_for_db(max_retries: int = 20, delay_seconds: int = 2) -> None:
    for attempt in range(max_retries):
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return
        except Exception:
            if attempt == max_retries - 1:
                raise
            time.sleep(delay_seconds)


@asynccontextmanager
async def lifespan(app: FastAPI):
    wait_for_db()
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Fitness Classes Platform",
    version="0.2.0",
    lifespan=lifespan,
)


frontend_url = os.getenv("FRONTEND_URL")

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://fitness-frontend-0ncs.onrender.com",
]

if frontend_url:
    allowed_origins.append(frontend_url.rstrip("/"))

print("Allowed CORS origins:", allowed_origins)


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(classes_router)
app.include_router(bookings_router)


@app.get("/")
async def root():
    return {"message": "Fitness Classes Platform API v0.3 – Auth ready"}