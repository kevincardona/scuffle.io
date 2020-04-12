import React, {useState, useEffect, Fragment} from 'react';
import './modal.scss'

const Modal = ({header, prompt, isOpen, close, submit}) => {
  const [modalInput, setInput] = useState('');
  const [isModalOpen, setOpenState] = useState(false)
  useEffect(()=>{
    setOpenState(isOpen);
  }, [isOpen])

  const onKeyPress = event => {
    if (event.key === 'Enter') {
      submit();
      close();
    }
  }

  return (
    <Fragment>
    {
      isModalOpen ?
        <div className="modal">
          <button className="modal__button--close" onClick={close}>X</button>
          <h3 className="modal__header">{header}</h3>
          <div className="input-group">
            <input type="text" className="form-control input-text modal__input--word" placeholder={prompt} onKeyPress={onKeyPress} onChange={e => setInput(e.target.value)} />
            <div className="input-group-append">
              <button className="btn btn-primary input-group-btn" onClick={() => { submit(modalInput); close(); }}>Submit</button>
            </div>
          </div>
        </div>
      :
      ""
    }
    </Fragment>
  )
}

export default Modal