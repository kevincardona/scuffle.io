import React, {useState, useEffect, Fragment} from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './modal.scss'

const Modal = ({header, type, prompt, isOpen, close, submit, copy}) => {
  const [modalInput, setInput] = useState('');
  const [isModalOpen, setOpenState] = useState(false)
  const [page, setPage] = useState(1)
  const [copyState, setCopied] = useState('Click to Copy')
  useEffect(()=>{
    setOpenState(isOpen);
  }, [isOpen])

  const onKeyPress = event => {
    if (event.key === 'Enter') {
      submit(modalInput);
      close();
    }
  }

  return (
    <Fragment>
    {
      isModalOpen ?
        <div className="modal">
          <button className="modal__button--close" onClick={()=>{close();setPage(1)}}>X</button>
          <h3 className="modal__header">{header}</h3>
          {type === 'input' &&
            <Fragment>
              <div className="input-group">
                <input type="text" autoFocus className="form-control input-text modal__input--word" placeholder={prompt} onKeyPress={onKeyPress} onChange={e => setInput(e.target.value)} />
                <div className="input-group-append">
                  <button className="btn btn-primary input-group-btn" onClick={() => { submit(modalInput); close(); }}>Submit</button>
                </div>
              </div>
            </Fragment>
          }
          {type === 'invite' &&
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
          {type === 'info' &&
            <div>
              { page === 1 &&
              <Fragment>
                <h4>Help</h4>
                <p>
                  If you're reading this you must be confused...
                  <br/><br/>
                  To read the rules type <b className="modal__command">/rules</b> in chat.<br/>          
                  (don't worry noone else will see)
                  <br/><br/>
                </p>
              </Fragment>
              }
              { page === 2 &&
              <Fragment>
                <h5>Commands</h5>
                <br/>
                <p>
                  To reset the game type <b className="modal__command">/reset_game</b>
                  <br/><br/>
                  To put one of your words back type <b className="modal__command">/put_back {"<word>"}</b>
                  <br/><br/>
                  To override an invalid word type <b className="modal__command">/override {"<word>"}</b>
                  <br/><br/>
                </p>
              </Fragment>
              }
              {page} of 2
              <br/>
              { page > 1 && <button onClick={()=>setPage(page - 1)}>{"<"}</button> }
              { page < 2 && <button onClick={()=>setPage(page + 1)}>{">"}</button> }
            </div>
          }
        </div>
      :
      ""
    }
    </Fragment>
  )
}

export default Modal