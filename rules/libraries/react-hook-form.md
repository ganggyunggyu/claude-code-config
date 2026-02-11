# React Hook Form + Zod Guidelines

## Installation

```bash
pnpm add react-hook-form zod @hookform/resolvers
```

## Basic Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
});

type FormData = z.infer<typeof schema>;

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await api.post('/auth/login', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

## Zod Schema Patterns

```typescript
const userSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  phone: z.string().regex(/^\d{3}-\d{4}-\d{4}$/),
  age: z.number().int().min(0).max(150),
  role: z.enum(['admin', 'member', 'guest']),
  tags: z.array(z.string()).min(1),
  address: z.object({
    street: z.string(),
    city: z.string(),
  }).optional(),
});

// Password confirmation
const passwordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

## Controller (Custom Components)

```typescript
import { Controller } from 'react-hook-form';

<Controller
  name="category"
  control={control}
  render={({ field, fieldState: { error } }) => (
    <Select
      value={field.value}
      onChange={field.onChange}
      error={error?.message}
    />
  )}
/>
```

## Dynamic Fields

```typescript
import { useFieldArray } from 'react-hook-form';

const { fields, append, remove } = useFieldArray({ control, name: 'items' });

{fields.map((field, index) => (
  <div key={field.id}>
    <input {...register(`items.${index}.name`)} />
    <button onClick={() => remove(index)}>Remove</button>
  </div>
))}
<button onClick={() => append({ name: '' })}>Add Item</button>
```

## Best Practices

- Define Zod schemas separately from components
- Use `z.infer<typeof schema>` for type derivation
- `zodResolver` for validation integration
- `Controller` for non-native form elements
- `useFieldArray` for dynamic lists
