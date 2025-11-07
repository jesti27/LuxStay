from fastapi import APIRouter, HTTPException, Depends
from app.config.database import db
from app.models.booking import BookingCreate, BookingUpdate, BookingStatus
from bson import ObjectId
from datetime import datetime, timedelta
import math

booking_router = APIRouter(prefix="/bookings", tags=["Bookings"])

def booking_serializer(booking, room_number: str = None) -> dict:
    return {
        "id": str(booking["_id"]),
        "room_id": booking["room_id"],
        "room_number": room_number or booking.get("room_number", ""),
        "guest_name": booking["guest_name"],
        "guest_email": booking["guest_email"],
        "guest_phone": booking["guest_phone"],
        "guest_address": booking["guest_address"],
        "check_in_date": booking["check_in_date"],
        "check_out_date": booking["check_out_date"],
        "total_guests": booking["total_guests"],
        "total_amount": booking["total_amount"],
        "status": booking["status"],
        "special_requests": booking.get("special_requests", ""),
        "payment_method": booking["payment_method"],
        "created_at": booking["created_at"]
    }

# 🟢 CREATE BOOKING
@booking_router.post("/")
async def create_booking(booking_data: BookingCreate):
    try:
        # Check if room exists and is available
        room = await db.rooms.find_one({"_id": ObjectId(booking_data.room_id)})
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        
        if room["status"] != "Available":
            raise HTTPException(status_code=400, detail="Room is not available for booking")

        # Check for date conflicts
        existing_booking = await db.bookings.find_one({
            "room_id": booking_data.room_id,
            "status": {"$in": ["PENDING", "CONFIRMED", "CHECKED_IN"]},
            "$or": [
                {
                    "check_in_date": {"$lte": booking_data.check_in_date},
                    "check_out_date": {"$gt": booking_data.check_in_date}
                },
                {
                    "check_in_date": {"$lt": booking_data.check_out_date},
                    "check_out_date": {"$gte": booking_data.check_out_date}
                }
            ]
        })
        
        if existing_booking:
            raise HTTPException(status_code=400, detail="Room is already booked for the selected dates")

        # Calculate total amount
        check_in = datetime.strptime(booking_data.check_in_date, "%Y-%m-%d")
        check_out = datetime.strptime(booking_data.check_out_date, "%Y-%m-%d")
        nights = (check_out - check_in).days
        total_amount = room["pricePerNight"] * nights

        booking_data_dict = booking_data.dict()
        booking_data_dict.update({
            "total_amount": total_amount,
            "status": BookingStatus.PENDING.value,
            "created_at": datetime.now().isoformat()
        })

        result = await db.bookings.insert_one(booking_data_dict)
        
        # Update room status to reserved
        await db.rooms.update_one(
            {"_id": ObjectId(booking_data.room_id)},
            {"$set": {"status": "Reserved"}}
        )

        new_booking = await db.bookings.find_one({"_id": result.inserted_id})
        room = await db.rooms.find_one({"_id": ObjectId(booking_data.room_id)})
        room_number = room["roomNumber"] if room else "Unknown"
        
        return {
            "success": True,
            "message": "Booking created successfully", 
            "data": booking_serializer(new_booking, room_number)
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ Error in create_booking: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# 🔵 GET ALL BOOKINGS
@booking_router.get("/")
async def get_all_bookings():
    try:
        bookings = []
        async for booking in db.bookings.find().sort("created_at", -1):
            try:
                room = await db.rooms.find_one({"_id": ObjectId(booking["room_id"])})
                room_number = room["roomNumber"] if room else "Unknown"
                bookings.append(booking_serializer(booking, room_number))
            except Exception as e:
                print(f"❌ Error processing booking {booking.get('_id')}: {e}")
                continue
        
        return {
            "success": True,
            "count": len(bookings), 
            "data": bookings
        }
        
    except Exception as e:
        print(f"❌ Error in get_all_bookings: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# 🔵 GET BOOKING BY ID
@booking_router.get("/{booking_id}")
async def get_booking(booking_id: str):
    try:
        if not ObjectId.is_valid(booking_id):
            raise HTTPException(status_code=400, detail="Invalid booking ID format")
            
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        room = await db.rooms.find_one({"_id": ObjectId(booking["room_id"])})
        room_number = room["roomNumber"] if room else "Unknown"
        
        return {
            "success": True,
            "data": booking_serializer(booking, room_number)
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ Error in get_booking: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# 🔵 GET USER BOOKINGS BY EMAIL
@booking_router.get("/user/{email}")
async def get_user_bookings(email: str):
    try:
        bookings = []
        async for booking in db.bookings.find({"guest_email": email}).sort("created_at", -1):
            try:
                room = await db.rooms.find_one({"_id": ObjectId(booking["room_id"])})
                room_number = room["roomNumber"] if room else "Unknown"
                bookings.append(booking_serializer(booking, room_number))
            except Exception as e:
                print(f"❌ Error processing booking {booking.get('_id')}: {e}")
                continue
                
        return {
            "success": True,
            "count": len(bookings), 
            "data": bookings
        }
        
    except Exception as e:
        print(f"❌ Error in get_user_bookings: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# 🟠 UPDATE BOOKING STATUS - CASE INSENSITIVE VERSION
@booking_router.put("/{booking_id}")
async def update_booking(booking_id: str, update_data: BookingUpdate):
    try:
        print(f"🔧 Starting update for booking: {booking_id}")
        print(f"📦 Raw update data: {update_data}")
        
        # Validate booking ID
        if not ObjectId.is_valid(booking_id):
            error_msg = f"Invalid booking ID format: {booking_id}"
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)

        # Find the booking
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            error_msg = f"Booking not found: {booking_id}"
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=404, detail=error_msg)

        print(f"✅ Found booking: {booking['guest_name']} - Current status: {booking['status']}")

        # Build update fields with case normalization
        update_fields = {}
        
        # Handle status field with case normalization
        if update_data.status is not None:
            status_value = update_data.status
            
            # Convert to string if it's an enum
            if isinstance(status_value, BookingStatus):
                status_value = status_value.value
            
            # Normalize case - accept any case but store as proper case
            status_map = {
                'pending': 'Pending',
                'confirmed': 'Confirmed',
                'checked in': 'Checked In',
                'checked out': 'Checked Out', 
                'cancelled': 'Cancelled',
                'pending': 'Pending',
                'confirmed': 'Confirmed',
                'checked_in': 'Checked In',
                'checked_out': 'Checked Out',
                'cancelled': 'Cancelled'
            }
            
            # Convert input to lowercase for case-insensitive matching
            normalized_status = str(status_value).lower().strip()
            proper_case_status = status_map.get(normalized_status)
            
            if proper_case_status:
                update_fields['status'] = proper_case_status
                print(f"🔄 Normalized status: '{status_value}' -> '{proper_case_status}'")
            else:
                valid_statuses = list(status_map.values())
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid status: '{status_value}'. Valid statuses: {valid_statuses}"
                )
        
        # Handle special_requests field
        if update_data.special_requests is not None:
            update_fields['special_requests'] = update_data.special_requests

        # Check if there are any fields to update
        if not update_fields:
            error_msg = "No valid fields provided for update"
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)

        print(f"🔄 Final update fields: {update_fields}")

        # Update the booking
        result = await db.bookings.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": update_fields}
        )

        if result.modified_count == 0:
            print("⚠️ No changes made to booking - might already have the same values")
        else:
            print(f"✅ Booking updated successfully: {result.modified_count} document modified")

        # Update room status based on booking status if status was updated
        if 'status' in update_fields:
            room_status_map = {
                "Cancelled": "Available",
                "Checked Out": "Available",
                "Confirmed": "Reserved", 
                "Checked In": "Occupied",
                "Pending": "Reserved"
            }
            
            new_room_status = room_status_map.get(update_fields['status'])
            if new_room_status:
                print(f"🏨 Updating room status to: {new_room_status}")
                room_result = await db.rooms.update_one(
                    {"_id": ObjectId(booking["room_id"])},
                    {"$set": {"status": new_room_status}}
                )
                print(f"✅ Room updated: {room_result.modified_count} rooms modified")
            else:
                print(f"⚠️ No room status mapping for: {update_fields['status']}")

        # Fetch updated booking
        updated_booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
        if not updated_booking:
            error_msg = "Failed to fetch updated booking"
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=500, detail=error_msg)

        room = await db.rooms.find_one({"_id": ObjectId(booking["room_id"])})
        room_number = room["roomNumber"] if room else "Unknown"
        
        response_message = "Booking updated successfully"
        print(f"🎉 Update completed: {response_message}")
        
        return {
            "success": True,
            "message": response_message, 
            "data": booking_serializer(updated_booking, room_number),
            "updated_fields": list(update_fields.keys())
        }
        
    except HTTPException as he:
        print(f"🚨 HTTPException in update_booking: {he.detail}")
        raise he
    except Exception as e:
        error_msg = f"Internal server error: {str(e)}"
        print(f"🚨 Exception in update_booking: {error_msg}")
        import traceback
        print(f"🔍 Stack trace: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=error_msg)
    try:
        print(f"🔧 Starting update for booking: {booking_id}")
        print(f"📦 Raw update data: {update_data}")
        print(f"📦 Update data dict: {update_data.dict()}")
        
        # Validate booking ID
        if not ObjectId.is_valid(booking_id):
            error_msg = f"Invalid booking ID format: {booking_id}"
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)

        # Find the booking
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            error_msg = f"Booking not found: {booking_id}"
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=404, detail=error_msg)

        print(f"✅ Found booking: {booking['guest_name']} - Current status: {booking['status']}")

        # Build update fields manually to handle enum/string conversion
        update_fields = {}
        
        # Handle status field
        if update_data.status is not None:
            if isinstance(update_data.status, BookingStatus):
                update_fields['status'] = update_data.status.value
            else:
                # If it's a string, validate it's a valid status
                valid_statuses = [status.value for status in BookingStatus]
                if update_data.status in valid_statuses:
                    update_fields['status'] = update_data.status
                else:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Invalid status: {update_data.status}. Valid statuses: {valid_statuses}"
                    )
        
        # Handle special_requests field
        if update_data.special_requests is not None:
            update_fields['special_requests'] = update_data.special_requests

        # Check if there are any fields to update
        if not update_fields:
            error_msg = "No valid fields provided for update"
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)

        print(f"🔄 Final update fields: {update_fields}")

        # Update the booking
        result = await db.bookings.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": update_fields}
        )

        if result.modified_count == 0:
            print("⚠️ No changes made to booking - might already have the same values")
        else:
            print(f"✅ Booking updated successfully: {result.modified_count} document modified")

        # Update room status based on booking status if status was updated
        if 'status' in update_fields:
            room_status_map = {
                "Cancelled": "Available",
                "Checked Out": "Available",
                "Confirmed": "Reserved", 
                "Checked In": "Occupied",
                "Pending": "Reserved"
            }
            
            new_room_status = room_status_map.get(update_fields['status'])
            if new_room_status:
                print(f"🏨 Updating room status to: {new_room_status}")
                room_result = await db.rooms.update_one(
                    {"_id": ObjectId(booking["room_id"])},
                    {"$set": {"status": new_room_status}}
                )
                print(f"✅ Room updated: {room_result.modified_count} rooms modified")
            else:
                print(f"⚠️ No room status mapping for: {update_fields['status']}")

        # Fetch updated booking
        updated_booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
        if not updated_booking:
            error_msg = "Failed to fetch updated booking"
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=500, detail=error_msg)

        room = await db.rooms.find_one({"_id": ObjectId(booking["room_id"])})
        room_number = room["roomNumber"] if room else "Unknown"
        
        response_message = "Booking updated successfully"
        print(f"🎉 Update completed: {response_message}")
        
        return {
            "success": True,
            "message": response_message, 
            "data": booking_serializer(updated_booking, room_number),
            "updated_fields": list(update_fields.keys())
        }
        
    except HTTPException as he:
        print(f"🚨 HTTPException in update_booking: {he.detail}")
        raise he
    except Exception as e:
        error_msg = f"Internal server error: {str(e)}"
        print(f"🚨 Exception in update_booking: {error_msg}")
        import traceback
        print(f"🔍 Stack trace: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=error_msg)  
    try:
        print(f"🔄 Processing update for booking: {booking_id}")
        
        # Validate booking ID
        if not ObjectId.is_valid(booking_id):
            raise HTTPException(status_code=400, detail="Invalid booking ID")
            
        # Check if booking exists
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Get only the fields that were provided in the request
        update_fields = {}
        
        if update_data.status is not None:
            update_fields['status'] = update_data.status.value
        
        if update_data.special_requests is not None:
            update_fields['special_requests'] = update_data.special_requests
        
        # If no valid fields to update
        if not update_fields:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        
        print(f"📝 Updating fields: {update_fields}")
        
        # Perform the update
        result = await db.bookings.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": update_fields}
        )
        
        if result.modified_count == 0:
            return {
                "success": True,
                "message": "No changes made (values were already set)",
                "data": booking_serializer(booking, "Unknown")
            }
        
        # Update room status if booking status changed
        if 'status' in update_fields:
            room_status_map = {
                "Cancelled": "Available",
                "Checked Out": "Available", 
                "Confirmed": "Reserved",
                "Checked In": "Occupied",
                "Pending": "Reserved"
            }
            
            new_room_status = room_status_map.get(update_fields['status'])
            if new_room_status:
                await db.rooms.update_one(
                    {"_id": ObjectId(booking["room_id"])},
                    {"$set": {"status": new_room_status}}
                )
        
        # Return updated booking
        updated_booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
        room = await db.rooms.find_one({"_id": ObjectId(booking["room_id"])})
        room_number = room["roomNumber"] if room else "Unknown"
        
        return {
            "success": True,
            "message": "Booking updated successfully",
            "data": booking_serializer(updated_booking, room_number)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating booking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
# 🔴 DELETE BOOKING
@booking_router.delete("/{booking_id}")
async def delete_booking(booking_id: str):
    try:
        if not ObjectId.is_valid(booking_id):
            raise HTTPException(status_code=400, detail="Invalid booking ID format")
            
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        # Make room available again
        await db.rooms.update_one(
            {"_id": ObjectId(booking["room_id"])},
            {"$set": {"status": "Available"}}
        )

        await db.bookings.delete_one({"_id": ObjectId(booking_id)})
        
        return {
            "success": True,
            "message": "Booking deleted successfully"
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ Error in delete_booking: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")