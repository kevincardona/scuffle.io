import React from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const RSwal = withReactContent(Swal)

const popup = (type, data = {}) => {
  switch(type) {
    case 'help':
      helpPopup(data)
      break;
    case 'invite':
      invitePopup(data)
      break;
    case 'create':
      createPopup(data)
      break;
    case 'steal':
      stealPopup(data)
      break;
    case 'win':
      winPopup(data);
      break;
    case 'error':
      errorPopup(data);
      break;
    case 'pause':
      pausePopup(data);
      break;
    case 'close':
      RSwal.close();
      break;
    default:
  }
} 

const winPopup = (data) => {

}

const pausePopup = (data) => {
  return RSwal.fire({
    title: 'PAUSED',
    html:
    <div>
      {data.message}
    </div>,
    showCloseButton: false,
    allowOutsideClick: false,
    showConfirmButton: false,
    showCancelButton: false
  })
}

const errorPopup = (data) => {
  RSwal.fire({
    title: 'ERROR',
    html:
    <div>
      {data.message}
    </div>,
    confirmButtonText: 'OK',
    showCloseButton: !data.exit
  }).then(() => {
    data.close();
  })
}

const stealPopup = (data) => {
  RSwal.fire({
    title: `Steal ${data.player.word}`,
    input: 'text',
    confirmButtonText: 'Submit',
    showCloseButton: true
  }).then((result) => {
    if (result.value) {
      data.submit(result.value);
    }
    data.close();
  })
}

const createPopup = (data) => {
  RSwal.fire({
    title: 'Create a Word',
    input: 'text',
    confirmButtonText: 'Submit',
    showCloseButton: true
  }).then((result) => {
    if (result.value) {
      data.submit(result.value);
    }
    data.close();
  })
}

const invitePopup = (data) => {
  RSwal.fire({
    animation: false,
    title: 'Inviting a Friend',
    html:
      <div>
        To invite friends send them this link:
        <input disabled value={data.link}/>
      </div>,
    confirmButtonText: 'Copy',
    showCloseButton: true
  }).then((result) => {
    if (result.value) {
      navigator.clipboard.writeText(data.link);
      RSwal.fire({
        icon: 'success',
        title: 'Copied!',
        showConfirmButton: false,
        timer: 1500
      })
    }
  })
}

const helpPopup = (data) => {
  RSwal.fire({
    animation: false,
    title: 'Help',
    html: 
      <div>
        <br />
        If you're reading this you must be confused...
        <br /><br />
        To read the rules type <b>/rules</b> in chat.<br />
        (don't worry noone else will see)
        <br /><br />
        To steal someone's word click on it and type your new word!
        <br /><br />
      </div>,
    confirmButtonText: 'More...',
    showCloseButton: true,
  }).then((result) => {
    if (result.value)
      RSwal.fire({
        animation: false,
        title: 'Commands',
        html:
          <div>
            <br />
            <p>
              To reset the game type <b className="modal__command">/reset</b>
              <br /><br />
                    To put one of your words back type <b className="modal__command">/return {"<word>"}</b>
              <br /><br />
                    To override an invalid word type <b className="modal__command">/override {"<word>"}</b>
              <br /><br />
            </p>
          </div>,
        showCloseButton: true,
      })
  })
}

export default popup