from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from app.config.database import db
from app.models.room import RoomCreate, RoomUpdate
from bson import ObjectId
import cloudinary
import cloudinary.uploader
import os

# Load Cloudinary config from .env
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

room_router = APIRouter(prefix="/rooms", tags=["Rooms"])

# Serializer helper
def room_serializer(room) -> dict:
    return {
        "id": str(room["_id"]),
        "roomNumber": room["roomNumber"],
        "roomType": room["roomType"],
        "pricePerNight": room["pricePerNight"],
        "status": room["status"],
        "specialFeatures": room.get("specialFeatures", []),
        "images": room.get("images", []),
    }

# 🟢 CREATE ROOM with Images
@room_router.post("/")
async def create_room(
    roomNumber: str = Form(...),
    roomType: str = Form(...),
    pricePerNight: float = Form(...),
    status: str = Form("Available"),
    specialFeatures: str = Form(""),  # comma-separated string
    images: list[UploadFile] = File(default=[])
):
    # Check if room number exists
    existing = await db.rooms.find_one({"roomNumber": roomNumber})
    if existing:
        raise HTTPException(status_code=400, detail="Room number already exists")

    # Upload images to Cloudinary
    uploaded_urls = []
    for image in images:
        result = cloudinary.uploader.upload(image.file)
        uploaded_urls.append(result.get("secure_url"))

    # Convert specialFeatures string to list
    features_list = [f.strip() for f in specialFeatures.split(",") if f.strip()]

    room_data = {
        "roomNumber": roomNumber,
        "roomType": roomType,
        "pricePerNight": pricePerNight,
        "status": status,
        "specialFeatures": features_list,
        "images": uploaded_urls
    }

    result = await db.rooms.insert_one(room_data)
    new_room = await db.rooms.find_one({"_id": result.inserted_id})
    return JSONResponse({"message": "Room created successfully", "data": room_serializer(new_room)})

# 🔵 GET ALL ROOMS
@room_router.get("/")
async def get_all_rooms():
    rooms = []
    async for room in db.rooms.find():
        rooms.append(room_serializer(room))
    return {"count": len(rooms), "data": rooms}

# 🔵 GET AVAILABLE ROOMS
@room_router.get("/available")
async def get_available_rooms():
    rooms = []
    async for room in db.rooms.find({"status": "Available"}):
        rooms.append(room_serializer(room))
    return {"count": len(rooms), "data": rooms}

# 🟠 UPDATE ROOM
@room_router.put("/{room_id}")
async def update_room(room_id: str, update_data: RoomUpdate):
    room = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    await db.rooms.update_one(
        {"_id": ObjectId(room_id)}, 
        {"$set": update_data.dict(exclude_unset=True)}
    )
    updated = await db.rooms.find_one({"_id": ObjectId(room_id)})
    return {"message": "Room updated successfully", "data": room_serializer(updated)}

# 🔴 DELETE ROOM
@room_router.delete("/{room_id}")
async def delete_room(room_id: str):
    room = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    await db.rooms.delete_one({"_id": ObjectId(room_id)})
    return {"message": "Room deleted successfully"}
