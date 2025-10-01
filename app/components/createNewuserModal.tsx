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
import { UserPlus, X } from 'lucide-react' // Importing an icon for visual flair
import { user } from '../services/api'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (user: { username: string; roleName: string; password: string, email: string}) => void
}

const ACCENT_COLOR = 'hsl(140, 60%, 30%)' // A professional, deep green (e.g., a corporate primary color)
const HOVER_COLOR = 'hsl(140, 60%, 40%)'

export default function CreateUserModal({
  isOpen,
  onClose,
  onCreate,
}: CreateUserModalProps) {
  const [username, setUsername] = React.useState('')
  const [roleName, setroleName] = React.useState('')
  const [email, setEmail] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
   

     e.preventDefault()

  if (!username.trim() || !roleName.trim() || !email.trim()) {
    alert('Please fill in all fields')
    return
  }

  const user = {
    username: username.trim(),
    email: email.trim(),
    roleName: roleName.trim(), // Make sure it's roleName
    password: 'P@ssword123',
  }

  // Proper logging
  console.log('🔄 Creating user:', user)
  console.log('📤 JSON stringified:', JSON.stringify(user))

  onCreate(user)
  setUsername('')
  setroleName('')
  setEmail('')

  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white p-6 rounded-xl shadow-2xl transition-all duration-300">
        {/* Close Button - Added for better accessibility and design */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded-full"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>

        <DialogHeader className="space-y-1">
          <div
            className="flex items-center space-x-3 text-2xl font-bold"
            style={{ color: ACCENT_COLOR }}
          >
            <UserPlus className="h-6 w-6" />
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Create New User
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-500 pt-2">
            Enter the details to add a new account. A secure default password
            will be assigned.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username" className="font-medium text-gray-700">
              Username
            </Label>
            <Input
              id="username"
              placeholder="e.g., jane.doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              // Modern focus ring
              className="border-gray-300 focus-visible:ring-2 focus-visible:ring-offset-2 text-black"
              style={
                {
                  '--tw-ring-color': ACCENT_COLOR, // Using style for dynamic focus color
                } as React.CSSProperties
              }
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="username" className="font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              placeholder="e.g., john.Doe@NBS.co.zw"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // Modern focus ring
              className="border-gray-300 focus-visible:ring-2 focus-visible:ring-offset-2 text-black"
              style={
                {
                  '--tw-ring-color': ACCENT_COLOR, // Using style for dynamic focus color
                } as React.CSSProperties
              }
            />
          </div>

          {/* Role Select */}
          <div className="space-y-2">
            <Label className="font-medium text-gray-700">Role</Label>
            <Select 
            
             value={roleName} onValueChange={setroleName}>
              <SelectTrigger
                className="border-gray-300 focus-visible:ring-2 focus-visible:ring-offset-2 text-black"
                style={
                  {
                    '--tw-ring-color': ACCENT_COLOR,
                  } as React.CSSProperties
                }
              >
                <SelectValue 
                className='text-black'
                placeholder="Select user role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              
                <SelectItem value="owner">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

         

          {/* Default Password Alert/Hint */}
          <div className="text-sm p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <span className="font-semibold">Default Password:</span>{' '}
            <code className="font-mono text-xs select-all">P@ssword123</code>
            <p className="text-xs mt-1 opacity-80">
              The user must change this password on their first login.
            </p>
          </div>

          <DialogFooter className="flex justify-end space-x-3 pt-6">
            {/* Cancel Button - Subtle and secondary */}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>

            {/* Create Button - Primary action with accent color */}
            <Button
              type="submit"
              className="text-white transition-all duration-200 shadow-md hover:shadow-lg"
              style={
                {
                  backgroundColor: ACCENT_COLOR,
                  '--hover-bg': HOVER_COLOR,
                } as React.CSSProperties
              }
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = HOVER_COLOR)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = ACCENT_COLOR)
              }
            >
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
