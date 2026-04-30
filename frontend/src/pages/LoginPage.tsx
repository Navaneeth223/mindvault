/**
 * Login Page
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(username, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-accent-cyan to-accent-indigo bg-clip-text text-transparent mb-2">
            MindVault
          </h1>
          <p className="text-dark-text-muted">Everything worth keeping</p>
        </div>

        {/* Form */}
        <div className="bg-dark-surface border border-dark-border rounded-3xl p-8">
          <h2 className="text-2xl font-serif font-semibold mb-6">Welcome back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              leftIcon={<LogIn className="w-5 h-5" />}
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-dark-text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-cyan hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-dark-elevated border border-dark-border rounded-2xl">
          <p className="text-xs text-dark-text-muted text-center">
            <strong>Demo:</strong> username: <code>demo</code> / password: <code>demo1234</code>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
