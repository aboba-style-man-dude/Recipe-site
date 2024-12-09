class RecipeManager {
    constructor() {
        this.servings = null;
        this.originalServings = null;
        this.init();
    }

    init() {
        // Получаем начальное количество порций из HTML
        const servingsElement = document.querySelector('.servings-control__value');
        if (servingsElement) {
            this.servings = parseInt(servingsElement.textContent);
            this.originalServings = this.servings;
        }

        this.initializeServingsControl();
        this.initializeIngredients();
    }

    initializeServingsControl() {
        const decreaseBtn = document.querySelector('[data-action="decrease"]');
        const increaseBtn = document.querySelector('[data-action="increase"]');
        const servingsValue = document.querySelector('.servings-control__value');

        if (decreaseBtn && increaseBtn && servingsValue) {
            decreaseBtn.addEventListener('click', () => {
                if (this.servings > 1) {
                    this.servings--;
                    servingsValue.textContent = this.servings;
                    this.updateIngredientAmounts();
                }
            });

            increaseBtn.addEventListener('click', () => {
                this.servings++;
                servingsValue.textContent = this.servings;
                this.updateIngredientAmounts();
            });
        }
    }

    initializeIngredients() {
        // Сохраняем оригинальные значения ингредиентов
        const ingredients = document.querySelectorAll('.ingredient-amount');
        ingredients.forEach(ingredient => {
            const amount = parseFloat(ingredient.dataset.original);
            const unit = ingredient.dataset.unit;
            
            // Сохраняем оригинальные значения в data-атрибутах
            if (!ingredient.dataset.original) {
                ingredient.dataset.original = amount;
                ingredient.dataset.unit = unit;
            }
        });
    }

    updateIngredientAmounts() {
        const ingredients = document.querySelectorAll('.ingredient-amount');
        ingredients.forEach(ingredient => {
            const originalAmount = parseFloat(ingredient.dataset.original);
            const unit = ingredient.dataset.unit;

            if (!isNaN(originalAmount) && unit !== 'по вкусу') {
                const newAmount = (originalAmount * this.servings) / this.originalServings;
                ingredient.textContent = `${this.formatAmount(newAmount)} ${unit}`;
            }
        });
    }

    formatAmount(amount) {
        // Округляем до 1 знака после запятой, если число не целое
        return Number.isInteger(amount) ? amount : amount.toFixed(1);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new RecipeManager();
}); 