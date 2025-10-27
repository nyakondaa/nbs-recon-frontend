
'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CalendarIcon,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Eye,
  Edit,
  X,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { getReports, downloadReport, fetchReportsAndUsers } from '@/app/services/api'

interface Report {
  id: string
  name: string
  dateGenerated: string
  reviewedBy: string
  reportDoneBy: string
  status: 'approved' | 'pending' | 'rejected' | 'draft'
}

interface User {
  id: number
  username: string
  email: string
  roleName: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<Date>()
  const [approvedByFilter, setApprovedByFilter] = useState('')
  const [reportDoneByFilter, setReportDoneByFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const statusOptions = [
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'draft', label: 'Draft' }
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetchReportsAndUsers()
        setUsers(usersResponse)

        // Fetch reports
        const reportsResponse = await getReports()

        if ('status' in reportsResponse && reportsResponse.status === 'error') {
          console.error(reportsResponse.message)
          setReports([])
        } else {
          const formattedReports = reportsResponse.map((report) => ({
            id: report.id.toString(),
            name: report.reportName,
            dateGenerated: new Date(report.generatedAt).toLocaleDateString(),
            reviewedBy: report.reviewedByUsername || '-',
            reportDoneBy: report.generatedByUsername || '-',
            status: report.status.toLowerCase() as 'approved' | 'pending' | 'rejected' | 'draft'

          }))

          setReports(formattedReports)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
        setUsersLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportDoneBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reviewedBy.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesApprovedBy = !approvedByFilter || 
      (() => {
        const selectedUser = users.find(user => user.id.toString() === approvedByFilter)
        return selectedUser ? report.reviewedBy.toLowerCase().includes(selectedUser.username.toLowerCase()) : false
      })()
    
    const matchesReportDoneBy = !reportDoneByFilter || 
      (() => {
        const selectedUser = users.find(user => user.id.toString() === reportDoneByFilter)
        return selectedUser ? report.reportDoneBy.toLowerCase().includes(selectedUser.username.toLowerCase()) : false
      })()
    
    const matchesStatus = !statusFilter || report.status === statusFilter
    
    const matchesDate = !dateFilter || 
      (() => {
        const reportDate = new Date(report.dateGenerated)
        const filterDate = new Date(dateFilter)
        return reportDate.toDateString() === filterDate.toDateString()
      })()

    return matchesSearch && matchesApprovedBy && matchesReportDoneBy && 
           matchesStatus && matchesDate
  })

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'rejected':
        return 'destructive'
      case 'draft':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const clearFilters = () => {
    setDateFilter(undefined)
    setApprovedByFilter('')
    setReportDoneByFilter('')
    setStatusFilter('')
    setSearchTerm('')
  }

  const hasActiveFilters = searchTerm || dateFilter || approvedByFilter || reportDoneByFilter || statusFilter

  // Helper function to get display label for filter values
  const getFilterDisplayLabel = (type: 'approvedBy' | 'reportDoneBy' | 'status', value: string) => {
    switch (type) {
      case 'approvedBy':
        const approver = users.find(user => user.id.toString() === value)
        return approver?.username || value
      case 'reportDoneBy':
        const reporter = users.find(user => user.id.toString() === value)
        return reporter?.username || value
      case 'status':
        return statusOptions.find(opt => opt.value === value)?.label || value
      default:
        return value
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gray-50/50 min-h-screen">
    
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Reports
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage system-generated reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                !
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Enhanced Filter Section */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-900 flex items-center justify-between">
            <span>Filters</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700 h-8"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 max-w-md">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Search Reports
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by report name, reporter, or approver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-green-700 focus:ring-green-700 text-black"
                />
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 whitespace-nowrap"
            >
              Clear Search
            </Button>
          </div>

          
          {showFilters && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Report Done By Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Report Done By
                  </label>
                  <Select 
                    
                    value={reportDoneByFilter} 
                    onValueChange={setReportDoneByFilter}
                    disabled={usersLoading}
                  >
                    <SelectTrigger className="w-full border-gray-300 focus:border-green-700 focus:ring-green-700 text-black">
                      <SelectValue placeholder={usersLoading ? "Loading..." : "All reporters"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reporters</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

               
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Reviewed By
                  </label>
                  <Select 
                    value={approvedByFilter} 
                    onValueChange={setApprovedByFilter}
                    disabled={usersLoading}
                  >
                    <SelectTrigger className="w-full border-gray-300 focus:border-green-700 focus:ring-green-700 text-black" >
                      <SelectValue placeholder={usersLoading ? "Loading..." : "All approvers"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Approvers</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full border-gray-300 focus:border-green-700 focus:ring-green-700 text-black">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Single Date Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Generated Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal border-gray-300 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 text-black',
                          !dateFilter && 'text-gray-500'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFilter ? format(dateFilter, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFilter}
                        onSelect={setDateFilter}
                        initialFocus
                        className="bg-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  {searchTerm && (
                    <Badge variant="secondary" className="flex items-center gap-1 py-1">
                      Search: "{searchTerm}"
                      <X 
                        className="h-3 w-3 cursor-pointer ml-1" 
                        onClick={() => setSearchTerm('')}
                      />
                    </Badge>
                  )}
                  {reportDoneByFilter && reportDoneByFilter !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1 py-1">
                      Reporter: {getFilterDisplayLabel('reportDoneBy', reportDoneByFilter)}
                      <X 
                        className="h-3 w-3 cursor-pointer ml-1" 
                        onClick={() => setReportDoneByFilter('')}
                      />
                    </Badge>
                  )}
                  {approvedByFilter && approvedByFilter !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1 py-1">
                      Approver: {getFilterDisplayLabel('approvedBy', approvedByFilter)}
                      <X 
                        className="h-3 w-3 cursor-pointer ml-1" 
                        onClick={() => setApprovedByFilter('')}
                      />
                    </Badge>
                  )}
                  {statusFilter && statusFilter !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1 py-1">
                      Status: {getFilterDisplayLabel('status', statusFilter)}
                      <X 
                        className="h-3 w-3 cursor-pointer ml-1" 
                        onClick={() => setStatusFilter('')}
                      />
                    </Badge>
                  )}
                  {dateFilter && (
                    <Badge variant="secondary" className="flex items-center gap-1 py-1">
                      Date: {format(dateFilter, 'MMM dd, yyyy')}
                      <X 
                        className="h-3 w-3 cursor-pointer ml-1" 
                        onClick={() => setDateFilter(undefined)}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredReports.length}</span> of{' '}
          <span className="font-semibold">{reports.length}</span> reports
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 whitespace-nowrap"
          >
            Clear All Filters
          </Button>
        )}
      </div>

      {/* Reports Table */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left py-4 px-6 text-gray-900 text-sm font-semibold uppercase tracking-wider">
                      Report Name
                    </th>
                    <th className="text-left py-4 px-6 text-gray-900 text-sm font-semibold uppercase tracking-wider">
                      Date Generated
                    </th>
                    <th className="text-left py-4 px-6 text-gray-900 text-sm font-semibold uppercase tracking-wider">
                      Reviewed By
                    </th>
                    <th className="text-left py-4 px-6 text-gray-900 text-sm font-semibold uppercase tracking-wider">
                      Report Done By
                    </th>
                    <th className="text-left py-4 px-6 text-gray-900 text-sm font-semibold uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-gray-900 text-sm font-semibold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-green-700">
                        {report.name}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {report.dateGenerated}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {report.approvedBy}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {report.reportDoneBy}
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={getStatusVariant(report.status)}
                          className={cn(
                            'font-medium capitalize',
                            report.status === 'approved' &&
                              'bg-emerald-100 text-green-700 border-emerald-200 hover:bg-emerald-100',
                            report.status === 'pending' &&
                              'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
                            report.status === 'rejected' &&
                              'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
                            report.status === 'draft' &&
                              'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100'
                          )}
                        >
                          {report.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                            onClick={() =>
                              downloadReport(parseInt(report.id as string, 10), report.name)
                            }
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredReports.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No reports found</p>
                  <p className="text-sm mt-1">
                    {hasActiveFilters 
                      ? "Try adjusting your search or filters" 
                      : "No reports available in the system"
                    }
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="mt-4 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}