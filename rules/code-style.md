# JavaScript / TypeScript Code Style

## Destructuring (Required)

Always use destructuring assignment unless unavoidable.

```typescript
const { name, age, email } = user;
const { data, error } = await fetchUser();
const [first, second, ...rest] = array;

// Function parameters
const UserCard = ({ name, email, avatar }: UserCardProps) => {
  return <div>{name}</div>;
};

// Nested destructuring
const {
  user: {
    profile: { avatar },
  },
} = response;
```

## Arrow Functions (Required)

Always use arrow functions. Avoid the `function` keyword.

```typescript
const add = (a: number, b: number) => a + b;

// Object return: wrap with parentheses
const createUser = (name: string, email: string) => ({
  name,
  email,
  createdAt: new Date(),
});

// Array methods
const doubled = numbers.map((n) => n * 2);
const filtered = users.filter((u) => u.isActive);
const found = users.find((u) => u.id === userId);
```

## Naming Conventions

### Variables (camelCase, nouns)

```typescript
const userName = 'john';
const userList: User[] = [];
const productData = {};

// Booleans: is/has/can prefix
const isActive = true;
const hasPermission = false;
const canEdit = true;

// Arrays: plural or ~List suffix
const users: User[] = [];
const userList: User[] = [];
```

### Functions (camelCase, verb-first)

```typescript
const getUserInfo = () => {};
const createUser = () => {};
const updateProfile = () => {};
const deletePost = () => {};
const handleClick = () => {};
const toggleMenu = () => {};
const fetchUserData = async () => {};
```

### Event Handlers

Always define handlers as named functions first, then reference them. Never use inline anonymous functions or binding.

```typescript
// GOOD: Define first, reference later
const handleClick = () => {};
const handleSubmit = () => {};
const handleChange = (e: ChangeEvent) => {};

<Button onClick={handleClick} />
<Form onSubmit={handleSubmit} />

// BAD: Inline anonymous function
<Button onClick={() => doSomething()} />
<Form onSubmit={(e) => { e.preventDefault(); submit(); }} />
```

## Async / Await

Use async/await with Axios. Name API functions as REST verb + entity.

```typescript
export const getUserList = async () => {};
export const getUser = async (id: string) => {};
export const createUser = async (data: CreateUserDto) => {};
export const updateUser = async (id: string, data: UpdateUserDto) => {};
export const deleteUser = async (id: string) => {};
```

## Spread Operator

```typescript
const newArray = [...oldArray];
const merged = { ...obj1, ...obj2 };
const updated = { ...user, name: 'New Name' };
```

## Template Literals

```typescript
const greeting = `Hello, ${name}!`;
const url = `/api/users/${userId}/posts/${postId}`;
```

## Optional Chaining & Nullish Coalescing

```typescript
const userName = user?.profile?.name;
const name = userName ?? 'Anonymous';
const count = data?.count ?? 0;
```

## Imports / Exports

```typescript
// Named Export (preferred)
export const getUserInfo = () => {};
import { getUserInfo } from '@/api/user';

// Default Export (components)
export default UserCard;
```

## Domain-Based Function Separation

Separate functions by domain. Never pile unrelated logic into a single file.

```typescript
// GOOD: Domain-separated imports
import { getUser, updateUser } from '@/api/user';
import { getPost, createPost } from '@/api/post';
import { formatDate, formatCurrency } from '@/utils/format';
import { validateEmail } from '@/utils/validation';

// BAD: Everything in one util file
import { getUser, formatDate, validateEmail, createPost } from '@/utils';
```

## Error Handling

```typescript
const fetchData = async () => {
  try {
    const { data } = await api.get('/data');
    return data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
  }
};
```

## Constants

```typescript
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;
```

## Best Practices

- **Early return** over nested conditionals
- **Single responsibility** per function
- **Consistent return types** (avoid mixing undefined/null)
- **Named exports** preferred over default exports
- **No inline handlers** — define named functions, then reference
- **Domain separation** — organize functions by domain, import explicitly
