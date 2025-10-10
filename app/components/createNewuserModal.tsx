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
import { UserPlus, X } from 'lucide-react'
import { getRoles } from '../services/api'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (user: {
    username: string
    roleName: string
    password: string
    email: string
  }) => void
}

interface Role {
  id: number
  roleName: string
}

const ACCENT_COLOR = 'hsl(140, 60%, 30%)'
const HOVER_COLOR = 'hsl(140, 60%, 40%)'

export default function CreateUserModal({ isOpen, onClose, onCreate }: CreateUserModalProps) {
  const [username, setUsername] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [roleName, setRoleName] = React.useState('')
  const [roles, setRoles] = React.useState<Role[]>([])
  const [loadingRoles, setLoadingRoles] = React.useState(false)

  // Fetch roles when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLoadingRoles(true)
      getRoles()
        .then((data) => setRoles(data))
        .catch(console.error)
        .finally(() => setLoadingRoles(false))
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !email.trim() || !roleName.trim()) {
      alert('Please fill in all fields')
      return
    }

    onCreate({
      username: username.trim(),
      email: email.trim(),
      roleName: roleName.trim(),
      password: 'P@ssword123', // default password
    })

    // Reset form
    setUsername('')
    setEmail('')
    setRoleName('')
  }

  const handleClose = () => {
    setUsername('')
    setEmail('')
    setRoleName('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white p-6 rounded-xl shadow-2xl transition-all duration-300">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded-full"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>

        <DialogHeader className="space-y-1">
          <div className="flex items-center space-x-3 text-2xl font-bold" style={{ color: ACCENT_COLOR }}>
            <UserPlus className="h-6 w-6" />
            <DialogTitle className="text-2xl font-bold tracking-tight">Create User</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-500 pt-2">
            Fill in the details to create a new user. A default password will be assigned.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="e.g., jane.doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="border-gray-300 focus-visible:ring-2 focus-visible:ring-offset-2 text-black"
              style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., jane.doe@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-gray-300 focus-visible:ring-2 focus-visible:ring-offset-2 text-black"
              style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
            />
          </div>

          <div className="space-y-2">
            <Label>Role *</Label>
            <Select value={roleName} onValueChange={setRoleName} disabled={loadingRoles}>
              <SelectTrigger className="border-gray-300 focus-visible:ring-2 focus-visible:ring-offset-2 text-black" style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}>
                <SelectValue placeholder="Select user role..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.roleName}>
                    {role.roleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" style={{ backgroundColor: ACCENT_COLOR, '--hover-bg': HOVER_COLOR } as React.CSSProperties}>
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
