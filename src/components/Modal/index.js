import React, {useState, useEffect, Fragment} from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './modal.scss'

const Modal = ({header, prompt, isOpen, close, submit, copy}) => {
  const [modalInput, setInput] = useState('');
  const [isModalOpen, setOpenState] = useState(false)
  const [copyState, setCopied] = useState('Click to Copy')
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
          {submit ?
            <div className="input-group">
              <input type="text" className="form-control input-text modal__input--word" placeholder={prompt} onKeyPress={onKeyPress} onChange={e => setInput(e.target.value)} />
              <div className="input-group-append">
                <button className="btn btn-primary input-group-btn" onClick={() => { submit(modalInput); close(); }}>Submit</button>
              </div>
            </div>
            :
            <Fragment>
              <div>
                <label>{prompt}</label>
              </div>
              <div>
                <input disabled={true} value={copy}/>
              </div>
              <CopyToClipboard text={copy}
                onCopy={() => setCopied('Copied!')}>
                <button>{copyState}</button>
              </CopyToClipboard>
            </Fragment>
          }
        </div>
      :
      ""
    }
    </Fragment>
  )
}

export default Modal