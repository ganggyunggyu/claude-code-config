---
description: Python FastAPI Router 자동 생성
argument-hint: <라우터명> [옵션]
---

# FastAPI Router 생성

Python FastAPI 라우터를 자동으로 생성합니다.

## 사용법

```
/router analysis
/router users --crud
/router auth
```

## 기본 Router

### 단순 Router
```python
# routers/analysis/__init__.py
from fastapi import APIRouter

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.get("/")
async def get_analysis():
    return {"message": "Analysis endpoint"}

@router.post("/upload")
async def upload_text(text: str):
    return {"text": text, "length": len(text)}
```

## CRUD Router

### 전체 CRUD
```python
# routers/users/__init__.py
from fastapi import APIRouter, HTTPException, status
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/users", tags=["users"])

# Pydantic Models
class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None

class UserResponse(UserBase):
    id: str

    class Config:
        from_attributes = True

# In-memory storage (실제로는 DB 사용)
users_db = {}

@router.get("/", response_model=List[UserResponse])
async def get_users():
    """Get all users"""
    return list(users_db.values())

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """Get user by ID"""
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return users_db[user_id]

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    """Create new user"""
    user_id = str(len(users_db) + 1)
    user_dict = user.model_dump()
    user_dict["id"] = user_id
    users_db[user_id] = user_dict
    return user_dict

@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user: UserUpdate):
    """Update user"""
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    stored_user = users_db[user_id]
    update_data = user.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        stored_user[key] = value

    users_db[user_id] = stored_user
    return stored_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str):
    """Delete user"""
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    del users_db[user_id]
    return None
```

## 파일 업로드 Router

```python
# routers/upload/__init__.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/file")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file"""
    try:
        file_path = UPLOAD_DIR / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "size": file_path.stat().st_size
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        file.file.close()

@router.post("/multiple")
async def upload_multiple_files(files: List[UploadFile] = File(...)):
    """Upload multiple files"""
    uploaded_files = []

    for file in files:
        file_path = UPLOAD_DIR / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        uploaded_files.append({
            "filename": file.filename,
            "size": file_path.stat().st_size
        })

    return {"files": uploaded_files}
```

## 인증 Router

```python
# routers/auth/__init__.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    username: str
    email: str | None = None

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
        return User(username=username)
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login and get access token"""
    # 실제로는 DB에서 사용자 확인
    if form_data.username != "admin" or form_data.password != "password":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user
```

## 비동기 처리 Router

```python
# routers/tasks/__init__.py
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
import asyncio

router = APIRouter(prefix="/tasks", tags=["tasks"])

class Task(BaseModel):
    name: str
    duration: int = 10

def process_task(task_name: str, duration: int):
    """Simulated long-running task"""
    import time
    time.sleep(duration)
    print(f"Task {task_name} completed after {duration}s")

@router.post("/create")
async def create_task(task: Task, background_tasks: BackgroundTasks):
    """Create a background task"""
    background_tasks.add_task(process_task, task.name, task.duration)
    return {"message": f"Task {task.name} is being processed in background"}

@router.get("/async-example")
async def async_example():
    """Example of async operations"""
    await asyncio.sleep(1)  # Simulate async operation
    return {"message": "Async operation completed"}
```

## 의존성 주입

```python
# dependencies.py
from fastapi import Header, HTTPException, status

async def verify_token(x_token: str = Header(...)):
    if x_token != "secret-token":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid X-Token header"
        )

async def verify_key(x_key: str = Header(...)):
    if x_key != "secret-key":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid X-Key header"
        )
    return x_key

# routers/protected/__init__.py
from fastapi import APIRouter, Depends
from dependencies import verify_token, verify_key

router = APIRouter(
    prefix="/protected",
    tags=["protected"],
    dependencies=[Depends(verify_token)]  # 전체 라우터에 적용
)

@router.get("/")
async def protected_route():
    return {"message": "This is a protected route"}

@router.get("/double-protected")
async def double_protected(key: str = Depends(verify_key)):
    return {"message": "This is double protected", "key": key}
```

## 에러 처리

```python
# routers/items/__init__.py
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, ValidationError

router = APIRouter(prefix="/items", tags=["items"])

class Item(BaseModel):
    name: str
    price: float
    quantity: int

@router.post("/")
async def create_item(item: Item):
    if item.price < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Price cannot be negative"
        )

    if item.quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity cannot be negative"
        )

    return {"item": item, "total": item.price * item.quantity}
```

## main.py 통합

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers import
from routers import analysis, users, auth, upload

app = FastAPI(title="My API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analysis.router)
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(upload.router)

@app.get("/")
async def root():
    return {"message": "Welcome to My API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## 디렉토리 구조

```
project/
  ├── main.py
  ├── routers/
  │   ├── __init__.py
  │   ├── users/
  │   │   └── __init__.py
  │   ├── auth/
  │   │   └── __init__.py
  │   └── analysis/
  │       └── __init__.py
  ├── models/
  │   └── user.py
  └── dependencies.py
```

## 생성 프로세스

### 1단계: Router 종류 결정
- 기본 Router
- CRUD Router
- 파일 업로드
- 인증

### 2단계: 파일 생성
```bash
routers/{router_name}/__init__.py
```

### 3단계: Pydantic 모델 정의
```python
class ItemBase(BaseModel):
    name: str
    price: float
```

### 4단계: Endpoint 작성
```python
@router.get("/")
async def get_items():
    return []
```

## 사용 예시

```
사용자: /router analysis
```

**생성 파일:**
- `routers/analysis/__init__.py`
- 기본 GET, POST 엔드포인트 포함

```
사용자: /router users --crud
```

**생성 파일:**
- `routers/users/__init__.py`
- 전체 CRUD (GET, POST, PATCH, DELETE) 포함
- Pydantic 모델 포함

## 주의사항

- **타입 힌트**: 모든 함수에 타입 힌트 필수
- **Pydantic**: 요청/응답 모델 정의
- **에러 처리**: HTTPException 사용
- **비동기**: async/await 사용

## 참고

- FastAPI 공식 문서: https://fastapi.tiangolo.com/
- Pydantic: https://docs.pydantic.dev/
- Uvicorn: https://www.uvicorn.org/
