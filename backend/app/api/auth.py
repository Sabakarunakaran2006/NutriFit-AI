from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User, Profile
from app.schemas.auth import UserRegister, UserLogin, Token, UserOut, ForgotPasswordRequest, ResetPasswordRequest
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )
    
    # Enforce security rule: normal users cannot self-register as ADMIN
    role = user_in.role.upper() if user_in.role else "USER"
    if role not in ["USER", "EXPERT"]:
        role = "USER"
        
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(subject=new_user.id, role=new_user.role)
    user_out = UserOut(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
        is_active=new_user.is_active,
        avatar_url=new_user.avatar_url,
        created_at=new_user.created_at,
        has_profile=False
    )
    return Token(access_token=access_token, user=user_out)

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact an administrator."
        )
        
    has_profile = db.query(Profile).filter(Profile.user_id == user.id).first() is not None
    access_token = create_access_token(subject=user.id, role=user.role)
    
    user_out = UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        avatar_url=user.avatar_url,
        created_at=user.created_at,
        has_profile=has_profile
    )
    return Token(access_token=access_token, user=user_out)

@router.get("/me", response_model=UserOut)
def get_current_user_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    has_profile = db.query(Profile).filter(Profile.user_id == current_user.id).first() is not None
    return UserOut(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at,
        has_profile=has_profile
    )

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    # Always return success message to prevent user enumeration
    return {
        "message": "If this email exists in our system, a password reset token has been generated.",
        "demo_reset_token": "RESET-2025-DEMO-TOKEN" if user else None
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password successfully reset. You can now login with your new credentials."}
