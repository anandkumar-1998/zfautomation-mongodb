import React, { useEffect } from 'react'
import TicketComponent from './TicketComponent'
import AllTicket from './AllTicket'
import { RequestTicket } from '../../apis/masterAPIS';

export default function AddTIcket() {
  const [ticket, setTicket] = React.useState([]);
  const [show, setShow] = React.useState(false);
  const getTickets = async () => {
    let allticket = await RequestTicket();
    console.log("all ticket", allticket.data)
    setTicket(allticket.data);
    // setTicket([allticket]);
    setShow(true);
  };

  useEffect(()=>{
    getTickets()
  },[])
  return (
    <div>
      <div className='d-flex justify-content-between align-items-center'>
        <div>Ticket System</div>
        <div className='btn btn-outline-primary'>Add Ticket</div>

      </div>
      <div className='d-flex justify-content-center align-items-center mt-3'>
         <TicketComponent />
      </div>
      <div className=''>
        <AllTicket show={show} ticket={ticket} />
      </div>
    </div>
  )
}
