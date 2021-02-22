// Endpoint for pokemon list
const API_URL = 'https://pokeapi.co/api/v2/pokemon';
let pokemonMain = []; // Main JSON of pokemons (data).
let pokemonData = []; // Results of pokemons (data.results).
let weightArr = []; // Array of pokemons weight.
let baseExp = []; // Array of pokemons base experience.

let disablePrev = null;
let disableNext = null;

/**
 * Fetches data from a given API endpoint.
 * @param {string} url - URL of the API endpoint.
 * @return {Promise} - Promise that resolves as a JSON object of the response.
 */
async function fetchData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

/**
 * Creates dom element.
 * @param {string} elementTagName - URL of the API endpoint.
 * @param {array}  cssClasses - Array of string class names.
 * @param {string} idName - Name of id.
 * @param {string} onClickFunction - Array of string onClickFunction names.
 * @return {Dom Node} - Dom Node
 */
const createElement = (elementTagName, cssClasses, idName, onClickFunction) => {
  const element = document.createElement(elementTagName);

  if (cssClasses) {
    element.classList.add(...cssClasses);
  }

  if (idName) {
    element.setAttribute('id', idName);
  }

  if (onClickFunction) {
    element.setAttribute('onclick', onClickFunction);
  }

  return element;
};

// TODO: if no image, then disable or placeholder
/**
 * Creates Card Item.
 * @param {object}
 * @return {HTML Element} - Returns HTML element with card content
 */
const generateCard = (data) => {
  const cardElement = createElement('div', ['card']);
  cardElement.innerHTML = '';
  const cardMarkup = `
    <h3 class="title uppercase">${data.name}</h3>
    <img class="image" src=${data.sprites.front_default}></img> 
    <div class="weight">Wt ${toHectograms(data.weight)} dm</div>
    <div class="dotted-line"></div>
    <div class="height">Ht ${toDecimeter(data.height)} hg</div>
    <div class="abilities">Abilities: ${showAbilities(data.abilities)}</div>
`;
  cardElement.innerHTML = cardMarkup;
  return cardElement;
};


// Example of fetching multiple Pokemon from the main endpoint
fetchData(API_URL).then((data) => {
  pokemonMain.push(data);

  data.results.map((item) => {
    fetchData(item.url).then((data) => {
      root.appendChild(generateCard(data));
      pokemonData.push(data);
      weightArr.push(data.weight);
    });
  });

  setTimeout(() => {
    header.appendChild(generateHeader(weightArr, pokemonData));
    if (typeof disablePrev === 'string') {
      header.appendChild(generateprevPageButton(pokemonMain));
    } else {
      header.appendChild(generateprevPageButton(pokemonMain));
      disableButton('prev');
    }
    header.appendChild(generateNextPageButton(pokemonMain));
  }, 300);
});

// Parameter accepts an array which then averages all indexes.
const avgWeight = (weight) => weight.reduce((a, b) => a + b, 0);

// Compares all pokemon's base experience and finds the highest one in the array.
const mostBaseExp = (expArr) => {
  let newExp = -1;
  let newPokemon = '';

  for (let i = 0; i < expArr.length; i++) {
    if (newExp < expArr[i].base_experience) {
      newExp = expArr[i].base_experience;
      newPokemon = expArr[i].name;
    } else {
      // console.log(newPokemon, ' has a higher base_experience than', expArr[i].name);
    }
  }
  return newPokemon.charAt(0).toUpperCase() + newPokemon.slice(1); // Uppercase first letter
};

// Function to return abilities within JSON
const showAbilities = (abilities) => {
  let i = 0;
  let abilitiesArr = [];

  while (i < abilities.length) {
    abilitiesArr.push(' ' + abilities[i].ability.name);
    i++;
  }

  return abilitiesArr;
};

// Converts current height to decimeter.
const toDecimeter = (height) => {
  return height / 3.937;
};

// Converts current height to hectograms.
const toHectograms = (weight) => {
  return weight * 4.5359237;
};

// Clear inner HTML to have a rerender effect.
const clearInnerHtml = () => {
  document.getElementById('header').innerHTML = '';
  document.getElementById('root').innerHTML = '';
};

// Next page button function.
const nextPage = () => {
  clearInnerHtml();

  pokemonMain.map((res) => {
    fetchData(res.next).then((data) => {
      disableNext = data.next;
      pokemonMain = [];
      pokemonMain.push(data);

      data.results.map((item) => {
        fetchData(item.url).then((data) => {
          root.appendChild(generateCard(data));
          pokemonData.push(data);
          weightArr.push(data.weight);
        });
      });
    });
  });

  // Reset weight average on new page
  weightArr = [];
  pokemonData = [];

  setTimeout(() => {
    header.appendChild(generateHeader(weightArr, pokemonData));
    header.appendChild(generateprevPageButton(pokemonMain));
    if (typeof disableNext === 'string') {
      header.appendChild(generateNextPageButton(pokemonMain));
    } else {
      header.appendChild(generateNextPageButton(pokemonMain));
      disableButton('next');
    }
  }, 300);
};

// Prev page button function.
const prevPage = () => {
  clearInnerHtml();

  pokemonMain.map((res) => {
    fetchData(res.previous).then((data) => {

      disablePrev = data.previous;
      pokemonMain = [];
      pokemonMain.push(data);

      console.log('fetchData(res.next) data:', data);
      data.results.map((item) => {
        fetchData(item.url).then((data) => {
          root.appendChild(generateCard(data));
          pokemonData.push(data);
          weightArr.push(data.weight);
        });
      });
    });
  });

  // Reset weight average on new page
  weightArr = [];
  pokemonData = [];

  setTimeout(() => {
    header.appendChild(generateHeader(weightArr, pokemonData));
    if (typeof disablePrev === 'string') {
      header.appendChild(generateprevPageButton(pokemonMain));
    } else {
      header.appendChild(generateprevPageButton(pokemonMain));
      disableButton('prev');
    }
    header.appendChild(generateNextPageButton(pokemonMain));
  }, 300);
};

// Function to disable button
const disableButton = (idName) => {
  if (idName) {
    document.getElementById(idName).disabled = true;
  } else {
    console.log('Error with disable button');
  }
};

/**
 * Creates Header Item.
 * @param {array} weight - Array of pokemons weight.
 * @param {array} exp - Array of pokemons base experience.
 * @return {HTML Element} - Returns HTML element with header element
 */

const generateHeader = (weight, exp) => {
  let averagedWeight = avgWeight(weight);
  let mostBasedExpName = mostBaseExp(exp);

  const headerElement = createElement('header', ['nav']);
  const headerMarkup = `
            <div>Average weight: ${averagedWeight} | Most exp: ${mostBasedExpName}</div>
        `;
  headerElement.innerHTML = headerMarkup;
  return headerElement;
};

/**
 * Creates Button Item.
 * @param {string} next - Name of id
 * @return {HTML Element} - Returns HTML element with Button element
 */

const generateNextPageButton = (next) => {
  const buttonElement = createElement('button', false, 'next', `nextPage();`);
  const buttonMarkup = `
            Next Page
        `;
  buttonElement.innerHTML = buttonMarkup;
  return buttonElement;
};

/**
 * Creates Button Item.
 @param {string} prev - Name of id
 * @return {HTML Element} - Returns HTML element with Button element
 */

const generateprevPageButton = (prev) => {
  const buttonElement = createElement('button', false, 'prev', `prevPage();`);
  const buttonMarkup = `
  Previous
  `;

  buttonElement.innerHTML = buttonMarkup;
  return buttonElement;
};
