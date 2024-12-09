class Search {
    constructor() {
        this.searchInput = document.querySelector('.search input');
        this.searchResults = null;
        this.recipes = [];
        this.isRecipePage = window.location.pathname.includes('/recipes/');
        
        this.init();
    }

    async init() {
        try {
            // Загружаем все рецепты из всех категорий
            const categoryFiles = [
                'soups.json',
                'salads.json',
                'main-dishes.json',
                'desserts.json',
                'drinks.json'
            ];

            const promises = categoryFiles.map(file => 
                fetch(`${this.isRecipePage ? '../' : ''}data/${file}`)
                    .then(response => response.json())
            );

            const results = await Promise.all(promises);
            this.recipes = results.flatMap(category => category.recipes || []);

            this.setupSearchUI();
            this.bindEvents();
        } catch (error) {
            console.error('Error loading recipes for search:', error);
        }
    }

    setupSearchUI() {
        if (this.isRecipePage) {
            // Создаем выпадающий список для страницы рецепта
            this.searchResults = document.createElement('div');
            this.searchResults.className = 'search-results';
            this.searchInput.parentElement.appendChild(this.searchResults);
        }
    }

    bindEvents() {
        // Обработка ввода в поиск
        this.searchInput.addEventListener('input', () => {
            const query = this.searchInput.value.trim().toLowerCase();
            
            if (query.length < 2) {
                this.isRecipePage ? this.hideResults() : this.showAllRecipes();
                return;
            }

            const matches = this.findMatches(query);
            
            if (this.isRecipePage) {
                this.showDropdownResults(matches.slice(0, 5));
            } else {
                this.updateRecipeCards(matches);
            }
        });

        if (this.isRecipePage) {
            // Закрытие выпадающего списка при клике вне поиска
            document.addEventListener('click', (e) => {
                if (!this.searchInput.parentElement.contains(e.target)) {
                    this.hideResults();
                }
            });
        }
    }

    findMatches(query) {
        return this.recipes.filter(recipe => {
            const titleMatch = recipe.title.toLowerCase().includes(query);
            const descriptionMatch = recipe.description.toLowerCase().includes(query);
            const ingredientsMatch = recipe.ingredients.some(
                ingredient => ingredient.name.toLowerCase().includes(query)
            );
            
            return titleMatch || descriptionMatch || ingredientsMatch;
        });
    }

    showDropdownResults(matches) {
        if (!matches.length) {
            this.searchResults.innerHTML = `
                <div class="search-results__empty">
                    Рецепты не найдены
                </div>
            `;
        } else {
            this.searchResults.innerHTML = matches.map(recipe => `
                <a href="${this.isRecipePage ? '' : 'recipes/'}${recipe.id}.html" class="search-results__item">
                    <img src="${recipe.image}" alt="${recipe.title}" class="search-results__image">
                    <div class="search-results__info">
                        <div class="search-results__title">${recipe.title}</div>
                        <div class="search-results__description">${recipe.description}</div>
                    </div>
                </a>
            `).join('');
        }
        
        this.searchResults.style.display = 'block';
    }

    hideResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'none';
        }
    }

    updateRecipeCards(matches) {
        const recipeGrid = document.querySelector('.recipe-grid');
        
        if (!matches.length) {
            recipeGrid.innerHTML = `
                <div class="recipes-empty">
                    Рецепты не найдены
                </div>
            `;
            return;
        }

        recipeGrid.innerHTML = matches.map(recipe => `
            <a href="recipes/${recipe.id}.html" class="recipe-card">
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-card__image">
                <div class="recipe-card__content">
                    <h3 class="recipe-card__title">${recipe.title}</h3>
                    <p class="recipe-card__description">${recipe.description}</p>
                    <div class="recipe-card__meta">
                        <span class="recipe-card__time">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 6v6l4 2"/>
                            </svg>
                            ${recipe.time}
                        </span>
                        <span class="recipe-card__difficulty">${recipe.difficulty}</span>
                    </div>
                </div>
            </a>
        `).join('');
    }

    showAllRecipes() {
        const recipeCards = new RecipeCards();
        recipeCards.loadRecipes();
    }
}

// Инициализация поиска после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new Search();
}); 