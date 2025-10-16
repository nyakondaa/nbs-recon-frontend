'use client'
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Pencil } from 'lucide-react'
import CreateUserModal from '@/app/components/createNewuserModal'
import { CreateUser, User, fetchUsers , deleteUser, updateUser} from '@/app/services/api'
import EditUserModal from '@/app/components/editUserModal'




const RoleTag = ({ role }) => {
  let colorClass = 'bg-gray-100 text-gray-800'
  if (role === 'Admin') colorClass = 'bg-indigo-100 text-indigo-800'
  if (role === 'USER') colorClass = 'bg-blue-100 text-blue-800'

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ${colorClass}`}
    >
      {role}
    </span>
  )
}



const UserRow = ({ user }) => {
  const [isEditModal, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()

  // ✅ DELETE MUTATION
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (error) => {
      console.error("Delete failed:", error)
    },
  })

  // ✅ UPDATE MUTATION
  const updateUserMutation = useMutation({
    mutationFn: ({ id, updatedUser }) => updateUser(id, updatedUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setIsModalOpen(false)
    },
    onError: (error) => {
      console.log("Failed to update user", error)
    },
  })

  // ✅ ACTION HANDLER
  const handleAction = async (action, userId) => {
    if (action === "UPDATE") {
      setIsModalOpen(true)
      return
    }

    if (action === "Delete") {
      const confirmDelete = confirm(`Are you sure you want to delete ${user.name}?`)
      if (!confirmDelete) return

      try {
        await deleteUserMutation.mutateAsync(userId)
        console.log(`User ${userId} deleted successfully.`)
      } catch (error) {
        console.error("Couldn't delete user:", error)
      }
    }
  }

  // ✅ Called when modal form submits
  const handleUpdate = async (updatedUserData) => {
    try {
      await updateUserMutation.mutateAsync({ id: user.id, updatedUser: updatedUserData })
    } catch (error) {
      console.error("Couldn't update user:", error)
    }
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 items-center hover:bg-gray-50 transition duration-150 last:border-b-0">
        {/* Name Column */}
        <div className="col-span-4 flex items-center space-x-3 pl-6">
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={user.avatarUrl}
            alt={`Avatar of ${user.name}`}
            onError={(e) => {
              e.target.onerror = null
              e.target.src = "https://placehold.co/40x40/e5e7eb/6b7280?text=U"
            }}
          />
          <div className="font-medium text-gray-900">{user.name}</div>
        </div>

        {/* Email Column */}
        <div className="col-span-3 text-sm text-gray-500">{user.email}</div>

        {/* Role Column */}
        <div className="col-span-2">
          <RoleTag role={user.role} />
        </div>

        {/* Action Buttons */}
        <div className="col-span-2 flex justify-end space-x-3 pr-6">
          <button
            onClick={() => handleAction("UPDATE", user.id)}
            className="text-gray-400 hover:text-indigo-600 transition duration-150 p-2 rounded-full hover:bg-gray-100"
            aria-label={`Edit ${user.name}`}
          >
            <Pencil className="h-5 w-5" />
          </button>

          <button
            onClick={() => handleAction("Delete", user.id)}
            disabled={deleteUserMutation.isLoading}
            className="text-gray-400 hover:text-red-600 transition duration-150 p-2 rounded-full hover:bg-gray-100"
            aria-label={`Delete ${user.name}`}
          >
            {deleteUserMutation.isLoading ? (
              <span className="animate-pulse text-red-500">...</span>
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* ✅ Edit Modal */}
      <EditUserModal
        isOpen={isEditModal}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleUpdate}
        isLoading={updateUserMutation.isLoading}
        user={user} 
      />
    </>
  )
}



// Main Application Component
const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()

  // React Query for fetching users
  const { 
    data: users = [], 
    isLoading, 
    error,
    isError,
    refetch 
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })



  
  const createUserMutation = useMutation({
    mutationFn: CreateUser,
    onSuccess: (createdUser) => {
      // Invalidate and refetch users query to update the list
      queryClient.invalidateQueries({ queryKey: ['users'] })
      
      console.log('✅ User created successfully:', createdUser)
      setIsModalOpen(false)
    },
    onError: (error: any) => {
      console.error('❌ Error creating user:', error)
      alert('Error creating user: ' + error.message)
    }
  })

  const handleCreateUser = async (newUser: user) => {
    try {
      console.log('🎯 handleCreateUser called with:', newUser)
      await createUserMutation.mutateAsync(newUser)
    } catch (error) {
     
      console.error('Mutation error:', error)
    }
  }

 
  const transformedUsers = users.map((u) => ({
    id: u.id,
    name: u.username,
    email: u.email,
    role: u.roleName,
    status: 'Active',
    avatarUrl: `https://placehold.co/40x40/e0f2f1/004d40?text=${u.username?.charAt(0)?.toUpperCase() || 'U'}`,
  }))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-['Inter',_sans-serif] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-['Inter',_sans-serif] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Users</h2>
          <p className="text-gray-600 mb-4">{error?.message || 'Failed to load users'}</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-['Inter',_sans-serif]">
      {/* Header Section */}
      <header className="flex justify-between items-start mb-8 sm:mb-10 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage users and system configurations.
          </p>
        </div>

        {/* Add New User Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={createUserMutation.isPending}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5" />
          <span>
            {createUserMutation.isPending ? 'Creating...' : 'Add New User'}
          </span>
        </button>
      </header>

      {/* User Management Card */}
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            User Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {transformedUsers.length} user{transformedUsers.length !== 1 ? 's' : ''} found
          </p>
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
          {transformedUsers.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </div>

        {/* Fallback for empty data */}
        {transformedUsers.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No users found. Click "Add New User" to get started.
          </div>
        )}
      </div>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateUser}
        isLoading={createUserMutation.isPending}
      />

    
    </div>
  )
}

export default App