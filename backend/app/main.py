from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, users, profile, publications, teaching, extension, authorship, approval, sdg, dolibarr_test, summary
from .dependencies import get_db
from .config import settings
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

app = FastAPI(
    title="FRIS API",
    description="Faculty Research Information System API with Dolibarr Integration",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(profile.router, prefix="/profile", tags=["Profile"])
app.include_router(publications.router, prefix="/publications", tags=["Research Activities"])
app.include_router(teaching.router, prefix="/teaching", tags=["Teaching Activities"])
app.include_router(extension.router, prefix="/extension", tags=["Extension Services"])
app.include_router(authorship.router, prefix="/authorship", tags=["Authorship"])
app.include_router(approval.router, prefix="/approval", tags=["Approval Workflow"])
app.include_router(sdg.router, prefix="/sdg", tags=["Sustainable Development Goals"])
app.include_router(dolibarr_test.router, prefix="/dolibarr-test", tags=["Dolibarr Test"])
app.include_router(summary.router, prefix="/summary", tags=["Record Summary"])

@app.get("/", tags=["Root"])
async def root():
    return {"message": "Welcome to FRIS API. See /docs for API documentation."}

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}
