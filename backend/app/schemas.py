from pydantic import BaseModel, Field
from typing import Optional, Literal, List
from datetime import datetime

# 회원가입
class SignUp(BaseModel):
    userId: str = Field(..., min_length=4, max_length=20)
    password: str = Field(..., min_length=4)
    userName: str = Field(..., min_length=2, max_length=20)

# 로그인
class Login(BaseModel):
    userId: str
    password: str
    rememberMe: bool = False
    
# 응답용 (비밀번호 제외)
class UserResponse(BaseModel):
    userId: str
    userName: str
    
# 글 쓰기
class Write(BaseModel):
    title: str
    content: str
    status: str

# 파일
class FileResponse(BaseModel):
    id: int
    file_name: str
    file_url: str
    file_size: int
    file_size_formatted: str
    file_type: Literal["image", "document"]
    mime_type: str
    created_at: str
    
class FilesResponse(BaseModel):
    data: List[FileResponse]