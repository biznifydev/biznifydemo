const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupLeaveSystem() {
  console.log('Setting up Leave Management System...')

  try {
    // First, get the first organization
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)

    if (orgError || !organizations || organizations.length === 0) {
      console.error('No organizations found. Please create an organization first.')
      return
    }

    const organizationId = organizations[0].id
    console.log(`Using organization: ${organizationId}`)

    // Create leave types
    const leaveTypes = [
      {
        organization_id: organizationId,
        name: 'Annual Leave',
        description: 'Regular vacation time',
        color: '#3B82F6',
        icon: 'calendar',
        requires_approval: true,
        max_days_per_year: 25
      },
      {
        organization_id: organizationId,
        name: 'Sick Leave',
        description: 'Medical and health-related leave',
        color: '#EF4444',
        icon: 'thermometer',
        requires_approval: false,
        max_days_per_year: 10
      },
      {
        organization_id: organizationId,
        name: 'Personal Leave',
        description: 'Personal time off',
        color: '#8B5CF6',
        icon: 'user',
        requires_approval: true,
        max_days_per_year: 5
      },
      {
        organization_id: organizationId,
        name: 'Maternity/Paternity',
        description: 'Parental leave',
        color: '#10B981',
        icon: 'heart',
        requires_approval: true,
        max_days_per_year: 90
      }
    ]

    console.log('Creating leave types...')
    const { data: createdLeaveTypes, error: leaveTypesError } = await supabase
      .from('leave_types')
      .insert(leaveTypes)
      .select()

    if (leaveTypesError) {
      console.error('Error creating leave types:', leaveTypesError)
      return
    }

    console.log(`Created ${createdLeaveTypes.length} leave types`)

    // Get users to create leave balances
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(5)

    if (usersError || !users || users.length === 0) {
      console.error('No users found. Please create users first.')
      return
    }

    // Create leave balances for current year
    const currentYear = new Date().getFullYear()
    const leaveBalances = []

    users.forEach(user => {
      createdLeaveTypes.forEach(leaveType => {
        let allocatedDays = 0
        let carriedOverDays = 0

        switch (leaveType.name) {
          case 'Annual Leave':
            allocatedDays = 25
            break
          case 'Sick Leave':
            allocatedDays = 10
            break
          case 'Personal Leave':
            allocatedDays = 5
            break
          case 'Maternity/Paternity':
            allocatedDays = 90
            break
        }

        leaveBalances.push({
          organization_id: organizationId,
          employee_id: user.id,
          leave_type_id: leaveType.id,
          year: currentYear,
          allocated_days: allocatedDays,
          used_days: Math.floor(Math.random() * 5), // Random used days
          pending_days: Math.floor(Math.random() * 3), // Random pending days
          carried_over_days: carriedOverDays
        })
      })
    })

    console.log('Creating leave balances...')
    const { data: createdBalances, error: balancesError } = await supabase
      .from('leave_balances')
      .insert(leaveBalances)
      .select()

    if (balancesError) {
      console.error('Error creating leave balances:', balancesError)
      return
    }

    console.log(`Created ${createdBalances.length} leave balances`)

    // Create sample leave requests
    const leaveRequests = []
    const statuses = ['pending', 'approved', 'rejected']
    const reasons = [
      'Family vacation',
      'Medical appointment',
      'Personal time off',
      'Holiday',
      'Wedding',
      'Medical emergency'
    ]

    users.forEach(user => {
      // Create 2-4 requests per user
      const numRequests = Math.floor(Math.random() * 3) + 2
      
      for (let i = 0; i < numRequests; i++) {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) + 1)
        
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7) + 1)
        
        const daysRequested = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
        
        const leaveType = createdLeaveTypes[Math.floor(Math.random() * createdLeaveTypes.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const reason = reasons[Math.floor(Math.random() * reasons.length)]

        const request = {
          organization_id: organizationId,
          employee_id: user.id,
          leave_type_id: leaveType.id,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          days_requested: daysRequested,
          reason: reason,
          description: `Request for ${reason}`,
          status: status
        }

        if (status === 'approved') {
          request.approved_by = users[0].id // First user as approver
          request.approved_at = new Date().toISOString()
        } else if (status === 'rejected') {
          request.rejection_reason = 'Insufficient notice period'
        }

        leaveRequests.push(request)
      }
    })

    console.log('Creating leave requests...')
    const { data: createdRequests, error: requestsError } = await supabase
      .from('leave_requests')
      .insert(leaveRequests)
      .select()

    if (requestsError) {
      console.error('Error creating leave requests:', requestsError)
      return
    }

    console.log(`Created ${createdRequests.length} leave requests`)

    // Create some sample notes
    const notes = [
      'Approved - Enjoy your time off!',
      'Please provide more details about the medical appointment',
      'Rejected - Insufficient notice period',
      'Approved - Please ensure handover is completed',
      'Pending additional documentation'
    ]

    const requestNotes = []
    createdRequests.forEach(request => {
      if (request.status === 'pending') {
        requestNotes.push({
          organization_id: organizationId,
          leave_request_id: request.id,
          user_id: users[0].id, // Manager adding note
          note: notes[Math.floor(Math.random() * notes.length)],
          is_internal: true
        })
      }
    })

    if (requestNotes.length > 0) {
      console.log('Creating request notes...')
      const { data: createdNotes, error: notesError } = await supabase
        .from('leave_request_notes')
        .insert(requestNotes)
        .select()

      if (notesError) {
        console.error('Error creating notes:', notesError)
      } else {
        console.log(`Created ${createdNotes.length} request notes`)
      }
    }

    console.log('✅ Leave Management System setup completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - ${createdLeaveTypes.length} leave types created`)
    console.log(`   - ${createdBalances.length} leave balances created`)
    console.log(`   - ${createdRequests.length} leave requests created`)
    console.log(`   - ${requestNotes.length} request notes created`)

  } catch (error) {
    console.error('Error setting up leave system:', error)
  }
}

setupLeaveSystem() 