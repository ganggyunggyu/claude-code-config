---
description: React Hook Form + Zod Validation 폼 자동 생성
argument-hint: <폼명> [옵션]
---

# Form + Validation 생성

React Hook Form과 Zod를 사용한 폼 컴포넌트를 자동으로 생성합니다.

## 사용법

```
/form LoginForm
/form RegisterForm --zod
/form ProfileForm --full
```

## 기본 Form

### React Hook Form 기본
```typescript
// src/components/LoginForm.tsx
import { useForm } from 'react-hook-form'

interface LoginFormData {
  email: string
  password: string
}

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    console.log(data)
    // API 호출
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Email</label>
        <input
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          })}
        />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Loading...' : 'Login'}
      </button>
    </form>
  )
}

export default LoginForm
```

## Zod Schema Validation

### Zod Schema 정의
```typescript
// src/schemas/loginSchema.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>
```

### Zod + React Hook Form
```typescript
// src/components/LoginForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/schemas/loginSchema'

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* same as above */}
    </form>
  )
}
```

## 복잡한 Form 예시

### 회원가입 폼
```typescript
// src/schemas/registerSchema.ts
import { z } from 'zod'

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be less than 20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),

    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),

    age: z
      .number()
      .min(18, 'You must be at least 18 years old')
      .max(120, 'Invalid age'),

    termsAccepted: z
      .boolean()
      .refine((val) => val === true, 'You must accept the terms and conditions'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
```

```typescript
// src/components/RegisterForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '@/schemas/registerSchema'
import { useCreateUser } from '@/hooks/useCreateUser'

const RegisterForm = () => {
  const createUser = useCreateUser()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: 18,
      termsAccepted: false,
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await createUser.mutateAsync(data)
      reset()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Username</label>
        <input {...register('username')} />
        {errors.username && <span className="text-red-500">{errors.username.message}</span>}
      </div>

      <div>
        <label>Email</label>
        <input type="email" {...register('email')} />
        {errors.email && <span className="text-red-500">{errors.email.message}</span>}
      </div>

      <div>
        <label>Password</label>
        <input type="password" {...register('password')} />
        {errors.password && <span className="text-red-500">{errors.password.message}</span>}
      </div>

      <div>
        <label>Confirm Password</label>
        <input type="password" {...register('confirmPassword')} />
        {errors.confirmPassword && <span className="text-red-500">{errors.confirmPassword.message}</span>}
      </div>

      <div>
        <label>Age</label>
        <input type="number" {...register('age', { valueAsNumber: true })} />
        {errors.age && <span className="text-red-500">{errors.age.message}</span>}
      </div>

      <div>
        <label>
          <input type="checkbox" {...register('termsAccepted')} />
          I accept the terms and conditions
        </label>
        {errors.termsAccepted && <span className="text-red-500">{errors.termsAccepted.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  )
}
```

## Controller 사용 (커스텀 컴포넌트)

### Select, DatePicker 등
```typescript
import { Controller } from 'react-hook-form'
import Select from 'react-select'
import DatePicker from 'react-datepicker'

const ProfileForm = () => {
  const { control, handleSubmit } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* React Select */}
      <Controller
        name="country"
        control={control}
        rules={{ required: 'Country is required' }}
        render={({ field }) => (
          <Select
            {...field}
            options={countryOptions}
            placeholder="Select a country"
          />
        )}
      />

      {/* Date Picker */}
      <Controller
        name="birthDate"
        control={control}
        render={({ field }) => (
          <DatePicker
            selected={field.value}
            onChange={field.onChange}
            dateFormat="yyyy-MM-dd"
          />
        )}
      />
    </form>
  )
}
```

## useFormContext (중첩 폼)

```typescript
// src/components/AddressFields.tsx
import { useFormContext } from 'react-hook-form'

const AddressFields = () => {
  const { register, formState: { errors } } = useFormContext()

  return (
    <div>
      <input {...register('address.street')} placeholder="Street" />
      <input {...register('address.city')} placeholder="City" />
      <input {...register('address.zipCode')} placeholder="Zip Code" />
    </div>
  )
}

// src/components/UserForm.tsx
import { FormProvider, useForm } from 'react-hook-form'

const UserForm = () => {
  const methods = useForm()

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <input {...methods.register('name')} />
        <AddressFields />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  )
}
```

## Dynamic Form (동적 필드)

```typescript
import { useFieldArray } from 'react-hook-form'

const DynamicForm = () => {
  const { control, register } = useForm({
    defaultValues: {
      items: [{ name: '', quantity: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  return (
    <form>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`items.${index}.name`)} />
          <input
            type="number"
            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
          />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ name: '', quantity: 1 })}
      >
        Add Item
      </button>
    </form>
  )
}
```

## 파일 업로드

```typescript
const UploadForm = () => {
  const { register, handleSubmit, watch } = useForm()
  const file = watch('file')

  const onSubmit = async (data: any) => {
    const formData = new FormData()
    formData.append('file', data.file[0])

    // Upload
    await uploadFile(formData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="file"
        {...register('file', {
          required: 'File is required',
          validate: {
            lessThan10MB: (files) =>
              files[0]?.size < 10000000 || 'Max 10MB',
            acceptedFormats: (files) =>
              ['image/jpeg', 'image/png'].includes(files[0]?.type) ||
              'Only JPEG or PNG',
          },
        })}
      />
      {file?.[0] && <p>Selected: {file[0].name}</p>}
      <button type="submit">Upload</button>
    </form>
  )
}
```

## 생성 프로세스

### 1단계: 스키마 정의
```bash
src/schemas/{formName}Schema.ts
```

### 2단계: Form 컴포넌트
```bash
src/components/{FormName}.tsx
```

### 3단계: Validation 설정
- Zod schema 작성
- React Hook Form resolver 연결

## 사용 예시

```
사용자: /form LoginForm
```

**생성 파일:**
- `src/components/LoginForm.tsx`
- `src/schemas/loginSchema.ts`
- Zod + React Hook Form 포함

## 주의사항

- **Validation**: 클라이언트 + 서버 양쪽 검증 필수
- **Error 처리**: 명확한 에러 메시지
- **Submit**: isSubmitting으로 중복 제출 방지
- **Reset**: 제출 후 폼 초기화

## 참고

- React Hook Form: https://react-hook-form.com/
- Zod: https://zod.dev/
- @hookform/resolvers: https://github.com/react-hook-form/resolvers
