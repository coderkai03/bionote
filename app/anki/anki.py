import csv
import os
import requests
import threading
import time
from datetime import datetime, UTC
from uagents import Agent, Context, Model
from typing import List

# 🔤 User input string (formatted flashcard)
#userInput = "Create flashcard: Why is the heart red? | Because its bloood you dummy"
userInput = "SET THE CHATBOT QUEREY HERE"

def create_flashcard(front: str, back: str, filename="agent_card.csv"):
    """Create a flashcard and append it to the CSV file"""
    os.makedirs(os.path.dirname(filename) if os.path.dirname(filename) else ".", exist_ok=True)
    file_exists = os.path.exists(filename)
    with open(filename, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if not file_exists or os.path.getsize(filename) == 0:
            writer.writerow(["Front", "Back"])
        writer.writerow([front, back])
    print(f"📚 Flashcard appended to {filename}")
    return filename

# Agent setup
agent = Agent(
    name="flashcard_rest_api",
    seed="flashcard_rest_seed_2025",
    port=8000,
    mailbox=False
)

# Request and Response Models
class CreateFlashcardRequest(Model):
    front: str
    back: str
    filename: str = "agent_card.csv"

class CreateFlashcardResponse(Model):
    status: str
    message: str
    filename: str
    front: str
    back: str
    timestamp: str

class HealthResponse(Model):
    status: str
    agent_name: str
    address: str
    endpoints: List[str]

# Startup Event
@agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"🚀 Flashcard REST API started!")
    ctx.logger.info(f"📍 Agent address: {agent.address}")
    ctx.logger.info(f"🌐 REST API: http://localhost:8000")
    ctx.logger.info(f"📝 POST /create_flashcard - Create new flashcard")
    ctx.logger.info(f"💓 GET /health - Health check")

    def delayed_post():
        time.sleep(2)  # Allow server to bind
        if userInput.lower().startswith("create flashcard:") and "|" in userInput:
            try:
                parts = userInput[len("create flashcard:"):].strip().split("|", 1)
                front = parts[0].strip()
                back = parts[1].strip()
                response = requests.post(
                    "http://localhost:8000/create_flashcard",
                    json={"front": front, "back": back}
                )
                print(f"📬 Flashcard POST Response: {response.status_code} - {response.json()}")
            except Exception as e:
                print(f"❌ Failed to parse or post flashcard: {e}")
        else:
            print("❌ Invalid input format. Please use: Create flashcard: FRONT | BACK")

    threading.Thread(target=delayed_post).start()

# Shutdown Event
@agent.on_event("shutdown")
async def shutdown(ctx: Context):
    ctx.logger.info("🛑 Flashcard REST API shutting down...")

# POST Endpoint
@agent.on_rest_post("/create_flashcard", CreateFlashcardRequest, CreateFlashcardResponse)
async def create_flashcard_endpoint(ctx: Context, request: CreateFlashcardRequest) -> CreateFlashcardResponse:
    ctx.logger.info(f"📨 POST /create_flashcard - Front: {request.front}, Back: {request.back}")
    try:
        created_file = create_flashcard(request.front, request.back, request.filename)
        return CreateFlashcardResponse(
            status="success",
            message=f"Flashcard added successfully",
            filename=created_file,
            front=request.front,
            back=request.back,
            timestamp=datetime.now(UTC).isoformat()
        )
    except Exception as e:
        ctx.logger.error(f"❌ Error creating flashcard: {e}")
        return CreateFlashcardResponse(
            status="error",
            message=f"Failed to create flashcard: {str(e)}",
            filename="",
            front=request.front,
            back=request.back,
            timestamp=datetime.now(UTC).isoformat()
        )

# GET Endpoint
@agent.on_rest_get("/health", HealthResponse)
async def health_endpoint(ctx: Context) -> HealthResponse:
    ctx.logger.info("💓 GET /health - Health check requested")
    return HealthResponse(
        status="healthy",
        agent_name="flashcard_rest_api",
        address=str(agent.address),
        endpoints=["/create_flashcard", "/health"]
    )

# Start the Agent
if __name__ == "__main__":
    print("""
🎓 Starting Flashcard REST API...

📋 Available endpoints:
   • POST /create_flashcard - Create flashcard
   • GET /health - Health check

🔗 Test input:
   userInput = "Create flashcard: What is a leg? | its a leg"

🛑 Stop with Ctrl+C
    """)
    agent.run()
