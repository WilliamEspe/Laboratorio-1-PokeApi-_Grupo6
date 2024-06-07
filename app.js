document.getElementById('search-button').addEventListener('click', () => {
    const search = document.getElementById('search').value;
    fetch(`https://pokeapi.co/api/v2/pokemon/${search}`)
        .then(response => response.json())
        .then(data => {
            const pokemon = document.getElementById('pokemon-container');
            pokemon.innerHTML = `
            <div class="card">
            <h2>${data.name}</h2>
            <img src="${data.sprites.front_default}" alt="${data.name}">
            <p>Altura: ${data.height}</p>
            <p>Peso: ${data.weight}</p>
            </div>
            `;
        })
        .catch(error => {
            const pokemon = document.getElementById('pokemon-container');
            pokemon.innerHTML = `
                <h2>Pokemon no encontrado</h2>
            `;
        });
}
);


document.getElementById('clear-button').addEventListener('click', () => {
    const pokemon = document.getElementById('pokemon-container');
    pokemon.innerHTML = '';
}
);


document.getElementById('random-button').addEventListener('click', () => {
    const random = Math.floor(Math.random() * 898) + 1;
    fetch(`https://pokeapi.co/api/v2/pokemon/${random}`)
        .then(response => response.json())
        .then(data => {
            const pokemon = document.getElementById('pokemon-container');
            pokemon.innerHTML = `
            <div class="card">
                <h2>${data.name}</h2>
                <img src="${data.sprites.front_default}" alt="${data.name}">
                <p>Altura: ${data.height}</p>
                <p>Peso: ${data.weight}</p>
            </div>
            `;
        })
        .catch(error => {
            const pokemon = document.getElementById('pokemon-container');
            pokemon.innerHTML = `
                <h2>Pokemon no encontrado</h2>
            `;
        });
}
);


document.addEventListener('DOMContentLoaded', () => {
    const typeSelect = document.getElementById('type');
    const statSelect = document.getElementById('stat');
    const pokemonContainer = document.getElementById('pokemon-container');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.createElement('span');
    let currentPage = 1;
    const limit = 15; // Número de Pokémon por página
    const pokemonCache = {}; // Caché para almacenar detalles de Pokémon

    totalPagesSpan.id = 'totalPages';
    nextPageButton.parentNode.insertBefore(totalPagesSpan, nextPageButton.nextSibling);

    typeSelect.addEventListener('change', () => fetchPokemon(1));
    statSelect.addEventListener('change', () => fetchPokemon(1));
    prevPageButton.addEventListener('click', () => fetchPokemon(currentPage - 1));
    nextPageButton.addEventListener('click', () => fetchPokemon(currentPage + 1));

    async function fetchPokemon(page) {
        const type = typeSelect.value;
        const stat = statSelect.value;
        currentPage = page;
        let offset = (currentPage - 1) * limit;

        let url = `https://pokeapi.co/api/v2/pokemon?limit=1000`; // Obtener todos los Pokémon para filtrar y ordenar

        let pokemonList = [];
        let totalCount = 0;

        if (type !== 'all') {
            const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
            const typeData = await typeResponse.json();
            pokemonList = typeData.pokemon.map(p => p.pokemon);
            totalCount = pokemonList.length;
        } else {
            const response = await fetch(url);
            const data = await response.json();
            pokemonList = data.results;
            totalCount = data.count;
        }

        const filteredPokemonList = await filterAndSortPokemon(pokemonList, stat);
        const paginatedPokemonList = filteredPokemonList.slice(offset, offset + limit);

        displayPokemon(paginatedPokemonList);
        updatePaginationButtons(totalCount);
    }

    async function filterAndSortPokemon(pokemonList, stat) {
        const promises = pokemonList.map(async (pokemon) => {
            if (!pokemonCache[pokemon.url]) {
                const response = await fetch(pokemon.url);
                pokemonCache[pokemon.url] = await response.json();
            }
            return pokemonCache[pokemon.url];
        });

        const pokemonDetails = await Promise.all(promises);

        if (stat !== 'all') {
            pokemonDetails.sort((a, b) => {
                const statA = a.stats.find(s => s.stat.name === stat).base_stat;
                const statB = b.stats.find(s => s.stat.name === stat).base_stat;
                return statB - statA;
            });
        }

        return pokemonDetails;
    }

    function displayPokemon(pokemonList) {
        pokemonContainer.innerHTML = '';

        pokemonList.forEach(details => {
            const pokemonCard = document.createElement('div');
            pokemonCard.className = 'pokemon-card';
            const statsHtml = details.stats.map(s => `<div>${s.stat.name}: ${s.base_stat}</div>`).join('');
            pokemonCard.innerHTML = `
                <h3>${details.name}</h3>
                <img src="${details.sprites.front_default}" alt="${details.name}">
                <div class="stats">${statsHtml}</div>
            `;
            pokemonContainer.appendChild(pokemonCard);
        });
    }

    function updatePaginationButtons(count) {
        const totalPages = Math.ceil(count / limit);
        currentPageSpan.textContent = `Página ${currentPage} de ${totalPages}`;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    // Obtener Pokémon al cargar la página
    fetchPokemon(currentPage);
});





