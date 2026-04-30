import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <h1 className="text-2xl font-serif mb-4">Register Page</h1>
        <Link to="/login" className="text-accent-cyan hover:underline">Back to Login</Link>
      </motion.div>
    </div>
  )
}
