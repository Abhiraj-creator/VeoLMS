import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLoginMutation, useSignupMutation } from '../api/auth.api'
import { setCredentials } from '../state/auth.slice'
import { useToast } from '../../../shared/components/ui/Toast'
import { ROUTES } from '../../../constants/routes'

type AuthMode = 'login' | 'signup'

interface AuthFormState {
  name: string
  email: string
  password: string
  adminKey: string
}

interface AuthFormErrors {
  name?: string
  email?: string
  password?: string
  adminKey?: string
}

interface AuthLocationState {
  from?: string
}

function isAuthLocationState(value: unknown): value is AuthLocationState {
  return Boolean(value && typeof value === 'object' && 'from' in value)
}

function normalizeRedirect(value: string | null | undefined): string {
  if (!value) {
    return ROUTES.dashboard()
  }

  if (value.startsWith('/')) {
    return value
  }

  return ROUTES.dashboard()
}

function validateEmail(email: string): boolean {
  return /^\S+@\S+\.\S+$/.test(email)
}

function scorePassword(password: string): number {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return score
}

function validateForm(
  mode: AuthMode,
  values: AuthFormState,
  showAdminKey: boolean
): AuthFormErrors {
  const errors: AuthFormErrors = {}

  if (mode === 'signup' && values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.'
  }

  if (!validateEmail(values.email)) {
    errors.email = 'Enter a valid email address.'
  }

  const passwordScore = scorePassword(values.password)
  if (mode === 'signup') {
    if (showAdminKey && !values.adminKey.trim()) {
      errors.adminKey = 'Admin key is required to register as admin.'
    }

    if (values.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
    } else if (passwordScore < 4) {
      errors.password = 'Use upper case, a number, and a special character.'
    }
  } else if (!values.password) {
    errors.password = 'Password is required.'
  }

  return errors
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof (error as { data?: unknown }).data === 'object' &&
    (error as { data?: { message?: string } }).data?.message
  ) {
    return (error as { data: { message: string } }).data.message
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as { error?: unknown }).error === 'string'
  ) {
    return (error as { error: string }).error
  }

  return 'Something went wrong. Please try again.'
}

export function useAuthForm(mode: AuthMode) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [login] = useLoginMutation()
  const [signup] = useSignupMutation()
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const locationState = location.state
  const redirectTarget = normalizeRedirect(
    isAuthLocationState(locationState) ? locationState.from : searchParams.get('redirect')
  )

  const [values, setValues] = useState<AuthFormState>({
    name: '',
    email: '',
    password: '',
    adminKey: '',
  })
  const [errors, setErrors] = useState<AuthFormErrors>({})
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAdminKey, setShowAdminKey] = useState(false)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors = validateForm(mode, values, showAdminKey)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      setError('Please fix the highlighted fields.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const payload =
        mode === 'login'
          ? await login({ email: values.email, password: values.password }).unwrap()
          : await signup({
              name: values.name,
              email: values.email,
              password: values.password,
              adminKey: showAdminKey ? values.adminKey.trim() || undefined : undefined,
            }).unwrap()

      dispatch(setCredentials(payload))
      toast.success(
        mode === 'login' ? 'Welcome back.' : 'Account created successfully.',
        mode === 'login'
          ? 'You are being taken to your dashboard.'
          : 'Your new account is ready.'
      )
      navigate(mode === 'login' ? redirectTarget : ROUTES.dashboard(), { replace: true })
    } catch (requestError) {
      const message = getErrorMessage(requestError)
      setError(message)
      toast.error(mode === 'login' ? 'Login failed.' : 'Signup failed.', message)
    } finally {
      setIsLoading(false)
    }
  }

  const passwordScore = scorePassword(values.password)

  return {
    values,
    errors,
    error,
    isLoading,
    showAdminKey,
    setShowAdminKey,
    passwordScore,
    handleChange,
    handleSubmit,
  }
}
