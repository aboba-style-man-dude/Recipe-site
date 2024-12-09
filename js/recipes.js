// recipe.js
class RecipeManager {
    constructor() {
        this.servings = 6;
        this.originalServings = 6;
        this.recipe = null;
        
        this.init();
    }

    async init() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const recipeId = urlParams.get('id');
            
            if (!recipeId) {
                console.error('Recipe ID not provided');
                return;
            }

            // Загружаем все файлы категорий и ищем рецепт по ID
            const categoryFiles = [
                'soups.json',
                'salads.json',
                'main-dishes.json',
                'desserts.json',
                'drinks.json'
            ];

            for (const file of categoryFiles) {
                const response = await fetch(`data/${file}`);
                const data = await response.json();
                const recipe = data.recipes?.find(r => r.id === recipeId);
                
                if (recipe) {
                    this.recipe = recipe;
                    break;
                }
            }

            if (!this.recipe) {
                console.error('Recipe not found');
                return;
            }

            this.initializeServingsControl();
            this.renderIngredients();
            this.renderSteps();
        } catch (error) {
            console.error('Error loading recipe:', error);
        }
    }

    initializeServingsControl() {
        const decreaseBtn = document.querySelector('[data-action="decrease"]');
        const increaseBtn = document.querySelector('[data-action="increase"]');
        const servingsValue = document.querySelector('.servings-control__value');

        decreaseBtn.addEventListener('click', () => {
            if (this.servings > 1) {
                this.servings--;
                servingsValue.textContent = this.servings;
                this.updateIngredients();
            }
        });

        increaseBtn.addEventListener('click', () => {
            if (this.servings < 12) {
                this.servings++;
                servingsValue.textContent = this.servings;
                this.updateIngredients();
            }
        });
    }

    calculateAmount(originalAmount, unit) {
        if (unit === 'по вкусу' || !originalAmount) return '';
        const newAmount = (originalAmount * this.servings) / this.originalServings;
        return Math.round(newAmount * 10) / 10;
    }

    renderIngredients() {
        const list = document.getElementById('ingredientsList');
        list.innerHTML = this.recipe.ingredients
            .map(ingredient => `
                <li>
                    <span class="ingredient-name">${ingredient.name}</span>
                    <span class="ingredient-amount" data-original="${ingredient.amount}" data-unit="${ingredient.unit}">
                        ${this.calculateAmount(ingredient.amount, ingredient.unit)} ${ingredient.unit}
                    </span>
                </li>
            `)
            .join('');
    }

    updateIngredients() {
        const amounts = document.querySelectorAll('.ingredient-amount');
        amounts.forEach(element => {
            const originalAmount = parseFloat(element.dataset.original);
            const unit = element.dataset.unit;
            const newAmount = this.calculateAmount(originalAmount, unit);
            element.textContent = `${newAmount} ${unit}`;
        });
    }

    renderSteps() {
        const stepsContainer = document.getElementById('recipeSteps');
        stepsContainer.innerHTML = this.recipe.steps
            .map(step => `
                <div class="recipe-step">
                    <div class="step-number">${step.step}</div>
                    <div class="step-content">
                        <p>${step.description}</p>
                        ${step.tip ? `<div class="step-tip">💡 Совет: ${step.tip}</div>` : ''}
                    </div>
                </div>
            `)
            .join('');
    }
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new RecipeManager();
});