from fastapi import FastAPI, HTTPException, status, Depends, Query, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from .schemas import SignUp, UserResponse, Login, Write, FilesResponse
from .database import supabase
from passlib.context import CryptContext
from .auth import create_access_token, verify_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uuid

app = FastAPI(title="CRUD Board API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://board-test-flax.vercel.app",  # Vercel URL
        "http://localhost:3000",  # 로컬 개발용
        "http://localhost:5173",  # Vite 사용 시
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 비밀번호 해싱
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 비밀번호 검증
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# 파일
def format_file_size(bytes: int) -> str:
    """파일 크기를 읽기 쉬운 형식으로 변환"""
    if bytes < 1024:
        return f"{bytes} B"
    elif bytes < 1024 * 1024:
        return f"{bytes / 1024:.1f} KB"
    else:
        return f"{bytes / (1024 * 1024):.1f} MB"

def get_file_type(file_name: str) -> str:
    """파일 확장자로 타입 판단"""
    image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']
    extension = file_name.split('.')[-1].lower()
    return "image" if extension in image_extensions else "document"

    
@app.get("/")
async def root():
    return {"message": "CRUD Board API"}

@app.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def sign_up(signup: SignUp):
    try:
        # 중복 체크
        existing = supabase.table("users").select("user_id").eq("user_id", signup.userId).execute()
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 존재하는 아이디입니다"
            )
        
        # 비밀번호 해싱
        hashed_password = pwd_context.hash(signup.password)

        # 사용자 생성
        result = supabase.table("users").insert({
            "user_id": signup.userId,
            "password": hashed_password,
            "user_name": signup.userName,
            "is_deleted": False
        }).execute()
        
        return UserResponse(
            userId=result.data[0]['user_id'],
            userName=result.data[0]['user_name']
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"회원가입 실패: {str(e)}"
        )

@app.post('/login')
async def login(login: Login):
    try:
        result = supabase.table("users").select("*").eq("user_id", login.userId).execute()

        if not result.data:
            raise HTTPException(
                state_code = status.HTTP_401_UNAUTHORIZED,
                detail="아이디 또는 비밀번호가 일치하지 않습니다."
            )
        
        user = result.data[0]
        
        # 비밀번호 검증
        if not verify_password(login.password, user['password']):
            raise HTTPException(
                status_code = status.HTTP_401_UNAUTHORIZED,
                detail="아이디 또는 비밀번호가 일치하지 않습니다."
            )
        
        # JWT 토큰 생성
        access_token = create_access_token(
            data={
                "user_idx": user['id'],
                "user_name": user['user_name']
            },
            remember_me=login.rememberMe
        )
        
        return {
            "message": "로그인 성공",
            "access_token": access_token,
            "token_type": "bearer",
            "remember_me": login.rememberMe,
            "user": {
                "userIdx": user['id'],
                "userName": user['user_name']
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"로그인 실패 {e}"
        )

# @app.post("/write")
# async def write_post(write: Write, current_user: dict=Depends(verify_token)):
#     try:
#         result = supabase.table("posts").insert({
#             "title": write.title,
#             "content": write.content,
#             "author_id": current_user['user_idx'],
#             "status": write.status,
#             "view_count": 0,
#             "is_deleted": False,
#         }).execute()
        
#         if result.data is None or len(result.data) == 0:
#             raise HTTPException(
#                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#                 detail="글 작성 실패"
#             )
            
#         post = result.data[0]
        
#         return {
#             "message": "글이 작성되었습니다",
#             "data": post
#         }
        
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"글 작성 실패: {str(e)}"
#         )
@app.post("/write")
async def write_post(
    title: str = Form(...),
    content: str = Form(...),
    status: str = Form("draft"),
    image: UploadFile = File(None),
    current_user: dict = Depends(verify_token)
):
    try:
        # 1. 게시글 저장
        post_result = supabase.table("posts").insert({
            "title": title,
            "content": content,
            "status": status,
            "author_id": current_user["user_idx"],
            "view_count": 0,
            "is_deleted": False
        }).execute()
        
        if not post_result.data:
            raise HTTPException(status_code=500, detail="게시글 저장 실패")
        
        post_id = post_result.data[0]["id"]
        
        # 2. 이미지 업로드 (있는 경우)
        if image:
            # 파일 읽기
            file_content = await image.read()
            
            # 파일명 생성
            file_ext = image.filename.split('.')[-1]
            file_name = f"{uuid.uuid4()}.{file_ext}"
            # Supabase Storage에 업로드
            upload_result = supabase.storage.from_('post-images').upload(
                    path=file_name,
                    file=file_content,
                    file_options={
                        "content-type": image.content_type,
                        "upsert": "false"
                    }
                )
            
            # 공개 URL 생성
            public_url = supabase.storage.from_('post-images').get_public_url(file_name)
            
            # post_files 테이블에 저장
            file_result = supabase.table("post_files").insert({
                "post_id": post_id,
                "file_url": public_url,
                "file_name": image.filename,
                "file_size": len(file_content),
                "file_type": image.content_type
            }).execute()
            
            print("파일 저장 완료:", file_result.data)
        
        return {
            "message": "작성 완료",
            "data": post_result.data[0]
        }
    except Exception as e:
        print(f"에러: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"글 작성 실패: {str(e)}"
        )

@app.get("/posts")
async def get_posts(
    page: int = Query(1, ge=1),           # 페이지 번호 (최소 1)
    limit: int = Query(10, ge=1, le=100)  # 페이지 당 개수 (1~100)
):
    try:
        # 페이지네이션 계산
        offset = (page - 1) * limit
        
        # Supabase로 조회
        result = supabase.table("posts")\
            .select("""
                *,
                users:author_id (
                    id,
                    user_name
                )
            """, count="exact")\
            .eq("status", "published")\
            .eq("is_deleted", False)\
            .order("created_at", desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()
        
        total_count = result.count
        total_pages = (total_count + limit - 1) // limit  # 올림 계산
        
        return {
            "data": result.data,
            "page": page,
            "limit": limit,
            "total": total_count,
            "totalPages": total_pages
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"글 목록 불러오기 실패: {str(e)}"
        )

@app.get("/posts/{post_id}")
async def get_post(post_id: int):
    try:
        # 조회수 증가
        current_post = supabase.table('posts')\
            .select('view_count')\
            .eq('id', post_id)\
            .single()\
            .execute()
        
        supabase.table('posts')\
            .update({'view_count': current_post.data['view_count']+1})\
            .eq('id', post_id)\
            .execute()
        
        # 게시글 조회
        result = supabase.table("posts")\
            .select("""
                *,
                users:author_id (
                    id,
                    user_name
                )
            """)\
            .eq("id", post_id)\
            .eq("is_deleted", False)\
            .single()\
            .execute()
        
        return {"data": result.data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"글 상세 불러오기 실패: {str(e)}"
        )

@app.put("/posts/{post_id}")
async def update_post(
    post_id: int,
    write: Write,
    current_user: dict = Depends(verify_token)
):
    try:
        
        check = supabase.table("posts") \
            .select('author_id') \
            .eq('id', post_id) \
            .single() \
            .execute()
        
        if check.data['author_id'] != current_user['user_idx']:
            raise HTTPException(status_code=403, detail='권한이 없습니다.')
        
        result = supabase.table('posts')\
            .update({
                "title": write.title,
                "content": write.content,
                "status": write.status,
                "updated_at": "now()"
            })\
            .eq('id', post_id)\
            .execute()
        
        return { 'message': '수정되었습니다.' }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.delete("/posts/{post_id}")
async def delete_post(
    post_id: int,
    current_user: dict = Depends(verify_token)
):
    try:
        # 1. 게시글 존재 여부 및 작성자 확인
        post = supabase.table("posts")\
            .select("author_id")\
            .eq("id", post_id)\
            .eq("is_deleted", False)\
            .single()\
            .execute()
        
        if not post.data:
            raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다")
        
        # 2. 본인 글인지 확인
        if post.data["author_id"] != current_user["user_idx"]:
            raise HTTPException(status_code=403, detail="삭제 권한이 없습니다")
        # 3. Soft delete (is_deleted = True)
        supabase.table("posts")\
            .update({"is_deleted": True})\
            .eq("id", post_id)\
            .execute()
        
        return {"message": "게시글이 삭제되었습니다"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"삭제 에러: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="삭제에 실패했습니다"
        )
        
@app.get("/posts/{post_id}/comments")
async def get_comments(post_id: int):
    try:
        result = supabase.table("comments")\
            .select("*, user:author_id(id, user_name)")\
            .eq("post_id", post_id)\
            .eq("is_deleted", False)\
            .order("created_at", desc=True)\
            .execute()
        
        print(result)
        return { "data": result.data }
    except HTTPException:
        raise
    except Exception as e:
        print(f"댓글 불러오기 에러: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="댓글을 불러오는데 실패했습니다"
        )
        
@app.post("/posts/{post_id}/comments")
async def create_comments(
    post_id: int,
    comment: dict,
    current_user: dict = Depends(verify_token)
):
    try:
        result = supabase.table("comments").insert({
            "post_id": post_id,
            "content": comment['content'],
            "author_id": current_user['user_idx'],
            "is_deleted": False
        }).execute()
        
        return { "data": result.data[0] }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"댓글 작성 에러: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="댓글 작성에 실패했습니다"
        )

@app.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    current_user: dict = Depends(verify_token)
):
    try:
        comment = supabase.table("comments")\
            .select("author_id")\
            .eq("id", comment_id)\
            .single()\
            .execute()
        
        if comment.data['author_id'] != current_user['user_idx']:
            raise HTTPException(403, '권한 없음')
        
        supabase.table("comments")\
            .update({"is_deleted": True})\
            .eq("id", comment_id)\
            .execute()
        
        return { "message": "댓글 삭제" }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"댓글 삭제 에러: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="댓글 삭제에 실패했습니다"
        )

@app.get("/posts/{post_id}/files", response_model=FilesResponse)
async def get_post_files(post_id: int):
    try:
        response = supabase.table("post_files") \
            .select("*") \
            .eq("post_id", post_id) \
            .order("created_at") \
            .execute()
        
        files = response.data
        
        result = []
        for file in files:
            result.append({
                "id": file["id"],
                "file_name": file["file_name"],
                "file_url": file["file_url"],
                "file_size": file.get("file_size", 0),
                "file_size_formatted": format_file_size(file.get("file_size", 0)),
                "file_type": get_file_type(file["file_name"]),
                "mime_type": file.get("mime_type", "application/octet-stream"),
                "created_at": file["created_at"]
            })
        
        return {'data': result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))