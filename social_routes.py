from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from auth import get_current_user
from main import reports_collection
from pydantic import BaseModel

router = APIRouter()

class CommentCreate(BaseModel):
    text: str

class LikeAction(BaseModel):
    action: str  # "like" or "unlike"

@router.post("/reports/{report_id}/like")
async def toggle_like(
    report_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        report = await reports_collection.find_one({"_id": ObjectId(report_id)})
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        likes = report.get("likes", [])
        user_id = current_user["user_id"]
        
        if user_id in likes:
            # Unlike
            likes.remove(user_id)
            message = "Unliked"
        else:
            # Like
            likes.append(user_id)
            message = "Liked"
        
        await reports_collection.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": {"likes": likes}}
        )
        
        return {
            "message": message,
            "likes_count": len(likes),
            "liked": user_id in likes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reports/{report_id}/comment")
async def add_comment(
    report_id: str,
    comment: CommentCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        report = await reports_collection.find_one({"_id": ObjectId(report_id)})
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        new_comment = {
            "id": str(ObjectId()),
            "user_id": current_user["user_id"],
            "username": current_user["sub"],
            "text": comment.text,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        comments = report.get("comments", [])
        comments.append(new_comment)
        
        await reports_collection.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": {"comments": comments}}
        )
        
        return {
            "message": "Comment added",
            "comment": new_comment,
            "comments_count": len(comments)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/{report_id}/comments")
async def get_comments(report_id: str):
    try:
        report = await reports_collection.find_one({"_id": ObjectId(report_id)})
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        comments = report.get("comments", [])
        return {"comments": comments, "count": len(comments)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/reports/{report_id}/comment/{comment_id}")
async def delete_comment(
    report_id: str,
    comment_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        report = await reports_collection.find_one({"_id": ObjectId(report_id)})
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        comments = report.get("comments", [])
        comment_to_delete = None
        
        for comment in comments:
            if comment["id"] == comment_id:
                if comment["user_id"] != current_user["user_id"]:
                    raise HTTPException(status_code=403, detail="Not authorized")
                comment_to_delete = comment
                break
        
        if comment_to_delete:
            comments.remove(comment_to_delete)
            await reports_collection.update_one(
                {"_id": ObjectId(report_id)},
                {"$set": {"comments": comments}}
            )
            return {"message": "Comment deleted"}
        else:
            raise HTTPException(status_code=404, detail="Comment not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
