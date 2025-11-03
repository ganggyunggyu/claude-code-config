# Python/FastAPI 개발 지침

<version>
Python 3.8+ 와 현대적 프레임워크(FastAPI, Django, Flask) 중심으로 작성
</version>

<imports>
## 절대 Import 필수

```python
# ✅ 반드시 절대 경로 사용
from src.entities.user import User
from src.shared.utils import format_date
from src.services.auth import AuthService

# ❌ 상대 경로 최소화 (같은 패키지 내에서만 허용)
from ..entities.user import User
from ...shared.utils import format_date
```

### Import 순서 표준

```python
# 1. Python 표준 라이브러리
import os
import sys
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

# 2. 서드파티 라이브러리 (알파벳 순)
from fastapi import FastAPI, APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import Column, String

# 3. 프로젝트 내부 모듈 (계층 순서)
from src.app.config import get_settings
from src.shared.exceptions import UserNotFoundError
from src.entities.user import User
from src.services.user_service import UserService
```

</imports>

<type_hints>

## 타입 힌팅 필수

```python
from typing import Optional, List, Dict, Any
from __future__ import annotations

# ✅ 모든 함수에 타입 힌팅 필수
def get_user_info(user_id: str, include_profile: bool = True) -> Optional[Dict[str, Any]]:
    """사용자 정보 조회"""
    pass

def process_data(data: List[Dict[str, Any]]) -> List[User]:
    """데이터 처리"""
    pass

# ❌ 타입 힌팅 없는 함수 금지
def get_user_info(user_id, include_profile=True):
    pass
```

</type_hints>

<pydantic>
## Pydantic 모델 사용

```python
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional

class User(BaseModel):
    """사용자 모델"""
    id: str = Field(..., description="사용자 ID")
    username: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., regex=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    created_at: datetime = Field(default_factory=datetime.now)
    is_active: bool = Field(default=True)

    @validator('username')
    def validate_username(cls, v):
        if not v.strip():
            raise ValueError('사용자명은 비어있을 수 없습니다')
        return v.strip()

# ❌ 딕셔너리나 일반 클래스 금지
user_dict = {"id": "123", "username": "john"}
```

</pydantic>

<architecture>
## FSD 스타일 아키텍처

```
src/
├── app/
│   ├── config/
│   ├── middleware/
│   ├── dependencies/
│   └── exceptions/
├── pages/
├── widgets/
├── features/
├── entities/
├── shared/
└── services/
```

### 계층별 Import 규칙

```python
# entities에서 사용 가능
from src.shared import utils, exceptions  # ✅

# features에서 사용 가능
from src.shared import utils, database    # ✅
from src.entities import User, Product     # ✅

# widgets에서 사용 가능
from src.shared import utils              # ✅
from src.entities import User             # ✅
from src.features import auth             # ✅

# pages에서 사용 가능
from src.shared import utils              # ✅
from src.entities import User             # ✅
from src.features import auth             # ✅
from src.widgets import user_dashboard    # ✅
```

</architecture>

<naming>
## 네이밍 컨벤션 (엄격)

### 변수 & 함수 - snake_case

```python
# ✅ 올바른 네이밍
user_name = "john"
user_list = ["john", "jane"]
is_authenticated = True
has_permission = False

# 함수 (동사 + 명사)
def get_user_by_id(user_id: str) -> Optional[User]:
    pass

def create_user_profile(user_data: Dict[str, Any]) -> User:
    pass

# ❌ 절대 금지
userName = "john"          # camelCase 금지
userList = ["john"]        # camelCase 금지
isAuthenticated = True     # camelCase 금지
```

### 클래스 - PascalCase

```python
# ✅ 올바른 클래스명
class UserService:
    pass

class DatabaseConnection:
    pass

# ❌ 잘못된 클래스명
class userService:         # 소문자 시작 금지
class database_connection: # snake_case 금지
```

### 상수 - UPPER_SNAKE_CASE

```python
# ✅ 올바른 상수명
API_BASE_URL = "https://api.example.com"
DATABASE_URL = "postgresql://..."
MAX_RETRY_COUNT = 3
DEFAULT_PAGE_SIZE = 20
JWT_SECRET_KEY = "your-secret"

# ❌ 잘못된 상수명
apiBaseUrl = "https://..."  # camelCase 금지
```

### 패키지 & 모듈 - snake_case

```python
# ✅ 올바른 파일명
auth_service.py
user_repository.py
email_sender.py

# ❌ 잘못된 파일명
authService.py
UserRepository.py
```

### 비공개 변수/메서드

```python
class UserService:
    def __init__(self):
        self._database_url = "secret"      # 보호된 변수
        self.__api_key = "secret"          # 강한 비공개

    def _validate_user_data(self, data: Dict) -> bool:  # 보호된 메서드
        pass

    def get_user_profile(self, user_id: str) -> User:   # 공개 메서드
        pass
```

</naming>

<fastapi>
## FastAPI 패턴

### 라우터 기본 템플릿

```python
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from src.entities.user import User, UserCreate
from src.features.auth import get_current_user
from src.services.user_service import UserService
from src.shared.exceptions import UserNotFoundError

router = APIRouter(prefix="/api/v1/users", tags=["users"])

@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    user_service: UserService = Depends(get_user_service)
) -> User:
    """새로운 사용자 생성"""
    try:
        new_user = await user_service.create_user(user_data)
        return new_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user)
) -> User:
    """사용자 정보 조회"""
    try:
        user = await user_service.get_user_by_id(user_id)
        return user
    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
```

### 의존성 주입

```python
from fastapi import Depends
from typing import Annotated

async def get_database_service() -> DatabaseService:
    settings = get_settings()
    return DatabaseService(settings.database_url)

async def get_user_service(
    db: DatabaseService = Depends(get_database_service)
) -> UserService:
    return UserService(db)

UserServiceDep = Annotated[UserService, Depends(get_user_service)]
```

</fastapi>

<service_layer>

## 서비스 레이어 패턴

```python
from typing import List, Optional
from abc import ABC, abstractmethod

class UserServiceInterface(ABC):
    """사용자 서비스 인터페이스"""

    @abstractmethod
    async def create_user(self, user_data: UserCreate) -> User:
        pass

    @abstractmethod
    async def get_user_by_id(self, user_id: str) -> User:
        pass

class UserService(UserServiceInterface):
    """사용자 서비스 구현"""

    def __init__(self, database_service: DatabaseService):
        self._db = database_service

    async def create_user(self, user_data: UserCreate) -> User:
        existing_user = await self._db.find_user_by_email(user_data.email)
        if existing_user:
            raise UserAlreadyExistsError(f"이메일 {user_data.email}이 이미 존재합니다")

        user = User(
            id=self._generate_user_id(),
            username=user_data.username,
            email=user_data.email
        )

        created_user = await self._db.save_user(user)
        return created_user

    def _generate_user_id(self) -> str:
        import uuid
        return str(uuid.uuid4())
```

</service_layer>

<pydantic_models>

## Pydantic 모델 패턴

### 엔티티 모델

```python
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    MODERATOR = "moderator"

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr = Field(...)
    is_active: bool = Field(default=True)
    role: UserRole = Field(default=UserRole.USER)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

    @validator('password')
    def validate_password(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('비밀번호에 대문자가 포함되어야 합니다')
        return v

class User(UserBase):
    id: str = Field(...)
    created_at: datetime = Field(default_factory=datetime.now)

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
```

### API 응답 모델

```python
from typing import Generic, TypeVar, List

T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    success: bool = Field(...)
    data: Optional[T] = Field(None)
    message: str = Field("")
    timestamp: datetime = Field(default_factory=datetime.now)

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T] = Field(...)
    total: int = Field(...)
    page: int = Field(...)
    size: int = Field(...)
```

</pydantic_models>

<exceptions>
## 예외 처리

```python
class BaseAppException(Exception):
    def __init__(self, message: str, code: str = "APP_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)

class UserNotFoundError(BaseAppException):
    def __init__(self, identifier: str):
        message = f"사용자를 찾을 수 없습니다: {identifier}"
        super().__init__(message, "USER_NOT_FOUND")

class ValidationError(BaseAppException):
    def __init__(self, message: str, field: str = None):
        self.field = field
        super().__init__(message, "VALIDATION_ERROR")
```

</exceptions>

<package_management>

## 패키지 관리 (venv + uv)

### 가상환경 생성

```bash
# 가상환경 생성
python -m venv venv

# 활성화
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

### uv 사용

```bash
# uv 설치
curl -LsSf https://astral.sh/uv/install.sh | sh

# 패키지 설치 (매우 빠름)
uv pip install fastapi uvicorn pydantic

# requirements.txt에서 설치
uv pip install -r requirements.txt

# 패키지 목록 저장
uv pip freeze > requirements.txt
```

### pyproject.toml

```toml
[project]
name = "my-project"
version = "1.0.0"
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "pydantic>=2.5.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "black>=23.0.0",
]
```

</package_management>

<checklist>
## 개발 체크리스트

### 네이밍

- [ ] 변수/함수는 snake_case
- [ ] 클래스는 PascalCase
- [ ] 상수는 UPPER_SNAKE_CASE
- [ ] camelCase 완전 제거

### 타입 힌팅

- [ ] 모든 함수에 타입 힌팅
- [ ] typing 모듈 사용
- [ ] from **future** import annotations

### 구조

- [ ] Import 순서 표준 준수
- [ ] FSD 아키텍처 계층 준수
- [ ] 의존성 주입 사용
- [ ] 인터페이스 정의
      </checklist>
