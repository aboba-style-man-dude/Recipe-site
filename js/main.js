class RecipeCards {
    constructor() {
        this.categories = {
            'Супы': 'soups.json',
            'Салаты': 'salads.json',
            'Горячие блюда': 'main-dishes.json',
            'Десерты': 'desserts.json',
            'Напитки': 'drinks.json'
        };
        
        this.currentCategory = 'Все рецепты';
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadRecipes();
    }

    bindEvents() {
        const categoryLinks = document.querySelectorAll('.categories__item');
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                categoryLinks.forEach(l => l.classList.remove('categories__item--active'));
                e.target.classList.add('categories__item--active');
                
                this.currentCategory = e.target.textContent;
                this.loadRecipes();
            });
        });
    }

    async loadRecipes() {
        try {
            let allRecipes = [];
            
            if (this.currentCategory === 'Все рецепты') {
                const promises = Object.values(this.categories).map(file => 
                    fetch(`data/${file}`).then(response => response.json())
                );
                
                const results = await Promise.all(promises);
                allRecipes = results.flatMap(category => category.recipes || []);
            } else {
                const categoryFile = this.categories[this.currentCategory];
                const response = await fetch(`data/${categoryFile}`);
                const data = await response.json();
                allRecipes = data.recipes || [];
            }
            
            this.renderRecipes(allRecipes);
        } catch (error) {
            console.error('Error loading recipes:', error);
        }
    }

    renderRecipes(recipes) {
        const mainContainer = document.querySelector('.main .container');
        
        let recipeGrid = mainContainer.querySelector('.recipe-grid');
        if (!recipeGrid) {
            recipeGrid = document.createElement('div');
            recipeGrid.className = 'recipe-grid';
            mainContainer.innerHTML = '';
            mainContainer.appendChild(recipeGrid);
        }
        
        recipeGrid.innerHTML = recipes.map(recipe => `
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
}

document.addEventListener('DOMContentLoaded', () => {
    new RecipeCards();
}); 