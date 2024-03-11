import {
  ws,
  chessboardFenString,
  gameStudyDropdown
} from './init.js';
import * as env from '../../../env.js';
import * as mode from '../../../mode.js';

chessboardFenString.form.addEventListener('submit', event => {
  event.preventDefault();
  const add = {
    fen: event.target.elements[1].value
  };
  ws.send(`/start ${event.target.elements[0].value} ${mode.FEN} "${JSON.stringify(add).replace(/"/g, '\\"')}"`);
  chessboardFenString.modal.hide();
});

gameStudyDropdown.domElem(env, ws);
