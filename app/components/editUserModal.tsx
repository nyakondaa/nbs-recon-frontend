'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserCog, X } from 'lucide-react'
import { User } from '../services/api'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (user: { username: string; roleName: string; email: string; password?: string }) => void
  user?: {
    id: number
    name: string
    email: string
    role: string
    status: string
    avatarUrl: string
  } | null
  isLoading?: boolean
}

const ACCENT_COLOR = 'hsl(140, 60%, 30%)' // A professional, deep green (e.g., a corporate primary color)
const HOVER_COLOR = 'hsl(140, 60%, 40%)'

export default function EditUserModal({
  isOpen,
  onClose,
  onUpdate,
  user,
  isLoading = false,
}: EditUserModalProps) {
  const [username, setUsername] = React.useState('')
  const [roleName, setRoleName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  
  React.useEffect(() => {
    if (user && isOpen) {
      setUsername(user.name || '')
      setEmail(user.email || '')
      setRoleName(user.role || '')
      setPassword('') // Clear password field for security
    } else {
      
      setUsername('')
      setEmail('')
      setRoleName('')
      setPassword('')
    }
  }, [user, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !roleName.trim() || !email.trim()) {
      alert('Please fill in all required fields')
      return
    }

    const userData = {
      username: username.trim(),
      email: email.trim(),
      roleName: roleName.trim(),
      ...(password.trim() && { password: password.trim() }) // Only include password if provided
    } 

    onUpdate(userData)
  }

  const handleClose = () => {
    // Reset form on close
    setUsername('')
    setEmail('')
    setRoleName('')
    setPassword('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white p-6 rounded-xl shadow-2xl transition-all duration-300">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded-full"
          aria-label="Close"
          disabled={isLoading}
        >
          <X className="h-5 w-5" />
        </Button>

        <DialogHeader className="space-y-1">
          <div
            className="flex items-center space-x-3 text-2xl font-bold"
            style={{ color: ACCENT_COLOR }}
          >
            <UserCog className="h-6 w-6" />
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Edit User
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-500 pt-2">
            Update user details. Leave password blank to keep the current one.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username" className="font-medium text-gray-700">
              Username *
            </Label>
            <Input
              id="username"
              placeholder="e.g., jane.doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              className="border-gray-300 focus-visible:ring-2 focus-visible:ring-offset-2 text-black"
              style={
                {
                  '--tw-ring-color': ACCENT_COLOR,
                } as React.CSSProperties
              }
            />
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium text-gray-700">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., jane.doe@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="border-gray-300 focus-visible:ring-2 focus-visible:ring-offset-2 text-black"
              style={
                {
                  '--tw-ring-color': ACCENT_COLOR,
                } as React.CSSProperties
              }
            />
          </div>

          {/* Role Select */}
          <div className="space-y-2">
            <Label className="font-medium text-gray-700">Role *</Label>
            <Select value={roleName} onValueChange={setRoleName} disabled={isLoading}>
              <SelectTrigger
                className="border-gray-300 focus-visible:ring-2 focus-visible:ring-offset-2 text-black"
                style={
                  {
                    '--tw-ring-color': ACCENT_COLOR,
                  } as React.CSSProperties
                }
              >
                <SelectValue 
                  className="text-black"
                  placeholder="Select user role..." 
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="owner">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password" className="font-medium text-gray-700">
              New Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Leave blank to keep current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="border-gray-300 focus-visible:ring-2 focus-visible:ring-offset-2 text-black"
              style={
                {
                  '--tw-ring-color': ACCENT_COLOR,
                } as React.CSSProperties
              }
            />
            <p className="text-xs text-gray-500">
              Only enter a new password if you want to change it
            </p>
          </div>

          {/* User Info Display */}
          {user && (
            <div className="text-sm p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatarUrl}
                  alt={`Avatar of ${user.name}`}
                  className="h-8 w-8 rounded-full"
                />
                <div>
                  <p className="font-semibold">Editing: {user.name}</p>
                  <p className="text-xs opacity-80">ID: {user.id}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-end space-x-3 pt-6">
            {/* Cancel Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>

            {/* Update Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="text-white transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={
                {
                  backgroundColor: ACCENT_COLOR,
                  '--hover-bg': HOVER_COLOR,
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = HOVER_COLOR
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = ACCENT_COLOR
                }
              }}
            >
              {isLoading ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}