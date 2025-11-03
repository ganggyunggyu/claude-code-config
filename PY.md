# 파이썬 개발 지침

모든 답변은 **Python 3.8+** 와 **현대적 프레임워크(FastAPI, Django, Flask)** 중심으로 작성해야 한다.  
아래의 코드 컨벤션과 규칙을 무조건 지켜야 한다.

---

## 🎯 **Python 개발 시 필수 준수사항**

### **1. 절대 임포트 사용 필수**

```python
# ✅ 반드시 이렇게 import (절대 경로)
from src.entities.user import User
from src.shared.utils import format_date
from src.services.auth import AuthService

# ❌ 상대 경로 최소화 (같은 패키지 내에서만 허용)
from ..entities.user import User
from ...shared.utils import format_date
```

### **2. 타입 힌팅 필수 사용**

```python
# ✅ 모든 함수에서 타입 힌팅 필수
from typing import Optional, List, Dict, Any, Union
from __future__ import annotations

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

### **3. Pydantic 모델 사용 패턴**

```python
# ✅ 모든 데이터 구조는 Pydantic 사용
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

# ❌ 딕셔너리나 일반 클래스 사용 금지 (데이터 전송용)
user_dict = {"id": "123", "username": "john"}  # 금지
```

---

## 🏗️ **FSD 스타일 Python 아키텍처**

```
src/
├── app/                   # 앱 초기화, 설정, 미들웨어
│   ├── config/           # 환경설정, 데이터베이스 설정
│   ├── middleware/       # FastAPI/Django 미들웨어
│   ├── dependencies/     # 의존성 주입
│   └── exceptions/       # 전역 예외 처리
├── pages/                # API 엔드포인트 (FastAPI) / Views (Django)
├── widgets/              # 독립적인 비즈니스 컴포넌트
├── features/             # 비즈니스 기능 (인증, 결제, 알림)
├── entities/             # 도메인 엔티티 (사용자, 상품, 주문)
├── shared/               # 공용 유틸리티, 서비스, 헬퍼
└── services/             # 외부 서비스 연동 (AI, 결제, 메일)
```

### **계층별 import 규칙**

```python
# entities에서 사용 가능한 import
from src.shared import utils, exceptions  # ✅

# features에서 사용 가능한 import
from src.shared import utils, database    # ✅
from src.entities import User, Product     # ✅

# widgets에서 사용 가능한 import
from src.shared import utils              # ✅
from src.entities import User             # ✅
from src.features import auth             # ✅

# pages에서 사용 가능한 import
from src.shared import utils              # ✅
from src.entities import User             # ✅
from src.features import auth             # ✅
from src.widgets import user_dashboard    # ✅
```

---

## 📝 **Python 네이밍 컨벤션 (엄격)**

### **1. 변수 & 함수 - snake_case**

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

def update_user_status(user_id: str, is_active: bool) -> bool:
    pass

def handle_user_login(credentials: LoginCredentials) -> AuthResult:
    pass

# ❌ 절대 금지
userName = "john"          # camelCase 절대 금지
userList = ["john"]        # camelCase 절대 금지
isAuthenticated = True     # camelCase 절대 금지
hasPermission = False      # camelCase 절대 금지
```

### **2. 클래스 - PascalCase**

```python
# ✅ 올바른 클래스명
class UserService:
    pass

class DatabaseConnection:
    pass

class AuthenticationManager:
    pass

class PaymentProcessor:
    pass

# ❌ 잘못된 클래스명
class userService:         # 소문자 시작 금지
class database_connection: # snake_case 금지
class authManager:         # camelCase 금지
```

### **3. 상수 - UPPER_SNAKE_CASE**

```python
# ✅ 올바른 상수명
API_BASE_URL = "https://api.example.com"
DATABASE_URL = "postgresql://..."
MAX_RETRY_COUNT = 3
DEFAULT_PAGE_SIZE = 20
JWT_SECRET_KEY = "your-secret"

# ❌ 잘못된 상수명
apiBaseUrl = "https://..."  # camelCase 금지
databaseUrl = "postgresql"  # camelCase 금지
maxRetryCount = 3          # camelCase 금지
```

### **4. 패키지 & 모듈 - snake_case**

```python
# ✅ 올바른 파일/폴더명
auth_service.py
user_repository.py
email_sender.py
payment_processor.py
database_connection.py

# ❌ 잘못된 파일/폴더명
authService.py             # camelCase 금지
UserRepository.py          # PascalCase 금지
emailSender.py            # camelCase 금지
```

### **5. 비공개 변수/메서드 - \_leading_underscore**

```python
# ✅ 비공개 처리
class UserService:
    def __init__(self):
        self._database_url = "secret"      # 보호된 변수
        self.__api_key = "secret"          # 강한 비공개

    def _validate_user_data(self, data: Dict) -> bool:  # 보호된 메서드
        pass

    def get_user_profile(self, user_id: str) -> User:   # 공개 메서드
        if self._validate_user_data({"id": user_id}):
            return self._fetch_user(user_id)
```

---

## 🔧 **FastAPI 패턴 (표준화)**

### **1. 라우터 기본 템플릿**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from typing import List, Optional

from src.entities.user import User, UserCreate, UserUpdate
from src.features.auth import get_current_user
from src.services.user_service import UserService
from src.shared.exceptions import UserNotFoundError
from src.shared.dependencies import get_user_service

router = APIRouter(prefix="/api/v1/users", tags=["users"])
security = HTTPBearer()

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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="사용자 생성 중 오류가 발생했습니다"
        )

@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
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

@router.get("/", response_model=List[User])
async def list_users(
    skip: int = 0,
    limit: int = 20,
    user_service: UserService = Depends(get_user_service)
) -> List[User]:
    """사용자 목록 조회"""
    users = await user_service.get_users(skip=skip, limit=limit)
    return users
```

### **2. 의존성 주입 패턴**

```python
# src/shared/dependencies.py
from fastapi import Depends
from typing import Annotated

from src.app.config import get_settings
from src.services.database import DatabaseService
from src.services.user_service import UserService
from src.services.auth_service import AuthService

async def get_database_service() -> DatabaseService:
    """데이터베이스 서비스 의존성"""
    settings = get_settings()
    return DatabaseService(settings.database_url)

async def get_user_service(
    db: DatabaseService = Depends(get_database_service)
) -> UserService:
    """사용자 서비스 의존성"""
    return UserService(db)

async def get_auth_service() -> AuthService:
    """인증 서비스 의존성"""
    settings = get_settings()
    return AuthService(settings.jwt_secret)

# 사용할 때
UserServiceDep = Annotated[UserService, Depends(get_user_service)]
AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]
```

---

## 🗄️ **서비스 레이어 패턴**

### **1. 기본 서비스 클래스**

```python
# src/services/user_service.py
from typing import List, Optional
from abc import ABC, abstractmethod

from src.entities.user import User, UserCreate, UserUpdate
from src.shared.exceptions import UserNotFoundError, UserAlreadyExistsError
from src.services.database import DatabaseService

class UserServiceInterface(ABC):
    """사용자 서비스 인터페이스"""

    @abstractmethod
    async def create_user(self, user_data: UserCreate) -> User:
        pass

    @abstractmethod
    async def get_user_by_id(self, user_id: str) -> User:
        pass

    @abstractmethod
    async def update_user(self, user_id: str, user_data: UserUpdate) -> User:
        pass

    @abstractmethod
    async def delete_user(self, user_id: str) -> bool:
        pass

class UserService(UserServiceInterface):
    """사용자 서비스 구현"""

    def __init__(self, database_service: DatabaseService):
        self._db = database_service

    async def create_user(self, user_data: UserCreate) -> User:
        """새로운 사용자 생성"""
        # 중복 확인
        existing_user = await self._db.find_user_by_email(user_data.email)
        if existing_user:
            raise UserAlreadyExistsError(f"이메일 {user_data.email}이 이미 존재합니다")

        # 사용자 생성
        user = User(
            id=self._generate_user_id(),
            username=user_data.username,
            email=user_data.email,
            password_hash=self._hash_password(user_data.password)
        )

        # 데이터베이스 저장
        created_user = await self._db.save_user(user)
        return created_user

    async def get_user_by_id(self, user_id: str) -> User:
        """사용자 ID로 조회"""
        user = await self._db.find_user_by_id(user_id)
        if not user:
            raise UserNotFoundError(f"사용자 ID {user_id}를 찾을 수 없습니다")
        return user

    async def get_users(self, skip: int = 0, limit: int = 20) -> List[User]:
        """사용자 목록 조회"""
        users = await self._db.find_users(skip=skip, limit=limit)
        return users

    def _generate_user_id(self) -> str:
        """사용자 ID 생성"""
        import uuid
        return str(uuid.uuid4())

    def _hash_password(self, password: str) -> str:
        """비밀번호 해싱"""
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest()
```

### **2. 외부 서비스 연동 패턴**

```python
# src/services/ai_service.py
from typing import Dict, Any, Optional
from abc import ABC, abstractmethod

from src.app.config import get_settings
from src.shared.exceptions import AIServiceError

class AIServiceInterface(ABC):
    """AI 서비스 인터페이스"""

    @abstractmethod
    async def generate_text(self, prompt: str, **kwargs) -> str:
        pass

    @abstractmethod
    async def analyze_text(self, text: str) -> Dict[str, Any]:
        pass

class OpenAIService(AIServiceInterface):
    """OpenAI 서비스"""

    def __init__(self, api_key: str, model: str = "gpt-4"):
        self._api_key = api_key
        self._model = model
        self._client = self._initialize_client()

    def _initialize_client(self):
        """OpenAI 클라이언트 초기화"""
        from openai import AsyncOpenAI

        if not self._api_key:
            raise AIServiceError("OpenAI API 키가 설정되지 않았습니다")

        return AsyncOpenAI(api_key=self._api_key)

    async def generate_text(self, prompt: str, **kwargs) -> str:
        """텍스트 생성"""
        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            )

            if not response.choices:
                raise AIServiceError("AI가 응답을 생성하지 못했습니다")

            return response.choices[0].message.content.strip()

        except Exception as e:
            raise AIServiceError(f"텍스트 생성 중 오류: {str(e)}")

    async def analyze_text(self, text: str) -> Dict[str, Any]:
        """텍스트 분석"""
        prompt = f"다음 텍스트를 분석해주세요: {text}"

        try:
            analysis_result = await self.generate_text(prompt)
            return {"analysis": analysis_result, "status": "success"}
        except Exception as e:
            raise AIServiceError(f"텍스트 분석 중 오류: {str(e)}")
```

---

## 📦 **Pydantic 모델 패턴**

### **1. 엔티티 모델**

```python
# src/entities/user.py
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    """사용자 역할"""
    ADMIN = "admin"
    USER = "user"
    MODERATOR = "moderator"

class UserBase(BaseModel):
    """사용자 기본 정보"""
    username: str = Field(..., min_length=3, max_length=50, description="사용자명")
    email: EmailStr = Field(..., description="이메일 주소")
    full_name: Optional[str] = Field(None, max_length=100, description="전체 이름")
    is_active: bool = Field(default=True, description="활성 상태")
    role: UserRole = Field(default=UserRole.USER, description="사용자 역할")

class UserCreate(UserBase):
    """사용자 생성 요청"""
    password: str = Field(..., min_length=8, description="비밀번호")

    @validator('password')
    def validate_password(cls, v):
        """비밀번호 검증"""
        if not any(c.isupper() for c in v):
            raise ValueError('비밀번호에 대문자가 포함되어야 합니다')
        if not any(c.islower() for c in v):
            raise ValueError('비밀번호에 소문자가 포함되어야 합니다')
        if not any(c.isdigit() for c in v):
            raise ValueError('비밀번호에 숫자가 포함되어야 합니다')
        return v

class UserUpdate(BaseModel):
    """사용자 정보 수정"""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None

class User(UserBase):
    """사용자 모델"""
    id: str = Field(..., description="사용자 ID")
    created_at: datetime = Field(default_factory=datetime.now, description="생성일시")
    updated_at: Optional[datetime] = Field(None, description="수정일시")

    class Config:
        from_attributes = True  # ORM 모델과 호환
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class UserResponse(BaseModel):
    """사용자 응답 (비밀번호 제외)"""
    id: str
    username: str
    email: str
    full_name: Optional[str]
    is_active: bool
    role: UserRole
    created_at: datetime
```

### **2. API 응답 모델**

```python
# src/shared/models.py
from pydantic import BaseModel, Field
from typing import Optional, Generic, TypeVar, List
from datetime import datetime

T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    """표준 API 응답"""
    success: bool = Field(..., description="성공 여부")
    data: Optional[T] = Field(None, description="응답 데이터")
    message: str = Field("", description="응답 메시지")
    timestamp: datetime = Field(default_factory=datetime.now, description="응답 시간")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class PaginationInfo(BaseModel):
    """페이지네이션 정보"""
    page: int = Field(..., ge=1, description="현재 페이지")
    size: int = Field(..., ge=1, le=100, description="페이지 크기")
    total: int = Field(..., ge=0, description="전체 항목 수")
    pages: int = Field(..., ge=0, description="전체 페이지 수")

class PaginatedResponse(BaseModel, Generic[T]):
    """페이지네이션 응답"""
    items: List[T] = Field(..., description="항목 목록")
    pagination: PaginationInfo = Field(..., description="페이지네이션 정보")
```

---

## 🗄️ **데이터베이스 패턴**

### **1. SQLAlchemy 사용 패턴**

```python
# src/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from src.app.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=300
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """데이터베이스 세션 의존성"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# src/entities/user_model.py (SQLAlchemy 모델)
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from datetime import datetime

from src.app.database import Base
from src.entities.user import UserRole

class UserModel(Base):
    """사용자 SQLAlchemy 모델"""
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### **2. Repository 패턴**

```python
# src/repositories/user_repository.py
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from src.entities.user_model import UserModel
from src.entities.user import User, UserCreate, UserUpdate

class UserRepository:
    """사용자 레포지토리"""

    def __init__(self, db_session: Session):
        self._db = db_session

    async def create(self, user_data: UserCreate) -> UserModel:
        """사용자 생성"""
        db_user = UserModel(
            id=self._generate_id(),
            username=user_data.username,
            email=user_data.email,
            full_name=user_data.full_name,
            password_hash=self._hash_password(user_data.password),
            role=user_data.role
        )

        self._db.add(db_user)
        self._db.commit()
        self._db.refresh(db_user)

        return db_user

    async def find_by_id(self, user_id: str) -> Optional[UserModel]:
        """ID로 사용자 조회"""
        return self._db.query(UserModel).filter(UserModel.id == user_id).first()

    async def find_by_email(self, email: str) -> Optional[UserModel]:
        """이메일로 사용자 조회"""
        return self._db.query(UserModel).filter(UserModel.email == email).first()

    async def find_by_username(self, username: str) -> Optional[UserModel]:
        """사용자명으로 조회"""
        return self._db.query(UserModel).filter(UserModel.username == username).first()

    async def find_all(self, skip: int = 0, limit: int = 20, is_active: Optional[bool] = None) -> List[UserModel]:
        """사용자 목록 조회"""
        query = self._db.query(UserModel)

        if is_active is not None:
            query = query.filter(UserModel.is_active == is_active)

        return query.offset(skip).limit(limit).all()

    async def update(self, user_id: str, user_data: UserUpdate) -> Optional[UserModel]:
        """사용자 정보 수정"""
        db_user = await self.find_by_id(user_id)
        if not db_user:
            return None

        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)

        db_user.updated_at = func.now()
        self._db.commit()
        self._db.refresh(db_user)

        return db_user

    async def delete(self, user_id: str) -> bool:
        """사용자 삭제"""
        db_user = await self.find_by_id(user_id)
        if not db_user:
            return False

        self._db.delete(db_user)
        self._db.commit()
        return True

    def _generate_id(self) -> str:
        """ID 생성"""
        import uuid
        return str(uuid.uuid4())

    def _hash_password(self, password: str) -> str:
        """비밀번호 해싱"""
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.hash(password)
```

---

## 📋 **Import 순서 표준 (엄격)**

```python
# 1. Python 표준 라이브러리
import os
import sys
import time
import uuid
import hashlib
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Union, Callable
from pathlib import Path

# 2. 서드파티 라이브러리 (알파벳 순)
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, EmailStr, validator
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import Session

# 3. 프로젝트 내부 모듈 (계층 순서)
# 3-1. app 계층
from src.app.config import get_settings
from src.app.database import get_db

# 3-2. shared 계층
from src.shared.exceptions import UserNotFoundError, ValidationError
from src.shared.dependencies import get_user_service
from src.shared.utils import format_date, validate_email

# 3-3. entities 계층
from src.entities.user import User, UserCreate, UserUpdate
from src.entities.user_model import UserModel

# 3-4. services 계층
from src.services.user_service import UserService
from src.services.auth_service import AuthService

# 3-5. features 계층
from src.features.auth import get_current_user
from src.features.permissions import check_admin_permission
```

---

## 🚨 **예외 처리 시스템**

### **1. 커스텀 예외 정의**

```python
# src/shared/exceptions.py
class BaseAppException(Exception):
    """애플리케이션 기본 예외"""

    def __init__(self, message: str, code: str = "APP_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)

class ValidationError(BaseAppException):
    """데이터 검증 오류"""

    def __init__(self, message: str, field: str = None):
        self.field = field
        super().__init__(message, "VALIDATION_ERROR")

class NotFoundError(BaseAppException):
    """리소스를 찾을 수 없음"""

    def __init__(self, resource: str, identifier: str):
        message = f"{resource}을(를) 찾을 수 없습니다: {identifier}"
        super().__init__(message, "NOT_FOUND")

class UserNotFoundError(NotFoundError):
    """사용자를 찾을 수 없음"""

    def __init__(self, identifier: str):
        super().__init__("사용자", identifier)

class UserAlreadyExistsError(BaseAppException):
    """사용자가 이미 존재함"""

    def __init__(self, field: str, value: str):
        message = f"이미 존재하는 {field}: {value}"
        super().__init__(message, "USER_EXISTS")

class AuthenticationError(BaseAppException):
    """인증 오류"""

    def __init__(self, message: str = "인증에 실패했습니다"):
        super().__init__(message, "AUTH_ERROR")

class PermissionError(BaseAppException):
    """권한 오류"""

    def __init__(self, message: str = "권한이 없습니다"):
        super().__init__(message, "PERMISSION_ERROR")

class ExternalServiceError(BaseAppException):
    """외부 서비스 오류"""

    def __init__(self, service: str, message: str):
        super().__init__(f"{service} 서비스 오류: {message}", "EXTERNAL_SERVICE_ERROR")

class AIServiceError(ExternalServiceError):
    """AI 서비스 오류"""

    def __init__(self, message: str):
        super().__init__("AI", message)
```

### **2. 전역 예외 핸들러**

```python
# src/app/exceptions.py
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from src.shared.exceptions import (
    BaseAppException,
    NotFoundError,
    ValidationError,
    AuthenticationError,
    PermissionError
)

def setup_exception_handlers(app: FastAPI):
    """예외 핸들러 설정"""

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """Pydantic 검증 오류 핸들러"""
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "message": "입력 데이터 검증에 실패했습니다",
                "errors": exc.errors()
            }
        )

    @app.exception_handler(NotFoundError)
    async def not_found_exception_handler(request: Request, exc: NotFoundError):
        """리소스 없음 예외 핸들러"""
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "message": exc.message,
                "code": exc.code
            }
        )

    @app.exception_handler(ValidationError)
    async def validation_error_handler(request: Request, exc: ValidationError):
        """검증 오류 핸들러"""
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "message": exc.message,
                "field": exc.field,
                "code": exc.code
            }
        )

    @app.exception_handler(AuthenticationError)
    async def auth_exception_handler(request: Request, exc: AuthenticationError):
        """인증 오류 핸들러"""
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "success": False,
                "message": exc.message,
                "code": exc.code
            }
        )

    @app.exception_handler(PermissionError)
    async def permission_exception_handler(request: Request, exc: PermissionError):
        """권한 오류 핸들러"""
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={
                "success": False,
                "message": exc.message,
                "code": exc.code
            }
        )

    @app.exception_handler(BaseAppException)
    async def base_exception_handler(request: Request, exc: BaseAppException):
        """기본 애플리케이션 예외 핸들러"""
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": exc.message,
                "code": exc.code
            }
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """일반 예외 핸들러"""
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "내부 서버 오류가 발생했습니다",
                "code": "INTERNAL_ERROR"
            }
        )
```

---

## 🔍 **로깅 시스템**

### **1. 로깅 설정**

```python
# src/shared/logging.py
import logging
import sys
from typing import Optional
from pathlib import Path

def setup_logging(
    level: str = "INFO",
    log_file: Optional[str] = None,
    format_string: Optional[str] = None
) -> logging.Logger:
    """로깅 설정"""

    if format_string is None:
        format_string = (
            "%(asctime)s - %(name)s - %(levelname)s - "
            "%(filename)s:%(lineno)d - %(funcName)s - %(message)s"
        )

    # 로깅 레벨 설정
    log_level = getattr(logging, level.upper(), logging.INFO)

    # 루트 로거 설정
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # 기존 핸들러 제거
    for handler in root_logger.handlers:
        root_logger.removeHandler(handler)

    # 포맷터 생성
    formatter = logging.Formatter(format_string)

    # 콘솔 핸들러
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    root_logger.addHandler(console_handler)

    # 파일 핸들러 (선택적)
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setFormatter(formatter)
        file_handler.setLevel(log_level)
        root_logger.addHandler(file_handler)

    return root_logger

def get_logger(name: str) -> logging.Logger:
    """로거 인스턴스 반환"""
    return logging.getLogger(name)

# 사용 예시
# src/services/user_service.py
from src.shared.logging import get_logger

logger = get_logger(__name__)

class UserService:
    async def create_user(self, user_data: UserCreate) -> User:
        logger.info(f"사용자 생성 시작: {user_data.email}")

        try:
            # 사용자 생성 로직
            user = await self._repository.create(user_data)
            logger.info(f"사용자 생성 성공: {user.id}")
            return user

        except Exception as e:
            logger.error(f"사용자 생성 실패: {user_data.email}, 오류: {str(e)}")
            raise
```

---

## ⚙️ **설정 관리**

### **1. Pydantic Settings 사용**

```python
# src/app/config.py
from functools import lru_cache
from pydantic import BaseSettings, Field
from typing import Optional

class Settings(BaseSettings):
    """애플리케이션 설정"""

    # 애플리케이션 설정
    app_name: str = Field("MyApp", env="APP_NAME")
    app_version: str = Field("1.0.0", env="APP_VERSION")
    debug: bool = Field(False, env="DEBUG")

    # 데이터베이스 설정
    database_url: str = Field(..., env="DATABASE_URL")
    database_echo: bool = Field(False, env="DATABASE_ECHO")

    # API 키 설정
    openai_api_key: Optional[str] = Field(None, env="OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = Field(None, env="ANTHROPIC_API_KEY")

    # JWT 설정
    jwt_secret_key: str = Field(..., env="JWT_SECRET_KEY")
    jwt_algorithm: str = Field("HS256", env="JWT_ALGORITHM")
    jwt_expire_minutes: int = Field(30, env="JWT_EXPIRE_MINUTES")

    # Redis 설정
    redis_url: Optional[str] = Field(None, env="REDIS_URL")

    # 로깅 설정
    log_level: str = Field("INFO", env="LOG_LEVEL")
    log_file: Optional[str] = Field(None, env="LOG_FILE")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings() -> Settings:
    """설정 인스턴스 반환 (캐시됨)"""
    return Settings()

# 사용 예시
# src/services/ai_service.py
from src.app.config import get_settings

class OpenAIService:
    def __init__(self):
        settings = get_settings()
        self._api_key = settings.openai_api_key

        if not self._api_key:
            raise ValueError("OpenAI API 키가 설정되지 않았습니다")
```

---

## 🎯 **개발 체크리스트**

### **✅ 네이밍 컨벤션**

- [ ] 모든 변수/함수는 `snake_case`인가?
- [ ] 모든 클래스는 `PascalCase`인가?
- [ ] 모든 상수는 `UPPER_SNAKE_CASE`인가?
- [ ] 모든 파일/모듈은 `snake_case`인가?
- [ ] camelCase 사용을 완전히 제거했는가?

### **✅ 타입 힌팅**

- [ ] 모든 함수에 타입 힌팅을 추가했는가?
- [ ] 복잡한 타입은 `typing` 모듈을 사용했는가?
- [ ] `from __future__ import annotations`를 사용했는가?

### **✅ 코드 구조**

- [ ] Import 순서가 표준에 맞는가?
- [ ] FSD 아키텍처 계층을 준수했는가?
- [ ] 의존성 주입을 사용했는가?
- [ ] 인터페이스를 정의했는가?

### **✅ 예외 처리**

- [ ] 커스텀 예외를 정의했는가?
- [ ] 적절한 예외 처리를 했는가?
- [ ] 전역 예외 핸들러를 설정했는가?

### **✅ 서비스 레이어**

- [ ] 비즈니스 로직을 서비스 레이어에 분리했는가?
- [ ] Repository 패턴을 사용했는가?
- [ ] 서비스 인터페이스를 정의했는가?

---

## 📦 **패키지 관리 (venv + uv)**

### **1. venv로 가상환경 생성**

```bash
# Python 가상환경 생성
python -m venv venv

# 가상환경 활성화 (Linux/Mac)
source venv/bin/activate

# 가상환경 활성화 (Windows)
venv\Scripts\activate

# 가상환경 비활성화
deactivate
```

### **2. uv를 통한 빠른 패키지 관리**

```bash
# uv 설치 (한 번만)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 또는 pip으로 설치
pip install uv

# uv로 패키지 설치 (매우 빠름)
uv pip install fastapi uvicorn pydantic sqlalchemy

# requirements.txt에서 설치
uv pip install -r requirements.txt

# 개발 의존성 설치
uv pip install -r requirements-dev.txt

# 패키지 업그레이드
uv pip install --upgrade fastapi

# 현재 설치된 패키지 목록
uv pip freeze > requirements.txt
```

### **3. pyproject.toml 사용 (권장)**

```toml
# pyproject.toml
[project]
name = "my-project"
version = "1.0.0"
description = "My Python Project"
authors = [
    {name = "Your Name", email = "your.email@example.com"}
]
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "pydantic>=2.5.0",
    "sqlalchemy>=2.0.0",
    "pydantic-settings>=2.1.0",
    "python-multipart>=0.0.6",
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.4",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.0",
    "httpx>=0.25.0",
    "black>=23.0.0",
    "isort>=5.12.0",
    "flake8>=6.0.0",
    "mypy>=1.7.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.black]
line-length = 88
target-version = ['py38']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | build
  | dist
)/
'''

[tool.isort]
profile = "black"
multi_line_output = 3
line_length = 88
known_first_party = ["src"]

[tool.mypy]
python_version = "3.8"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
```

### **4. uv + pyproject.toml 활용**

```bash
# pyproject.toml 기반으로 의존성 설치
uv pip install -e .

# 개발 의존성까지 설치
uv pip install -e ".[dev]"

# 특정 그룹만 설치
uv pip install fastapi uvicorn pydantic

# 프로젝트 설정 동기화
uv pip sync requirements.txt
```

---

## 🚀 **프로젝트 시작 템플릿**

### **1. 프로젝트 초기 설정**

```bash
# 프로젝트 디렉토리 생성
mkdir my_project
cd my_project

# Git 초기화
git init

# Python 가상환경 생성
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# uv 설치 (처음 한 번만)
pip install uv

# 디렉토리 구조 생성
mkdir -p src/{app,pages,widgets,features,entities,shared,services}
mkdir -p src/app/{config,middleware,dependencies,exceptions}
mkdir -p src/shared/{exceptions,utils,models,logging}
mkdir -p tests/{unit,integration}

# 기본 파일 생성
touch src/__init__.py
touch src/app/__init__.py
touch src/shared/__init__.py
touch pyproject.toml
touch requirements.txt
touch requirements-dev.txt
touch .env
touch .env.example
touch .gitignore
touch README.md
```

### **2. 필수 의존성 설치**

```bash
# 핵심 라이브러리 설치
uv pip install fastapi uvicorn pydantic sqlalchemy pydantic-settings

# 인증 관련
uv pip install python-jose[cryptography] passlib[bcrypt] python-multipart

# 데이터베이스 (필요한 것만 선택)
uv pip install psycopg2-binary  # PostgreSQL
uv pip install aiomysql        # MySQL
uv pip install aiosqlite       # SQLite

# 개발 도구
uv pip install pytest pytest-asyncio httpx black isort flake8 mypy

# requirements.txt 생성
uv pip freeze > requirements.txt
```

### **3. 기본 설정 파일들**

#### **.env.example**

```env
# 애플리케이션 설정
APP_NAME=MyApp
APP_VERSION=1.0.0
DEBUG=false

# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/myapp
DATABASE_ECHO=false

# JWT 설정
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# API 키들
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Redis (선택적)
REDIS_URL=redis://localhost:6379

# 로깅
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
```

#### **.gitignore**

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
venv/
env/
ENV/
.venv/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Environment variables
.env
.env.local
.env.*.local

# Logs
logs/
*.log

# Database
*.db
*.sqlite3

# Testing
.coverage
.pytest_cache/
htmlcov/

# mypy
.mypy_cache/
.dmypy.json
dmypy.json
```

### **4. 개발 스크립트**

```bash
# scripts/dev.sh
#!/bin/bash
echo "🚀 개발 서버 시작..."
source venv/bin/activate
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# scripts/test.sh
#!/bin/bash
echo "🧪 테스트 실행..."
source venv/bin/activate
pytest tests/ -v --cov=src

# scripts/format.sh
#!/bin/bash
echo "🎨 코드 포맷팅..."
source venv/bin/activate
black src/ tests/
isort src/ tests/

# scripts/lint.sh
#!/bin/bash
echo "🔍 코드 린팅..."
source venv/bin/activate
flake8 src/ tests/
mypy src/

# 실행 권한 부여
chmod +x scripts/*.sh
```

### **5. Makefile 추가**

```makefile
# Makefile
.PHONY: install dev test format lint clean

# 가상환경 생성 및 의존성 설치
install:
	python -m venv venv
	. venv/bin/activate && pip install uv
	. venv/bin/activate && uv pip install -e ".[dev]"

# 개발 서버 실행
dev:
	. venv/bin/activate && uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# 테스트 실행
test:
	. venv/bin/activate && pytest tests/ -v --cov=src

# 코드 포맷팅
format:
	. venv/bin/activate && black src/ tests/
	. venv/bin/activate && isort src/ tests/

# 코드 린팅
lint:
	. venv/bin/activate && flake8 src/ tests/
	. venv/bin/activate && mypy src/

# 정리
clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache/
	rm -rf .mypy_cache/
	rm -rf htmlcov/
	rm -rf dist/
	rm -rf build/
	rm -rf *.egg-info/

# 프로덕션 빌드
build:
	. venv/bin/activate && python -m build

# 의존성 업데이트
update:
	. venv/bin/activate && uv pip install --upgrade -r requirements.txt
	. venv/bin/activate && uv pip freeze > requirements.txt
```

---

## 🔧 **개발 워크플로우**

### **1. 일일 개발 루틴**

```bash
# 1. 가상환경 활성화
source venv/bin/activate

# 2. 의존성 동기화 (팀 작업 시)
uv pip sync requirements.txt

# 3. 개발 서버 실행
make dev
# 또는
uvicorn src.main:app --reload

# 4. 코드 작성 후 포맷팅
make format

# 5. 린팅 체크
make lint

# 6. 테스트 실행
make test

# 7. 커밋 전 최종 체크
make format && make lint && make test
```

### **2. 새로운 패키지 추가 시**

```bash
# 1. uv로 빠른 설치
uv pip install new-package

# 2. requirements.txt 업데이트
uv pip freeze > requirements.txt

# 3. pyproject.toml도 업데이트 (수동)
# dependencies 섹션에 추가

# 4. 팀원들과 공유
git add requirements.txt pyproject.toml
git commit -m "feat: add new-package dependency"
```

### **3. 성능 최적화 팁**

```bash
# uv는 기본 pip보다 10-100배 빠름
# 대신 pip 사용하는 경우
time pip install requests    # 느림
time uv pip install requests # 빠름

# 의존성 설치 시간 비교
time pip install -r requirements.txt     # 30초+
time uv pip install -r requirements.txt  # 3초

# 패키지 검색도 빠름
uv pip search fastapi

# 캐시 활용으로 재설치 시 더욱 빠름
uv pip install --upgrade fastapi
```

### **2. FastAPI 앱 초기화**

```python
# src/main.py
from fastapi import FastAPI
from src.app.config import get_settings
from src.app.exceptions import setup_exception_handlers
from src.shared.logging import setup_logging

def create_app() -> FastAPI:
    """FastAPI 애플리케이션 생성"""
    settings = get_settings()

    # 로깅 설정
    setup_logging(level=settings.log_level, log_file=settings.log_file)

    # FastAPI 앱 생성
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug
    )

    # 예외 핸들러 설정
    setup_exception_handlers(app)

    # 라우터 등록
    from src.pages import user_router
    app.include_router(user_router, prefix="/api/v1")

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    settings = get_settings()
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=settings.debug)
```
