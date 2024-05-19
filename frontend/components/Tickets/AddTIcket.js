import React from 'react'
import TicketComponent from './TicketComponent'

export default function AddTIcket() {
  return (
    <div>
      <div className='d-flex justify-content-between align-items-center'>
        <div>Ticket System</div>
        <div className='btn btn-outline-primary'>Add Ticket</div>

      </div>
      <div className='d-flex justify-content-center align-items-center mt-3'>
         <TicketComponent />
      </div>
    </div>
  )
}
