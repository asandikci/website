import { Opening } from '@chesslablab/jsblab';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  ws,
  chessboardSanMovetext,
  chessboardFenString,
  playComputer,
  playFriend,
  copyInviteCode,
  waitingForPlayerToJoin,
  enterInviteCode,
  openingsEcoCode,
  openingsSanMovetext,
  openingsName,
  gameStudyDropdown
} from './init.js';
import '../../../styles/app.css';
import * as env from '../../../env.js';
import * as mode from '../../../mode.js';
import * as variant from '../../../variant.js';

const openingsTableDomNode = (modal, openings, tbody) => {
  tbody.replaceChildren();
  openings.forEach(opening => {
    const tr = document.createElement('tr');
    const ecoTd = document.createElement('td');
    const ecoText = document.createTextNode(opening.eco);
    const nameTd = document.createElement('td');
    const nameText = document.createTextNode(opening.name);
    const movetextTd = document.createElement('td');
    const movetextText = document.createTextNode(opening.movetext);
    ecoTd.appendChild(ecoText);
    nameTd.appendChild(nameText);
    movetextTd.appendChild(movetextText);
    tr.appendChild(ecoTd);
    tr.appendChild(nameTd);
    tr.appendChild(movetextTd);
    tr.addEventListener('click', event => {
      const add = {
        movetext: opening.movetext
      };
      ws.send(`/start ${variant.CLASSICAL} ${mode.SAN} "${JSON.stringify(add).replace(/"/g, '\\"')}"`);
      modal.hide();
    });
    tbody.appendChild(tr);
  });
};

chessboardSanMovetext.form.addEventListener('submit', event => {
  event.preventDefault();
  const add = {
    ...(event.target.elements[1].value && {fen: event.target.elements[1].value}),
    movetext: event.target.elements[2].value
  };
  ws.send(`/start ${event.target.elements[0].value} ${mode.SAN} "${JSON.stringify(add).replace(/"/g, '\\"')}"`);

  chessboardSanMovetext.modal.hide();
});

chessboardFenString.form.addEventListener('submit', event => {
  event.preventDefault();
  const add = {
    fen: event.target.elements[1].value
  };
  ws.send(`/start ${event.target.elements[0].value} ${mode.FEN} "${JSON.stringify(add).replace(/"/g, '\\"')}"`);

  chessboardFenString.modal.hide();
});

playComputer.form.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(playComputer.form);
  localStorage.clear();
  localStorage.setItem('mode', mode.STOCKFISH);
  if (formData.get('level') == 1) {
    localStorage.setItem('skillLevel', 11);
    localStorage.setItem('depth', 4);
  } else if (formData.get('level') == 2) {
    localStorage.setItem('skillLevel', 17);
    localStorage.setItem('depth', 8);
  } else if (formData.get('level') == 3) {
    localStorage.setItem('skillLevel', 20);
    localStorage.setItem('depth', 12);
  } else {
    localStorage.setItem('skillLevel', 6);
    localStorage.setItem('depth', 2);
  }
  ws.send(`/start ${variant.CLASSICAL} ${mode.STOCKFISH} ${formData.get('color')}`);

  playComputer.modal.hide();
});

playFriend.form.getElementsByTagName('select')[0].addEventListener('change', event => {
  event.preventDefault();
  if (event.target.value === variant.CHESS_960) {
    playFriend.form.getElementsByClassName('startPos')[0].classList.remove('d-none');
  } else {
    playFriend.form.getElementsByClassName('startPos')[0].classList.add('d-none');
  }
});

playFriend.form.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(playFriend.form);
  const add = {
    min: formData.get('minutes'),
    increment: formData.get('increment'),
    color: formData.get('color'),
    submode: 'friend',
    ...(formData.get('variant') === variant.CHESS_960) && {startPos: formData.get('startPos')},
    ...(formData.get('variant') === variant.CAPABLANCA_FISCHER) && {startPos: formData.get('startPos')},
    ...(formData.get('fen') && {fen: formData.get('fen')})
  };
  localStorage.clear();
  localStorage.setItem('inviterColor', formData.get('color'));
  ws.send(`/start ${formData.get('variant')} ${mode.PLAY} "${JSON.stringify(add).replace(/"/g, '\\"')}"`);
  playFriend.modal.hide();

  copyInviteCode.modal.show();
});

copyInviteCode.form.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(copyInviteCode.form);
  navigator.clipboard.writeText(formData.get('hash')).then(() => {
    copyInviteCode.modal.hide();
    waitingForPlayerToJoin.modal.show();
  }, function(err) {
    alert('Whoops! Failed to copy');
  });
});

waitingForPlayerToJoin.form.addEventListener('submit', event => {
  event.preventDefault();
  window.location.href = waitingForPlayerToJoin.form.dataset.redirect;
});

enterInviteCode.form.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(enterInviteCode.form);
  ws.send(`/accept ${formData.get('hash')}`);
});

openingsEcoCode.form.getElementsByTagName('select')[0].addEventListener('change', event => {
  event.preventDefault();
  const openings = Opening.byEco(event.target.value);
  const tbody = openingsEcoCode.form.getElementsByTagName('tbody')[0];

  openingsTableDomNode(openingsEcoCode.modal, openings, tbody);
});

openingsSanMovetext.form.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(openingsSanMovetext.form);
  const openings = Opening.byMovetext(formData.get('movetext'));
  const tbody = openingsSanMovetext.form.getElementsByTagName('tbody')[0];

  openingsTableDomNode(openingsSanMovetext.modal, openings, tbody);
});

openingsName.form.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(openingsName.form);
  const openings = Opening.byName(formData.get('name'));
  const tbody = openingsName.form.getElementsByTagName('tbody')[0];

  openingsTableDomNode(openingsName.modal, openings, tbody);
});

gameStudyDropdown.children.item(0).addEventListener('click', async (event) => {
  event.preventDefault();
  await fetch(`${env.API_SCHEME}://${env.API_HOST}:${env.API_PORT}/${env.API_VERSION}/download/image`, {
    method: 'POST',
    headers: {
      'X-Api-Key': `${env.API_KEY}`
    },
    body: JSON.stringify({
      fen: ws.sanMovesTable.props.fen[ws.sanMovesTable.current],
      variant: variant.CLASSICAL,
      flip: ws.chessboard.getOrientation()
    })
  })
  .then(res => res.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "chessboard.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
});

gameStudyDropdown.children.item(1).addEventListener('click', async (event) => {
  event.preventDefault();
  await fetch(`${env.API_SCHEME}://${env.API_HOST}:${env.API_PORT}/${env.API_VERSION}/download/mp4`, {
    method: 'POST',
    headers: {
      'X-Api-Key': `${env.API_KEY}`
    },
    body: JSON.stringify({
      variant: ws.chessboard.props.variant,
      movetext: ws.sanMovesTable.props.movetext,
      flip: ws.chessboard.getOrientation(),
      ...(ws.chessboard.props.variant === variant.CHESS_960) && {startPos: ws.chessboard.props.startPos},
      ...(ws.chessboard.props.variant === variant.CAPABLANCA_FISCHER) && {startPos: ws.chessboard.props.startPos}
    })
  })
  .then(res => res.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "chessgame.mp4";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
});