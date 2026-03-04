from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from api.add_batch import router as add_batch_router
from api.prediction import router as prediction_router
from api.retrain_model import router as retrain_router
from api.schedule import router as schedule_router
from api.upload_dataset import router as upload_router


app = FastAPI(
    title="AI-Driven Production Batch Scheduling and Resource Allocation System",
    description="Pharmaceutical oncology manufacturing analytics and scheduling platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(add_batch_router)
app.include_router(prediction_router)
app.include_router(retrain_router)
app.include_router(schedule_router)


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "Production Batch Scheduling API",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
