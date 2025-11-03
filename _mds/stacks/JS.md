# JavaScript 공통 지침

<destructuring>
## 구조분해할당 필수

불가피한 상황을 제외하고 구조분해할당을 사용합니다.

```javascript
// ✅ 올바른 사용
const { name, age, email } = user;
const { data, error } = await fetchUser();
const [first, second, ...rest] = array;

// 함수 파라미터
const UserCard = ({ name, email, avatar }) => {
  return <div>{name}</div>;
};

// 중첩 구조분해
const {
  user: {
    profile: { avatar },
  },
} = response;

// ❌ 잘못된 사용 (불필요한 중간 변수)
const user = response.user;
const name = user.name;
const email = user.email;
```

### 배열 구조분해

```javascript
// ✅ 배열 구조분해
const [first, second] = array;
const [, , third] = array; // 특정 인덱스만

// useState
const [count, setCount] = useState(0);
const [user, setUser] = useState(null);

// ❌ 인덱스 접근
const first = array[0];
const second = array[1];
```

</destructuring>

<naming>
## 네이밍 컨벤션

### 변수명

```javascript
// ✅ 명사 사용
const userName = 'john';
const userList = [];
const productData = {};

// Boolean은 is/has/can 접두사
const isActive = true;
const hasPermission = false;
const canEdit = true;

// 배열은 복수형 또는 ~List
const users = [];
const userList = [];
const productItems = [];
```

### 함수명

```javascript
// ✅ 동사로 시작
const getUserInfo = () => {};
const createUser = () => {};
const updateProfile = () => {};
const deletePost = () => {};
const handleClick = () => {};
const toggleMenu = () => {};
const validateEmail = () => {};
const fetchUserData = async () => {};

// ❌ 명사로만 구성
const user = () => {}; // 함수인지 변수인지 불명확
const profile = () => {};
```

### 이벤트 핸들러

```javascript
// ✅ handle + 이벤트명
const handleClick = () => {};
const handleSubmit = () => {};
const handleChange = (e) => {};
const handleKeyPress = (e) => {};

// on + 이벤트명 (props로 전달할 때)
<Button onClick={handleClick} />
<Form onSubmit={handleSubmit} />
```

</naming>

<async>
## 비동기 처리

### async/await 사용

- axios 사용
- api 함수명은

```javascript
export const getUserList = () => {};
```

위 처럼 REST API 이름 entities 이름 별도 추가 설명 이런식으로 지어

</async>

<arrow_functions>

## 화살표 함수

```javascript
// ✅ 화살표 함수 사용
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;

// 객체 반환 시 괄호로 감싸기
const createUser = (name, email) => ({
  name,
  email,
  createdAt: new Date(),
});

// 배열 메서드와 함께
const doubled = numbers.map((n) => n * 2);
const filtered = users.filter((u) => u.isActive);
const found = users.find((u) => u.id === userId);

// ❌ function 키워드 (불필요)
function add(a, b) {
  return a + b;
}
```

</arrow_functions>

<array_methods>

## 배열 메서드 활용

```javascript
// Map - 변환
const userNames = users.map((user) => user.name);
const ids = users.map(({ id }) => id);

// Filter - 필터링
const activeUsers = users.filter((user) => user.isActive);
const adults = users.filter(({ age }) => age >= 18);

// Find - 검색
const user = users.find((u) => u.id === userId);
const admin = users.find(({ role }) => role === 'admin');

// Reduce - 집계
const total = numbers.reduce((sum, n) => sum + n, 0);
const grouped = users.reduce((acc, user) => {
  acc[user.role] = acc[user.role] || [];
  acc[user.role].push(user);
  return acc;
}, {});

// Some / Every - 조건 검사
const hasAdmin = users.some((u) => u.role === 'admin');
const allActive = users.every((u) => u.isActive);

// Sort - 정렬
const sorted = users.sort((a, b) => a.age - b.age);
```

</array_methods>

<spread_operator>

## Spread 연산자

```javascript
// ✅ 배열 복사/병합
const newArray = [...oldArray];
const merged = [...array1, ...array2];
const withNew = [...existing, newItem];

// 객체 복사/병합
const newObj = { ...oldObj };
const merged = { ...obj1, ...obj2 };
const updated = { ...user, name: 'New Name' };

// 함수 파라미터
const sum = (...numbers) => numbers.reduce((a, b) => a + b, 0);

// ❌ 수동 복사
const newArray = oldArray.slice();
const newObj = Object.assign({}, oldObj);
```

</spread_operator>

<template_literals>

## 템플릿 리터럴

```javascript
// ✅ 템플릿 리터럴 사용
const greeting = `Hello, ${name}!`;
const url = `/api/users/${userId}/posts/${postId}`;
const message = `
  User: ${user.name}
  Email: ${user.email}
  Status: ${user.isActive ? 'Active' : 'Inactive'}
`;

// ❌ 문자열 연결
const greeting = 'Hello, ' + name + '!';
const url = '/api/users/' + userId + '/posts/' + postId;
```

</template_literals>

<optional_chaining>

## Optional Chaining & Nullish Coalescing

```javascript
// ✅ Optional Chaining
const userName = user?.profile?.name;
const firstPost = user?.posts?.[0];
const callback = options?.onSuccess?.();

// Nullish Coalescing
const name = userName ?? 'Anonymous';
const count = data?.count ?? 0;

// ❌ 중첩된 조건문
const userName = user && user.profile && user.profile.name;
const name = userName ? userName : 'Anonymous';
```

</optional_chaining>

<imports_exports>

## Import/Export

```javascript
// ✅ Named Export (권장)
export const getUserInfo = () => {};
export const createUser = () => {};

import { getUserInfo, createUser } from './api';

// Default Export (컴포넌트에 주로 사용)
export default UserCard;

import UserCard from './UserCard';

// ❌ 혼합 사용 지양
export default function something() {}
export const other = () => {};
```

</imports_exports>

<error_handling>

## 에러 처리

```javascript
// ✅ Try-Catch 사용
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error; // 상위로 전파
  }
};

// 커스텀 에러
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

const validateEmail = (email) => {
  if (!email.includes('@')) {
    throw new ValidationError('Invalid email format');
  }
};
```

</error_handling>

<constants>
## 상수 사용

```javascript
// ✅ 상수로 정의
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;
const DEFAULT_PAGE_SIZE = 20;

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// 사용
const fetchUser = async () => {
  const response = await fetch(`${API_BASE_URL}/users`);
};

// ❌ 매직 넘버/문자열
const response = await fetch('https://api.example.com/users');
if (retryCount > 3) { ... }
```

</constants>

<best_practices>

## 모범 사례

### 일관성 있는 return

```javascript
// ✅ 일관성 있는 return 타입
const getUser = (id) => {
  if (!id) return null;
  return users.find((u) => u.id === id) || null;
};

// ❌ 불일치한 return
const getUser = (id) => {
  if (!id) return;
  return users.find((u) => u.id === id); // undefined일 수도
};
```

### Early Return

```javascript
// ✅ Early Return
const processUser = (user) => {
  if (!user) return;
  if (!user.isActive) return;

  // 실제 로직
  doSomething(user);
};

// ❌ 중첩 조건문
const processUser = (user) => {
  if (user) {
    if (user.isActive) {
      doSomething(user);
    }
  }
};
```

### 단일 책임 원칙

```javascript
// ✅ 함수는 하나의 일만
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const createUser = async (userData) => {
  if (!validateEmail(userData.email)) {
    throw new Error('Invalid email');
  }

  return await api.post('/users', userData);
};

// ❌ 하나의 함수가 여러 일을
const createUserAndSendEmail = async (userData) => {
  // 검증도 하고
  // 생성도 하고
  // 이메일도 보내고...
};
```

</best_practices>

<checklist>
## 개발 체크리스트

- [ ] 구조분해할당 사용
- [ ] 화살표 함수 사용
- [ ] async/await 사용
- [ ] Spread 연산자 사용
- [ ] 템플릿 리터럴 사용
- [ ] Optional Chaining 사용
- [ ] 적절한 에러 처리
- [ ] 상수 정의 사용
- [ ] Early Return 패턴
- [ ] 단일 책임 원칙
      </checklist>
