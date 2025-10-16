// app/reports/page.tsx
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
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { getReports, downloadReport } from '@/app/services/api'

interface Report {
  id: string
  name: string
  dateGenerated: string
  approvedBy: string
  reportDoneBy: string
  status: 'approved' | 'pending' | 'rejected'
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [approvedByFilter, setApprovedByFilter] = useState('')
  const [reportDoneByFilter, setReportDoneByFilter] = useState('')

  // Mock data - replace with your API call
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getReports()

        if ('status' in response && response.status === 'error') {
          console.error(response.message)
          setReports([])
        } else {
          const formattedReports = response.map((report) => ({
            id: report.id.toString(),
            name: report.reportName,
            dateGenerated: new Date(report.generatedAt).toLocaleDateString(),
            approvedBy: report.approvedByUsername || '-',
            reportDoneBy: report.generatedByUsername || '-',
            status: report.approvedBy ? 'approved' : 'pending',
          }))

          setReports(formattedReports)
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const filteredReports = reports.filter(
    (report) =>
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportDoneBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.approvedBy.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'rejected':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const clearFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setApprovedByFilter('')
    setReportDoneByFilter('')
    setSearchTerm('')
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Reports
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage system-generated reports
          </p>
        </div>
      </div>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-900">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal border-gray-300 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900',
                      !startDate && 'text-gray-500'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="bg-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Approved By
              </label>
              <Select
                value={approvedByFilter}
                onValueChange={setApprovedByFilter}
              >
                <SelectTrigger className="border-gray-300 hover:border-green-700 focus:border-emerald-500">
                  <SelectValue placeholder="Select Person" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="jane-doe">Jane Doe</SelectItem>
                  <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
                  <SelectItem value="david-chen">David Chen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Report Done By */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Report Done By
              </label>
              <Select
                value={reportDoneByFilter}
                onValueChange={setReportDoneByFilter}
              >
                <SelectTrigger className="border-gray-300 hover:border-emerald-300 focus:border-emerald-500">
                  <SelectValue placeholder="Select Person" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="john-smith">John Smith</SelectItem>
                  <SelectItem value="sarah-lee">Sarah Lee</SelectItem>
                  <SelectItem value="emily-white">Emily White</SelectItem>
                  <SelectItem value="chris-green">Chris Green</SelectItem>
                  <SelectItem value="hr-department">HR Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="flex-1 max-w-md w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-green-700 focus:ring-green-700"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-emerald-50/80">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                      REPORT NAME
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                      DATE GENERATED
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                      APPROVED BY
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                      REPORT DONE BY
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                      ACTIONS
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
                            'font-medium',
                            report.status === 'approved' &&
                              'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
                            report.status === 'pending' &&
                              'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
                            report.status === 'rejected' &&
                              'bg-red-100 text-red-800 border-red-200 hover:bg-red-100'
                          )}
                        >
                          {report.status.charAt(0).toUpperCase() +
                            report.status.slice(1)}
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
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
