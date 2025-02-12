 // script.js
const POKEAPI_URL = 'https://pokeapi.co/api/v2';
let allPokemon = [];
let types = [];

async function fetchPokemon() {
    try {
        // Fetch all Pokémon
        const response = await fetch(`${POKEAPI_URL}/pokemon?limit=1000`);
        const data = await response.json();
        allPokemon = data.results;
        
        // Fetch types
        const typeResponse = await fetch(`${POKEAPI_URL}/type`);
        const typeData = await typeResponse.json();
        types = typeData.results;
        populateTypeFilter();
        
        displayPokemon(allPokemon);
    } catch (error) {
        console.error('Error fetching Pokémon:', error);
    }
}

function populateTypeFilter() {
    const typeFilter = document.getElementById('type-filter');
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
        typeFilter.appendChild(option);
    });
}

async function displayPokemon(pokemonList) {
    const grid = document.getElementById('pokemon-grid');
    grid.innerHTML = '';
    
    for (const pokemon of pokemonList) {
        const details = await fetch(pokemon.url).then(res => res.json());
        
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <img class="pokemon-image" src="${details.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
            <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
            <p>#${details.id.toString().padStart(3, '0')}</p>
            <div class="types">
                ${details.types.map(type => `
                    <span class="type ${type.type.name}">${type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)}</span>
                `).join('')}
            </div>
        `;
        
        card.addEventListener('click', () => showPokemonDetails(details));
        grid.appendChild(card);
    }
}

async function showPokemonDetails(details) {
    const speciesData = await fetch(details.species.url).then(res => res.json());
    const content = document.querySelector('.details-content');
    
    content.innerHTML = `
        <h2>${details.name.charAt(0).toUpperCase() + details.name.slice(1)}</h2>
        <img src="${details.sprites.other['official-artwork'].front_default}" alt="${details.name}" width="200">
        <p>#${details.id.toString().padStart(3, '0')}</p>
        
        <div class="info-section">
            <h3>Basic Info</h3>
            <p>Height: ${details.height / 10}m</p>
            <p>Weight: ${details.weight / 10}kg</p>
            <p>Species: ${speciesData.genera.find(g => g.language.name === 'en').genus}</p>
        </div>
        
        <div class="info-section">
            <h3>Types</h3>
            <div class="types">
                ${details.types.map(type => `
                    <span class="type ${type.type.name}">${type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)}</span>
                `).join('')}
            </div>
        </div>
        
        <div class="info-section">
            <h3>Abilities</h3>
            <ul>
                ${details.abilities.map(ability => `
                    <li>${ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1)}</li>
                `).join('')}
            </ul>
        </div>
        
        <div class="info-section">
            <h3>Stats</h3>
            <ul>
                ${details.stats.map(stat => `
                    <li>${stat.stat.name.charAt(0).toUpperCase() + stat.stat.name.slice(1)}: ${stat.base_stat}</li>
                `).join('')}
            </ul>
        </div>
    `;
    
    document.getElementById('pokemon-details').classList.remove('hidden');
}

// Event Listeners
document.getElementById('search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allPokemon.filter(p => 
        p.name.includes(searchTerm) || 
        p.url.split('/')[6].toString().startsWith(searchTerm)
    );
    displayPokemon(filtered);
});

document.getElementById('type-filter').addEventListener('change', (e) => {
    const type = e.target.value;
    if (!type) return displayPokemon(allPokemon);
    
    const filtered = allPokemon.filter(async (p) => {
        const details = await fetch(p.url).then(res => res.json());
        return details.types.some(t => t.type.name === type);
    });
    
    Promise.all(filtered).then(results => displayPokemon(results));
});

document.getElementById('close-btn').addEventListener('click', () => {
    document.getElementById('pokemon-details').classList.add('hidden');
});

// Initialize
fetchPokemon();