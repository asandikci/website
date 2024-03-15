import ws from './ws.js';

const onlinePlayers = {
  table: document.querySelector('#onlinePlayers'),
  domElem: (games) => {
    const tbody = document.querySelector('#onlinePlayers tbody')
    tbody.replaceChildren();
    if (games.length > 0) {
      games.forEach(game => {
        const tr = document.createElement('tr');
        const usernameTd = document.createElement('td');
        const usernameText = document.createTextNode('Guest');
        const minTd = document.createElement('td');
        const minText = document.createTextNode(game.min);
        const incrementTd = document.createElement('td');
        const incrementText = document.createTextNode(game.increment);
        const colorTd = document.createElement('td');
        const colorText = document.createTextNode(game.color);
        const variantTd = document.createElement('td');
        const variantText = document.createTextNode(game.variant);
        usernameTd.appendChild(usernameText);
        minTd.appendChild(minText);
        incrementTd.appendChild(incrementText);
        colorTd.appendChild(colorText);
        variantTd.appendChild(variantText);
        tr.appendChild(usernameTd);
        tr.appendChild(minTd);
        tr.appendChild(incrementTd);
        tr.appendChild(colorTd);
        tr.appendChild(variantTd);
        if (localStorage.getItem('hash') !== game.hash) {
          tr.addEventListener('click', () => {
            ws.send(`/accept ${game.hash}`);
          });
        } else {
          usernameTd.style.cursor = 'default';
          minTd.style.cursor = 'default';
          incrementTd.style.cursor = 'default';
          colorTd.style.cursor = 'default';
          variantTd.style.cursor = 'default';
        }
        tbody.appendChild(tr);
      });
    }
  }
}

export default onlinePlayers;
