/**
 * Register Page
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuthStore()
  const [form, setForm] = useState({
    username: '', email: '', password: '', password_confirm: '',
    first_name: '', last_name: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.password_confirm) {
      toast.error('Passwords do not match')
      return
    }
    setIsLoading(true)
    try {
      await register(form)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (error: any) {
      const data = error.response?.data
      const msg = data
        ? Object.values(data).flat().join(' ')
        : 'Registration failed'
      toast.error(msg)
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
          <p className="text-dark-text-muted">Create your personal knowledge vault</p>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-3xl p-8">
          <h2 className="text-2xl font-serif font-semibold mb-6">Create account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="First name" value={form.first_name} onChange={set('first_name')} />
              <Input placeholder="Last name"  value={form.last_name}  onChange={set('last_name')} />
            </div>
            <Input type="text"     placeholder="Username" value={form.username} onChange={set('username')} required />
            <Input type="email"    placeholder="Email"    value={form.email}    onChange={set('email')}    required />
            <Input type="password" placeholder="Password" value={form.password} onChange={set('password')} required />
            <Input type="password" placeholder="Confirm password" value={form.password_confirm} onChange={set('password_confirm')} required />

            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}
              leftIcon={<UserPlus className="w-5 h-5" />}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-dark-text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-cyan hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
