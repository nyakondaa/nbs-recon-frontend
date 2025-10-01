'use client'
import React, { use, useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import CreateUserModal from '@/app/components/createNewuserModal'
import { CreateUser, user, fetchUsers } from '@/app/services/api'

const MOCK_USERS = [
  {
    id: 1,
    name: 'Ethan Harper',
    email: 'ethan.harper@example.com',
    role: 'Admin',
    status: 'Active',
    avatarUrl: 'https://placehold.co/40x40/e0f2f1/004d40?text=EH', // Placeholder URL
  },
  {
    id: 2,
    name: 'Olivia Bennett',
    email: 'olivia.bennett@example.com',
    role: 'Editor',
    status: 'Active',
    avatarUrl: 'https://placehold.co/40x40/ffe0b2/e65100?text=OB', // Placeholder URL
  },
  {
    id: 3,
    name: 'Liam Carter',
    email: 'liam.carter@example.com',
    role: 'Viewer',
    status: 'Inactive',
    avatarUrl: 'https://placehold.co/40x40/cfd8dc/263238?text=LC', // Placeholder URL
  },
]

const StatusBadge = ({ status }) => {
  const isActive = status === 'Active'
  const colorClass = isActive
    ? 'bg-green-100 text-green-700 ring-green-600/20'
    : 'bg-red-100 text-red-700 ring-red-600/20'
  const dotClass = isActive ? 'bg-green-500' : 'bg-red-500'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colorClass}`}
    >
      <svg
        className={`mr-1.5 h-2 w-2 ${dotClass}`}
        viewBox="0 0 6 6"
        aria-hidden="true"
      >
        <circle cx={3} cy={3} r={3} />
      </svg>
      {status}
    </span>
  )
}

// Reusable component for the Role tag
const RoleTag = ({ role }) => {
  let colorClass = 'bg-gray-100 text-gray-800'
  if (role === 'Admin') colorClass = 'bg-indigo-100 text-indigo-800'
  if (role === 'Editor') colorClass = 'bg-blue-100 text-blue-800'

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ${colorClass}`}
    >
      {role}
    </span>
  )
}

// Main User Management Table Row
const UserRow = ({ user }) => {
  // Simple handler for demonstration
  const handleAction = (action, userId) => {
    console.log(`${action} action triggered for user ID: ${userId}`)
    // In a real app, this would trigger a modal or an API call
  }

  return (
    <div className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 items-center hover:bg-gray-50 transition duration-150 last:border-b-0">
      {/* Name Column (Col 4) */}
      <div className="col-span-4 flex items-center space-x-3 pl-6">
        <img
          className="h-10 w-10 rounded-full object-cover"
          src={user.avatarUrl}
          alt={`Avatar of ${user.name}`}
          onError={(e) => {
            e.target.onerror = null
            e.target.src = 'https://placehold.co/40x40/e5e7eb/6b7280?text=U'
          }}
        />
        <div className="font-medium text-gray-900">{user.name}</div>
      </div>

      {/* Email Column (Col 3) */}
      <div className="col-span-3 text-sm text-gray-500">{user.email}</div>

      {/* Role Column (Col 2) */}
      <div className="col-span-2">
        <RoleTag role={user.role} />
      </div>

      {/* Status Column (Col 2) */}
      <div className="col-span-1">
        <StatusBadge status={user.status} />
      </div>

      {/* Actions Column (Col 2) */}
      <div className="col-span-2 flex justify-end space-x-3 pr-6">
        <button
          onClick={() => handleAction('Edit', user.id)}
          className="text-gray-400 hover:text-indigo-600 transition duration-150 p-2 rounded-full hover:bg-gray-100"
          aria-label={`Edit ${user.name}`}
        >
          <Pencil className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleAction('Delete', user.id)}
          className="text-gray-400 hover:text-red-600 transition duration-150 p-2 rounded-full hover:bg-gray-100"
          aria-label={`Delete ${user.name}`}
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

// Main Application Component
const App = () => {
  // In a real Next.js app, you'd fetch this data via getServerSideProps or a useQuery hook.
  // Here, we use local state initialized with the mock data.
  const [users, setUsers] = useState(MOCK_USERS)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreateUser = async (newUser: user) => {
    try {
      console.log('🎯 handleCreateUser called with:', newUser)

      // Remove the .ok check - the CreateUser function already handles errors
      const createdUser = await CreateUser(newUser)


      console.log('✅ User created successfully:', createdUser)

      
      setUsers((prev) => [
        ...prev,
        {
          id: createdUser.id, // Use the actual ID from response
          name: createdUser.username,
          email: createdUser.email,
          role: createdUser.roleName, // Or createdUser.roleName if backend returns it
          status: 'Active',
          avatarUrl: `https://placehold.co/40x40/e0f2f1/004d40?text=${createdUser.username.charAt(0).toUpperCase()}`,
        },
      ])

      setIsModalOpen(false)
    } catch (error: any) {
      console.error('❌ Error creating user:', error)
      alert('Error creating user: ' + error.message)
    }
  }

  useState(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await fetchUsers()
        console.log('Fetched users:', fetchedUsers)
        setUsers(
          fetchedUsers.map((u) => ({
            id: u.id,
            name: u.username,
            email: u.email,
            role: u.roleName,
            status: 'Active', // Assuming all fetched users are active
            avatarUrl: `https://placehold.co/40x40/e0f2f1/004d40?text=${u.username.charAt(0).toUpperCase()}`,
          }))
        )
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    loadUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-['Inter',_sans-serif]">
      {/* Header Section */}
      <header className="flex justify-between items-start mb-8 sm:mb-10 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage users and system configurations.
          </p>
        </div>

        {/* Add New User Button */}
        <button
          onClick={() =>
            isModalOpen ? setIsModalOpen(false) : setIsModalOpen(true)
          }
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
        >
          <Plus className="h-5 w-5" />
          <span>Add New User</span>
        </button>
      </header>

      {/* User Management Card */}
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            User Management
          </h2>
        </div>

        {/* Table Header (Responsive Grid) */}
        <div className="hidden lg:grid grid-cols-12 gap-4 text-xs font-semibold uppercase text-gray-500 bg-gray-50 px-6 py-4">
          <div className="col-span-4">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </div>

        {/* Fallback for empty data */}
        {users.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No users found. Click "Add New User" to get started.
          </div>
        )}
      </div>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateUser}
      />
    </div>
  )
}

export default App
