import { Eye, EyeOff, Newspaper } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate, type Location } from 'react-router'
import { getGetMeQueryKey, useGetMe, useLogin } from '@/api/generated/auth/auth'
import { queryClient } from '@/api/query-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const me = useGetMe()
  const login = useLogin({ mutation: { meta: { showsOwnError: true } } })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const passwordInput = useRef<HTMLInputElement>(null)

  // The message doesn't say which field is wrong, so both are marked.
  const errorProps = login.isError
    ? { 'aria-invalid': true, 'aria-describedby': 'login-error' }
    : {}

  // The page RequireAuth sent the user away from, if any.
  const from = (location.state as { from?: Location } | null)?.from
  const returnTo = from ? `${from.pathname}${from.search}` : '/'

  if (me.data) return <Navigate to={returnTo} replace />

  const signIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    login.mutate(
      { data: { email, password } },
      {
        onSuccess: (signedInUser) => {
          // Drop anything cached for a previous user, then start as this one.
          queryClient.removeQueries({
            predicate: (query) => query.queryKey[0] !== getGetMeQueryKey()[0],
          })
          queryClient.setQueryData(getGetMeQueryKey(), signedInUser)

          navigate(returnTo, { replace: true })
        },
        // Keep what was typed and put the cursor back in the password, which
        // is the likelier typo.
        onError: () => passwordInput.current?.select(),
      },
    )
  }

  // Typing again clears the old error.
  const changeEmail = (value: string) => {
    setEmail(value)
    login.reset()
  }
  const changePassword = (value: string) => {
    setPassword(value)
    login.reset()
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6">
      <title>Sign in · Editorial Tracker</title>
      <div className="flex items-center gap-2 font-semibold">
        <Newspaper className="size-5" />
        Editorial Tracker
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1 className="text-lg">Sign in</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={signIn} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                autoFocus
                required
                value={email}
                onChange={(event) => changeEmail(event.target.value)}
                {...errorProps}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <InputGroup>
                <InputGroupInput
                  ref={passwordInput}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => changePassword(event.target.value)}
                  {...errorProps}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((shown) => !shown)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>

            {login.error && (
              <p
                id="login-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {login.error.message}
              </p>
            )}

            <Button
              type="submit"
              variant="brand"
              className="w-full"
              disabled={login.isPending}
            >
              {login.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
