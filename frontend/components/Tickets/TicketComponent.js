import React from "react";
import { PLANTIMPACT, PLANTPRIORITY } from "../../firebase/firebaseConstants";

export default function TicketComponent() {
  return (
    <div className="">
      <div class="row">
        <div class="col">
          <input
            type="text"
            class="form-control"
            placeholder="Issue"
            aria-label="Issue"
          />
        </div>
      </div>
      <div className="row mt-2">
        <div class="col">
          <div class="form-floating">
            <select
              class="form-select"
              id="floatingSelect"
              aria-label="Floating label select example"
            >
              {PLANTPRIORITY.map((doc, index) => (
                <option key={index} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
            <label for="floatingSelect">Priority</label>
          </div>
        </div>
      </div>
      <div className="row mt-2">
        <div class="col">
          <div class="form-floating">
            <select
              class="form-select"
              id="floatingSelect"
              aria-label="Floating label select example"
            >
              {PLANTIMPACT.map((doc, index) => (
                <option key={index} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
            <label for="floatingSelect">Impact</label>
          </div>
        </div>
      </div>
    </div>
  );
}
