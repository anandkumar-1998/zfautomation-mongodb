import React from "react";
import { RequestTicket, RequestTicketClosed } from "../../apis/masterAPIS";

export default function AllTicket({ show, ticket }) {
  const handleClick = async (id) => {
    console.log("clicked - ", id);
    await RequestTicketClosed(id);
  };
  return (
    <div>
      <div class="mt-3">
        <div className="row">
          {show &&
            ticket.map((doc, index) => (
              <div key={index} className="col">
                <div className="card">
                  <div className="card-body">
                    <div className="card-title">{doc.issue}</div>
                    <div>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => {
                          handleClick(doc._id);
                        }}
                      >
                        closed
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
