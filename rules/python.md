# Python Guidelines (3.8+)

## Architecture: Layered FSD Pattern

```
src/
├── app/                    # Application initialization
│   ├── main.py            # Entry point (FastAPI app creation)
│   ├── config.py          # Environment config (BaseSettings)
│   ├── dependencies.py    # Dependency injection
│   └── middleware/        # CORS, auth, logging middleware
│       ├── __init__.py
│       ├── cors.py
│       └── auth.py
├── routers/               # API route definitions
│   ├── __init__.py
│   ├── user_router.py
│   ├── post_router.py
│   └── auth_router.py
├── services/              # Business logic layer
│   ├── __init__.py
│   ├── user_service.py
│   └── post_service.py
├── repositories/          # Data access layer
│   ├── __init__.py
│   ├── user_repository.py
│   └── post_repository.py
├── models/                # Database models (SQLAlchemy)
│   ├── __init__.py
│   ├── base.py           # Base model
│   ├── user.py
│   └── post.py
├── schemas/               # Pydantic schemas (DTOs)
│   ├── __init__.py
│   ├── user_schema.py
│   └── post_schema.py
├── core/                  # Shared core utilities
│   ├── __init__.py
│   ├── exceptions.py     # Custom exceptions
│   ├── database.py       # DB session management
│   ├── security.py       # JWT, hashing
│   └── constants.py      # Global constants
├── utils/                 # Pure utility functions
│   ├── __init__.py
│   ├── datetime_utils.py
│   └── string_utils.py
└── tests/
    ├── __init__.py
    ├── conftest.py        # Fixtures
    ├── test_user_service.py
    └── test_user_router.py
```

### Layer Dependency Rules

```
routers → services → repositories → models
                  → schemas
routers → schemas (for request/response validation)
all layers → core, utils
```

**Never** let routers access repositories directly.

## Naming Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| Variables / Functions | snake_case | `user_name`, `get_user_list` |
| Classes | PascalCase | `UserService`, `PostRepository` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE` |
| Modules / Files | snake_case | `user_service.py`, `auth_router.py` |
| Private members | _leading_underscore | `_validate_token`, `_db_session` |

## Type Hints (Required)

Every function must have type hints.

```python
from typing import Optional

async def get_user(user_id: str) -> Optional[User]:
    ...

async def get_user_list(
    skip: int = 0,
    limit: int = 20,
) -> list[User]:
    ...
```

## Pydantic Models (Required)

All data structures must use Pydantic.

```python
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8)

class UserResponse(BaseModel):
    id: str
    username: str
    email: str

    model_config = {"from_attributes": True}
```

## FastAPI Router Pattern

```python
from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_user_service

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 20,
    service: UserService = Depends(get_user_service),
) -> list[UserResponse]:
    return await service.get_user_list(skip=skip, limit=limit)

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: UserCreate,
    service: UserService = Depends(get_user_service),
) -> UserResponse:
    return await service.create_user(data)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    service: UserService = Depends(get_user_service),
) -> UserResponse:
    user = await service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

## Service Layer Pattern

```python
class UserService:
    def __init__(self, repository: UserRepository) -> None:
        self._repository = repository

    async def get_user_list(
        self, skip: int = 0, limit: int = 20
    ) -> list[User]:
        return await self._repository.find_many(skip=skip, limit=limit)

    async def create_user(self, data: UserCreate) -> User:
        existing = await self._repository.find_by_email(data.email)
        if existing:
            raise HTTPException(status_code=409, detail="Email already exists")
        return await self._repository.create(data)
```

## Repository Pattern

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_many(
        self, skip: int = 0, limit: int = 20
    ) -> list[User]:
        query = select(User).offset(skip).limit(limit)
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def find_by_id(self, user_id: str) -> Optional[User]:
        query = select(User).where(User.id == user_id)
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def create(self, data: UserCreate) -> User:
        user = User(**data.model_dump())
        self._session.add(user)
        await self._session.commit()
        await self._session.refresh(user)
        return user
```

## Exception Handling

```python
# core/exceptions.py
class AppException(Exception):
    def __init__(self, message: str, status_code: int = 500) -> None:
        self.message = message
        self.status_code = status_code

class NotFoundException(AppException):
    def __init__(self, resource: str = "Resource") -> None:
        super().__init__(f"{resource} not found", status_code=404)

class ConflictException(AppException):
    def __init__(self, message: str = "Resource already exists") -> None:
        super().__init__(message, status_code=409)

# Global handler
@app.exception_handler(AppException)
async def app_exception_handler(request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )
```

## Database Setup

```python
# core/database.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

engine = create_async_engine(settings.DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
```

## Import Order

```python
# 1. Standard library
from typing import Optional
from datetime import datetime

# 2. Third-party
from fastapi import APIRouter, Depends
from sqlalchemy import select

# 3. Local
from app.dependencies import get_user_service
from core.exceptions import NotFoundException
```

## Project Setup

```bash
# Virtual environment
python -m venv .venv && source .venv/bin/activate

# Package management (uv recommended)
pip install uv
uv pip install fastapi uvicorn sqlalchemy pydantic

# Run
uvicorn app.main:app --reload --port 8000
```

## Checklist

- [ ] Type hints on every function
- [ ] Pydantic models for all data structures
- [ ] Service/Repository layer separation
- [ ] Custom exception hierarchy
- [ ] Async/await throughout
- [ ] Absolute imports only
- [ ] `__all__` defined in public modules
