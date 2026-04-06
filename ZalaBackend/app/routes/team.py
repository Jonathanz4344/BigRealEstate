"""
Team routes with invitation and notification functionality.
"""
import os
import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.db.crud import team as team_crud
from app.db.crud import team_invitation as invitation_crud
from app.db.crud import notification as notification_crud
from app.db.session import get_db
from app.routes.websocket import send_notification_to_user, send_team_update, send_team_update_to_users

router = APIRouter(prefix="/teams", tags=["Teams"])


@router.post("", response_model=schemas.TeamPublic, status_code=status.HTTP_201_CREATED)
def create_team(team_in: schemas.TeamCreate, db: Session = Depends(get_db)):
    """Create a new team (without setting an admin - use create_team_with_admin for that)."""

    return team_crud.create_team(db, team_in)


@router.post("/with-admin/{admin_user_id}", response_model=schemas.TeamPublic, status_code=status.HTTP_201_CREATED)
def create_team_with_admin(team_in: schemas.TeamCreate, admin_user_id: int, db: Session = Depends(get_db)):
    """
    Create a new team and set the creator as admin.
    
    - **admin_user_id**: The user_id of the person creating the team (they become admin)
    - **team_in**: Team creation data (team_name, optional xp)
    
    Note: Users can only be a member of one team. If the user is already in a team, this will fail.
    """
    try:
        return team_crud.create_team_with_admin(db, team_in, admin_user_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )


@router.get("", response_model=List[schemas.TeamPublic])
def list_teams(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List teams with basic pagination."""

    return team_crud.get_teams(db, skip=skip, limit=limit)


@router.get("/user/{user_id}", response_model=List[schemas.TeamPublic])
def get_user_teams(user_id: int, db: Session = Depends(get_db)):
    """Get all teams that a user belongs to."""
    return team_crud.get_teams_by_user(db, user_id)


@router.get("/leaderboard", response_model=List[schemas.TeamLeaderboardEntry])
def leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    """Return teams sorted by XP for leaderboard views."""

    teams = team_crud.get_leaderboard(db, limit=limit)
    return [
        schemas.TeamLeaderboardEntry(
            team_id=team.team_id, team_name=team.team_name, xp=team.xp
        )
        for team in teams
    ]


@router.get(
    "/{team_id}/users/xp",
    response_model=List[schemas.TeamUserXPEntry],
    summary="List team users ordered by XP",
)
def list_team_users_by_xp(team_id: int, db: Session = Depends(get_db)):
    """Return team members (admins + members) ordered by XP desc."""

    rows = team_crud.get_team_users_by_xp(db, team_id)
    if rows is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    return [
        schemas.TeamUserXPEntry(user_id=row.user_id, username=row.username, xp=row.xp)
        for row in rows
    ]


@router.get("/{team_id}", response_model=schemas.TeamPublic)
def read_team(team_id: int, db: Session = Depends(get_db)):
    """Retrieve a team by id."""

    team = team_crud.get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    return team


@router.get("/{team_id}/members", response_model=schemas.TeamPublic)
def get_team_with_members(team_id: int, db: Session = Depends(get_db)):
    """Retrieve a team with all its members."""

    team = team_crud.get_team_with_members(db, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    return team


# @router.get("/{team_id}/properties", response_model=schemas.TeamPublicWithProperties)
# def get_team_properties(team_id: int, db: Session = Depends(get_db)):
#     """Retrieve a team with its properties."""
#     team = team_crud.get_team_with_properties(db, team_id=team_id)
#     if not team:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
#     return team
#
#
# @router.get("/{team_id}/boards", response_model=schemas.TeamPublicWithBoards)
# def get_team_boards(team_id: int, db: Session = Depends(get_db)):
#     """Retrieve a team with its boards."""
#     team = team_crud.get_team_with_boards(db, team_id=team_id)
#     if not team:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
#     return team
#
#
# @router.get("/{team_id}/boardsproperties", response_model=schemas.TeamPublicWithPropertiesAndBoards)
# def get_team_boards_and_properties(team_id: int, db: Session = Depends(get_db)):
#     """Retrieve a team with BOTH properties and boards."""
#     team = team_crud.get_team_with_boards_and_properties(db, team_id=team_id)
#     if not team:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
#     return team


@router.put("/{team_id}", response_model=schemas.TeamPublic)
async def update_team(team_id: int, team_in: schemas.TeamUpdate, db: Session = Depends(get_db)):
    """Update mutable team fields."""

    team = team_crud.update_team(db, team_id, team_in)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    # Broadcast team update to all team channel subscribers
    try:
        await send_team_update(
            team_id,
            "team_updated",
            {
                "team_id": team.team_id,
                "team_name": team.team_name,
                "xp": team.xp,
            }
        )
    except Exception as e:
        print(f"[WebSocket] Failed to broadcast team update: {e}")

    return team


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team(team_id: int, requester_id: int, db: Session = Depends(get_db)):
    """Delete a team. Only team admins can delete the team."""

    # Check team exists
    team = team_crud.get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    # Check requester is admin of team
    if not team_crud.is_user_admin(db, team_id, requester_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team admins can delete the team"
        )

    # Get all member user IDs before deleting (for WebSocket broadcast)
    member_user_ids = [link.user_id for link in team.member_links]
    team_name = team.team_name

    if not team_crud.delete_team(db, team_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    # Broadcast team_deleted to all members via BOTH channels:
    # 1. Team-specific WebSocket (for those viewing the team)
    # 2. Personal notification WebSocket (for those on the My Teams page)
    try:
        # Send to team channel
        await send_team_update(
            team_id,
            "team_deleted",
            {
                "team_id": team_id,
                "team_name": team_name,
                "member_user_ids": member_user_ids
            }
        )

        # Send to each member's personal notification WebSocket
        await send_team_update_to_users(
            member_user_ids,
            "team_deleted",
            {
                "team_id": team_id,
                "team_name": team_name
            }
        )
    except Exception as e:
        print(f"[WebSocket] Failed to send team_deleted update: {e}")

    return None


@router.post(
    "/{team_id}/members/{user_id}",
    response_model=schemas.TeamPublic,
    summary="Add user as member",
)
def add_member(team_id: int, user_id: int, db: Session = Depends(get_db)):
    """
    Append the user to the member list.
    
    Note: Users can only be a member of one team. If the user is already in a team, this will fail.
    """

    try:
        team = team_crud.add_member(db, team_id, user_id)
        if not team:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
        return team
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )


@router.delete(
    "/{team_id}/members/{user_id}",
    response_model=schemas.TeamPublic,
    summary="Remove user from member list",
)
async def remove_member(team_id: int, user_id: int, db: Session = Depends(get_db)):
    """Remove the user from the member list."""

    team = team_crud.remove_member(db, team_id, user_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    # Send WebSocket update for member removal
    try:
        # Notify team channel (for people viewing the team)
        await send_team_update(
            team_id,
            "member_removed",
            {
                "team_id": team_id,
                "user_id": user_id
            }
        )

        # Notify the kicked user via their personal WebSocket so their "My Teams" updates
        await send_team_update_to_users(
            [user_id],
            "member_kicked",
            {
                "team_id": team_id,
                "team_name": team.team_name
            }
        )

        # Create a notification for the kicked user
        kicked_notification = notification_crud.create_notification(
            db,
            recipient_id=user_id,
            notification_type="team_removed",
            title=f"Removed from {team.team_name}",
            message=f"You have been removed from the team '{team.team_name}'",
            sender_id=None  # System notification
        )

        # Send the notification via WebSocket
        await send_notification_to_user(
            user_id,
            {
                "notification_id": kicked_notification.notification_id,
                "type": kicked_notification.type,
                "title": kicked_notification.title,
                "message": kicked_notification.message,
                "sender_id": kicked_notification.sender_id,
                "viewed": kicked_notification.viewed,
                "created_at": kicked_notification.created_at.isoformat()
            }
        )
    except Exception as e:
        print(f"[WebSocket] Failed to send member_removed update: {e}")

    return team


@router.post(
    "/{team_id}/admins/{user_id}",
    response_model=schemas.TeamPublic,
    summary="Add user as admin",
)
async def add_admin(team_id: int, user_id: int, db: Session = Depends(get_db)):
    """Append the user to the admin list (promote member to admin)."""

    team = team_crud.add_admin(db, team_id, user_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    # Send WebSocket update for role change
    try:
        await send_team_update(
            team_id,
            "member_role_changed",
            {
                "team_id": team_id,
                "user_id": user_id,
                "new_role": "admin"
            }
        )
    except Exception as e:
        print(f"[WebSocket] Failed to send member_role_changed update: {e}")

    return team


@router.delete(
    "/{team_id}/admins/{user_id}",
    response_model=schemas.TeamPublic,
    summary="Remove user from admin list",
)
async def remove_admin(team_id: int, user_id: int, db: Session = Depends(get_db)):
    """Remove the user from the admin list (demote admin to member)."""

    team = team_crud.remove_admin(db, team_id, user_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    # Send WebSocket update for role change
    try:
        await send_team_update(
            team_id,
            "member_role_changed",
            {
                "team_id": team_id,
                "user_id": user_id,
                "new_role": "member"
            }
        )
    except Exception as e:
        print(f"[WebSocket] Failed to send member_role_changed update: {e}")
    return team


# ============================================================================
# TEAM INVITATION ENDPOINTS
# ============================================================================

def _get_smtp_config() -> dict:
    """Get SMTP configuration from environment variables."""
    return {
        "host": os.getenv("SMTP_HOST", ""),
        "port": int(os.getenv("SMTP_PORT", "587")),
        "username": os.getenv("SMTP_USERNAME", ""),
        "password": os.getenv("SMTP_PASSWORD", ""),
        "use_tls": os.getenv("SMTP_USE_TLS", "true").lower() == "true",
        "from_email": os.getenv("SMTP_FROM_EMAIL", ""),
        "from_name": os.getenv("SMTP_FROM_NAME", "Zala"),
    }


def _send_invitation_email(recipient_email: str, team_name: str, sender_name: str = "Someone") -> bool:
    """
    Send invitation email to non-user.
    Returns True if successful, False otherwise.
    """
    config = _get_smtp_config()

    if not config["host"] or not config["username"] or not config["password"]:
        return False

    from_email = config["from_email"] or config["username"]
    from_name = config["from_name"]

    subject = f"You've been invited to join {team_name} on Zala!"
    body = f"""
{sender_name} has invited you to join the team "{team_name}" on Zala.

To accept this invitation, please sign up at Zala and the invitation will be waiting for you.

If you didn't expect this email, you can safely ignore it.
"""

    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">You're Invited! 🎉</h2>
          <p style="color: #333; font-size: 16px;">
            <strong>{sender_name}</strong> has invited you to join the team 
            "<strong>{team_name}</strong>" on Zala.
          </p>
          <p style="color: #333; line-height: 1.6;">
            To accept this invitation, please sign up at Zala and the invitation will be waiting for you.
          </p>
          <br>
          <p style="color: #666; font-size: 14px;">
            If you didn't expect this email, you can safely ignore it.
          </p>
          <p style="color: #666; font-size: 14px;">— {from_name}</p>
        </div>
      </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = recipient_email

    msg.attach(MIMEText(body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        server = smtplib.SMTP(config["host"], config["port"], timeout=30)
        if config["use_tls"]:
            server.starttls()
        server.login(config["username"], config["password"])
        server.sendmail(from_email, [recipient_email], msg.as_string())
        server.quit()
        return True
    except Exception:
        return False


@router.post(
    "/{team_id}/invitations",
    response_model=schemas.TeamInvitationPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Invite someone to the team",
)
async def invite_to_team(
        team_id: int,
        sender_id: int,
        invitation_in: schemas.TeamInvitationCreate,
        db: Session = Depends(get_db)
):
    """
    Invite someone to join the team.
    
    - **team_id**: The team to invite to
    - **sender_id**: The user_id of the admin sending the invitation
    - **invitation_in**: Contains recipient_email
    
    Behavior:
    - If recipient is already a registered user → creates in-app notification
    - If recipient is NOT a user → sends email invitation
    - Creates a TeamInvitation record in both cases
    """
    # Check team exists
    team = team_crud.get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    # Check sender is admin of team
    if not team_crud.is_user_admin(db, team_id, sender_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team admins can send invitations"
        )

    recipient_email = invitation_in.recipient_email

    # Check if there's already a pending invitation
    existing = invitation_crud.check_existing_invitation(db, team_id, recipient_email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You've already sent an invitation to this email. Please wait for them to respond."
        )

    # Check if recipient is already in team
    recipient_user = invitation_crud.get_user_by_email(db, recipient_email)
    if recipient_user and invitation_crud.is_user_in_team(db, team_id, recipient_user.user_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This person is already a member of your team."
        )

    # Check if recipient is already in ANY team (users can only join 1 team)
    if recipient_user and team_crud.is_user_in_any_team(db, recipient_user.user_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This person is already on another team. Each user can only be on one team."
        )

    # Create the invitation
    invitation = invitation_crud.create_invitation(
        db=db,
        team_id=team_id,
        sender_id=sender_id,
        recipient_email=recipient_email,
        recipient_id=recipient_user.user_id if recipient_user else None
    )

    # Get sender info for notification/email
    from app.db.crud import user as user_crud
    sender = user_crud.get_user_by_id(db, sender_id)
    sender_name = sender.username if sender else "A team admin"

    if recipient_user:
        # User exists → create in-app notification
        notification = notification_crud.create_notification(
            db=db,
            recipient_id=recipient_user.user_id,
            notification_type="team_invite",
            title=f"Team Invitation: {team.team_name}",
            message=f"{sender_name} has invited you to join the team '{team.team_name}'",
            sender_id=sender_id,
            invitation_id=invitation.invitation_id
        )

        # Send WebSocket notification for real-time update
        try:
            await send_notification_to_user(
                recipient_user.user_id,
                {
                    "notification_id": notification.notification_id,
                    "type": notification.type,
                    "title": notification.title,
                    "message": notification.message,
                    "sender_id": notification.sender_id,
                    "invitation_id": notification.invitation_id,
                    "viewed": notification.viewed,
                    "created_at": notification.created_at.isoformat() if notification.created_at else None
                }
            )
        except Exception as e:
            # WebSocket send failure shouldn't break the API
            print(f"[WebSocket] Failed to send notification: {e}")
    else:
        # User doesn't exist → send email
        email_sent = _send_invitation_email(recipient_email, team.team_name, sender_name)
        if not email_sent:
            # Log but don't fail - invitation is still created
            pass

    # Return with team_name
    return schemas.TeamInvitationPublic(
        invitation_id=invitation.invitation_id,
        recipient_email=invitation.recipient_email,
        team_id=invitation.team_id,
        team_name=team.team_name,
        status=invitation.status,
        created_at=invitation.created_at
    )


@router.get(
    "/{team_id}/invitations",
    response_model=List[schemas.TeamInvitationPublic],
    summary="Get all invitations for a team (admin only)",
)
def get_team_invitations(team_id: int, requester_id: int, db: Session = Depends(get_db)):
    """
    Get all invitations for a team. 
    Only admins can view team invitations.
    
    - **team_id**: The team ID
    - **requester_id**: The user requesting (must be admin)
    """
    team = team_crud.get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    if not team_crud.is_user_admin(db, team_id, requester_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team admins can view invitations"
        )

    invitations = invitation_crud.get_invitations_by_team(db, team_id)
    return [
        schemas.TeamInvitationPublic(
            invitation_id=inv.invitation_id,
            recipient_email=inv.recipient_email,
            team_id=inv.team_id,
            team_name=team.team_name,
            status=inv.status,
            created_at=inv.created_at
        )
        for inv in invitations
    ]


@router.get(
    "/invitations/user/{user_id}",
    response_model=List[schemas.TeamInvitationPublic],
    summary="Get all pending invitations for a user",
)
def get_user_pending_invitations(user_id: int, db: Session = Depends(get_db)):
    """
    Get all pending invitations for a user.
    This is what the frontend would call to show the user their pending team invites.
    """
    invitations = invitation_crud.get_pending_invitations_by_recipient_id(db, user_id)
    return [
        schemas.TeamInvitationPublic(
            invitation_id=inv.invitation_id,
            recipient_email=inv.recipient_email,
            team_id=inv.team_id,
            team_name=inv.team.team_name if inv.team else None,
            status=inv.status,
            created_at=inv.created_at
        )
        for inv in invitations
    ]


@router.patch(
    "/invitations/{invitation_id}/respond",
    response_model=schemas.TeamInvitationPublic,
    summary="Accept or decline an invitation",
)
async def respond_to_invitation(
        invitation_id: int,
        user_id: int,
        response_in: schemas.TeamInvitationUpdate,
        db: Session = Depends(get_db)
):
    """
    Accept or decline a team invitation.
    
    - **invitation_id**: The invitation to respond to
    - **user_id**: The user responding (must be the recipient)
    - **response_in**: Contains status (True = Accept, False = Decline)
    
    If accepted, user is automatically added to the team as a member.
    """
    invitation = invitation_crud.get_invitation_by_id(db, invitation_id)
    if not invitation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")

    # Check this user is the recipient
    if invitation.recipient_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only respond to your own invitations"
        )

    # Check invitation is still pending
    if invitation.status is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This invitation has already been responded to"
        )

    # If accepting, check if user is already in a team (users can only join 1 team)
    if response_in.status:
        if team_crud.is_user_in_any_team(db, user_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You're already on a team. You'll need to leave your current team before joining another one."
            )

    # Update invitation status
    invitation = invitation_crud.update_invitation_status(db, invitation_id, response_in.status)

    # If accepted, add user to team
    if response_in.status:
        team_crud.add_member(db, invitation.team_id, user_id, role="member")

    # Update the notification to show accepted/declined status (keep it visible)
    notification_crud.update_notification_for_response(db, invitation_id, response_in.status)

    # Send WebSocket update to team watchers
    try:
        # Send invitation status update
        await send_team_update(
            invitation.team_id,
            "invitation_update",
            {
                "invitation_id": invitation.invitation_id,
                "recipient_email": invitation.recipient_email,
                "status": invitation.status,
                "team_id": invitation.team_id
            }
        )

        # If accepted, also send member_joined event with user details
        if response_in.status:
            # Get user info to send in WebSocket
            from app.db.crud import user as user_crud
            joined_user = user_crud.get_user_by_id(db, user_id)

            # Get the full team (members + properties + boards) for the joining user
            joined_team = team_crud.get_team_full(db, invitation.team_id)

            await send_team_update(
                invitation.team_id,
                "member_joined",
                {
                    "team_id": invitation.team_id,
                    "user_id": user_id,
                    "email": invitation.recipient_email,
                    "username": joined_user.username if joined_user else invitation.recipient_email,
                    "profile_pic": joined_user.profile_pic if joined_user else None,
                    "first_name": joined_user.contact.first_name if joined_user and joined_user.contact else None,
                    "last_name": joined_user.contact.last_name if joined_user and joined_user.contact else None,
                    "role": "member"
                }
            )

            # Send team_joined to the user who accepted so their "My Teams" updates
            if joined_team:
                team_data = schemas.TeamPublic.model_validate(joined_team).model_dump(
                    mode="json", by_alias=True
                )
                await send_team_update_to_users(
                    [user_id],
                    "team_joined",
                    team_data
                )
    except Exception as e:
        print(f"[WebSocket] Failed to send team update: {e}")

    return schemas.TeamInvitationPublic(
        invitation_id=invitation.invitation_id,
        recipient_email=invitation.recipient_email,
        team_id=invitation.team_id,
        team_name=invitation.team.team_name if invitation.team else None,
        status=invitation.status,
        created_at=invitation.created_at
    )


@router.delete(
    "/invitations/{invitation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cancel/delete an invitation (admin only)",
)
def cancel_invitation(invitation_id: int, requester_id: int, db: Session = Depends(get_db)):
    """
    Cancel/delete a pending invitation.
    Only admins of the team can cancel invitations.
    """
    invitation = invitation_crud.get_invitation_by_id(db, invitation_id)
    if not invitation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")

    if not team_crud.is_user_admin(db, invitation.team_id, requester_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team admins can cancel invitations"
        )

    # Delete related notifications first
    notification_crud.delete_notifications_by_invitation(db, invitation_id)

    # Delete the invitation
    invitation_crud.delete_invitation(db, invitation_id)
    return None


@router.get(
    "/{team_id}/role/{user_id}",
    summary="Check a user's role in a team",
)
def get_user_role_in_team(team_id: int, user_id: int, db: Session = Depends(get_db)):
    """
    Check what role a user has in a team.
    Returns: {"role": "admin" | "member" | null}
    """
    team = team_crud.get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    role = team_crud.get_user_role_in_team(db, team_id, user_id)
    return {"team_id": team_id, "user_id": user_id, "role": role}


# ============================================================================
# TEAM ANNOUNCEMENTS ENDPOINTS
# ============================================================================

from app.db.crud import team_announcement as announcement_crud


@router.post(
    "/{team_id}/announcements",
    response_model=schemas.AnnouncementPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Create a team announcement (admin only)",
)
async def create_announcement(
        team_id: int,
        author_id: int,
        announcement_in: schemas.AnnouncementCreate,
        db: Session = Depends(get_db)
):
    """
    Create a new team announcement. Only team admins can post announcements.
    
    - **team_id**: The team to post the announcement to
    - **author_id**: The user_id of the admin posting (must be a team admin)
    - **announcement_in**: Contains title and message
    
    This will broadcast the announcement to all team members in real-time via WebSocket.
    """
    # Check team exists
    team = team_crud.get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    # Check author is admin of team
    if not team_crud.is_user_admin(db, team_id, author_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team admins can post announcements."
        )

    # Create the announcement
    announcement = announcement_crud.create_announcement(
        db=db,
        team_id=team_id,
        author_id=author_id,
        announcement_in=announcement_in
    )

    # Get author info for the WebSocket broadcast
    from app.db.crud import user as user_crud
    author = user_crud.get_user_by_id(db, author_id)
    author_name = author.username if author else "Admin"

    # Broadcast to all team members via WebSocket
    try:
        # Get all member user IDs
        member_user_ids = [link.user_id for link in team.member_links]

        announcement_data = {
            "announcement_id": announcement.announcement_id,
            "team_id": team_id,
            "team_name": team.team_name,
            "author_id": author_id,
            "author_name": author_name,
            "author_profile_pic": author.profile_pic if author else None,
            "title": announcement.title,
            "message": announcement.message,
            "created_at": announcement.created_at.isoformat() if announcement.created_at else None
        }

        # Send to team channel (for those viewing the team page)
        await send_team_update(
            team_id,
            "new_announcement",
            announcement_data
        )

        # Send to each member's personal notification WebSocket
        await send_team_update_to_users(
            member_user_ids,
            "team_announcement",
            announcement_data
        )
    except Exception as e:
        print(f"[WebSocket] Failed to broadcast announcement: {e}")

    return announcement


@router.get(
    "/{team_id}/announcements",
    response_model=List[schemas.AnnouncementPublic],
    summary="Get team announcements",
)
def get_team_announcements(
        team_id: int,
        user_id: int,
        skip: int = 0,
        limit: int = 50,
        db: Session = Depends(get_db)
):
    """
    Get all announcements for a team. User must be a member of the team.
    
    - **team_id**: The team ID
    - **user_id**: The requesting user (must be a team member)
    - **skip**: Pagination offset
    - **limit**: Max results to return
    """
    # Check team exists
    team = team_crud.get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    # Check user is a member of the team
    role = team_crud.get_user_role_in_team(db, team_id, user_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a team member to view announcements."
        )

    return announcement_crud.get_announcements_by_team(db, team_id, skip=skip, limit=limit)


@router.get(
    "/{team_id}/announcements/{announcement_id}",
    response_model=schemas.AnnouncementPublic,
    summary="Get a specific announcement",
)
def get_announcement(
        team_id: int,
        announcement_id: int,
        user_id: int,
        db: Session = Depends(get_db)
):
    """Get a specific announcement by ID."""
    # Check user is a member of the team
    role = team_crud.get_user_role_in_team(db, team_id, user_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a team member to view announcements."
        )

    announcement = announcement_crud.get_announcement_by_id(db, announcement_id)
    if not announcement or announcement.team_id != team_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")

    return announcement


@router.put(
    "/{team_id}/announcements/{announcement_id}",
    response_model=schemas.AnnouncementPublic,
    summary="Update an announcement (admin only)",
)
async def update_announcement(
        team_id: int,
        announcement_id: int,
        user_id: int,
        announcement_in: schemas.AnnouncementUpdate,
        db: Session = Depends(get_db)
):
    """Update an existing announcement. Only team admins can update announcements."""
    # Check admin
    if not team_crud.is_user_admin(db, team_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team admins can update announcements."
        )

    announcement = announcement_crud.get_announcement_by_id(db, announcement_id)
    if not announcement or announcement.team_id != team_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")

    updated = announcement_crud.update_announcement(db, announcement_id, announcement_in)

    # Broadcast update to team
    try:
        await send_team_update(
            team_id,
            "announcement_updated",
            {
                "announcement_id": announcement_id,
                "team_id": team_id,
                "title": updated.title,
                "message": updated.message,
                "updated_at": updated.updated_at.isoformat() if updated.updated_at else None
            }
        )
    except Exception as e:
        print(f"[WebSocket] Failed to broadcast announcement update: {e}")

    return updated


@router.delete(
    "/{team_id}/announcements/{announcement_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an announcement (admin only)",
)
async def delete_announcement(
        team_id: int,
        announcement_id: int,
        user_id: int,
        db: Session = Depends(get_db)
):
    """Delete an announcement. Only team admins can delete announcements."""
    # Check admin
    if not team_crud.is_user_admin(db, team_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team admins can delete announcements."
        )

    announcement = announcement_crud.get_announcement_by_id(db, announcement_id)
    if not announcement or announcement.team_id != team_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")

    announcement_crud.delete_announcement(db, announcement_id)

    # Broadcast deletion to team
    try:
        await send_team_update(
            team_id,
            "announcement_deleted",
            {
                "announcement_id": announcement_id,
                "team_id": team_id
            }
        )
    except Exception as e:
        print(f"[WebSocket] Failed to broadcast announcement deletion: {e}")

    return None


@router.post("/{team_id}/properties/{property_id}", response_model=schemas.TeamPublicWithProperties,
             summary="Link Property", tags=["Team Properties Link"])
async def add_property(team_id: int, property_id: int, db: Session = Depends(get_db)):
    """Assign a Property to a Team."""
    db_team = team_crud.add_property_to_team(db=db, team_id=team_id, property_id=property_id)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team or Property not found")

    # Broadcast property linked event to team channel
    try:
        await send_team_update(
            team_id,
            "team_property_linked",
            {"team_id": team_id, "property_id": property_id}
        )
    except Exception as e:
        print(f"[WebSocket] Failed to broadcast property linked: {e}")

    return db_team


@router.delete("/{team_id}/properties/{property_id}", response_model=schemas.TeamPublicWithProperties,
               summary="Unlink Property", tags=["Team Properties Link"])
async def remove_property(team_id: int, property_id: int, db: Session = Depends(get_db)):
    """Unassign a Property from a Team."""
    db_team = team_crud.remove_property_from_team(db=db, team_id=team_id, property_id=property_id)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team or Property not found")

    # Broadcast property unlinked event to team channel
    try:
        await send_team_update(
            team_id,
            "team_property_unlinked",
            {"team_id": team_id, "property_id": property_id}
        )
    except Exception as e:
        print(f"[WebSocket] Failed to broadcast property unlinked: {e}")

    return db_team


@router.post("/{team_id}/boards/{board_id}", response_model=schemas.TeamPublicWithBoards, summary="Link Board",
             tags=["Team Properties Link"])
async def add_board(team_id: int, board_id: int, db: Session = Depends(get_db)):
    """Assign a Board to a Team."""
    db_team = team_crud.add_board_to_team(db=db, team_id=team_id, board_id=board_id)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team or Board not found")

    # Broadcast board linked event to team channel
    try:
        await send_team_update(
            team_id,
            "team_board_linked",
            {"team_id": team_id, "board_id": board_id}
        )
    except Exception as e:
        print(f"[WebSocket] Failed to broadcast board linked: {e}")

    return db_team


@router.delete("/{team_id}/boards/{board_id}", response_model=schemas.TeamPublicWithBoards, summary="Unlink Board",
               tags=["Team Properties Link"])
async def remove_board(team_id: int, board_id: int, db: Session = Depends(get_db)):
    """Unassign a Board from a Team."""
    db_team = team_crud.remove_board_from_team(db=db, team_id=team_id, board_id=board_id)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team or Board not found")

    # Broadcast board unlinked event to team channel
    try:
        await send_team_update(
            team_id,
            "team_board_unlinked",
            {"team_id": team_id, "board_id": board_id}
        )
    except Exception as e:
        print(f"[WebSocket] Failed to broadcast board unlinked: {e}")

    return db_team
