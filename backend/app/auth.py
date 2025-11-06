# app/auth.py
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# JWT 설정
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24  # 24시간
REMEMBER_ME_EXPIRE_DAYS = 10 # 자동 로그인, 10일

# Bearer 토큰 스키마
security = HTTPBearer()

def create_access_token(data: dict, remember_me: bool = False) -> str:
    """
    JWT 액세스 토큰 생성
    
    Args:
        data: 토큰에 담을 데이터 (user_id, user_name 등)
        remeber_me: 자동 로그인 여부
        
    Returns:
        JWT 토큰 문자열
    """
    to_encode = data.copy()
    
    if remember_me:
        expire = datetime.utcnow() + timedelta(days=REMEMBER_ME_EXPIRE_DAYS)
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    # 만료 시간 설정
    to_encode.update({"exp": expire})
    
    # JWT 생성
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    JWT 토큰 검증 및 사용자 정보 추출
    
    Args:
        credentials: Authorization 헤더의 Bearer 토큰
    
    Returns:
        사용자 정보 딕셔너리
    
    Raises:
        HTTPException: 토큰이 유효하지 않을 경우
    """
    try:
        # Bearer 토큰에서 실제 토큰 추출
        token = credentials.credentials
        
        # JWT 디코딩
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # 사용자 정보 추출
        user_idx: str = payload.get("user_idx")
        user_name: str = payload.get("user_name")
        
        if user_idx is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="인증 정보가 유효하지 않습니다"
            )
        
        return {
            "user_idx": user_idx,
            "user_name": user_name
        }
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="토큰이 유효하지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"}
        )