const fs = require('fs');
const path = require('path');

// Создаем директорию для страниц рецептов, если её нет
const RECIPES_DIR = path.join(__dirname, 'recipes');
if (!fs.existsSync(RECIPES_DIR)) {
    fs.mkdirSync(RECIPES_DIR);
}

// Читаем шаблон
const template = fs.readFileSync('recipe-template.html', 'utf-8');

// Читаем все JSON файлы с рецептами
const categoryFiles = [
    'data/soups.json',
    'data/salads.json',
    'data/main-dishes.json',
    'data/desserts.json',
    'data/drinks.json'
];

// Функция для генерации HTML ингредиентов
function generateIngredientsHTML(ingredients) {
    return ingredients.map(ingredient => `
        <li>
            <span class="ingredient-name">${ingredient.name}</span>
            <span class="ingredient-amount" data-original="${ingredient.amount}" data-unit="${ingredient.unit}">
                ${ingredient.amount} ${ingredient.unit}
            </span>
        </li>
    `).join('\n');
}

// Функция для генерации HTML шагов п��иготовления
function generateStepsHTML(steps) {
    return steps.map(step => `
        <div class="recipe-step">
            <div class="step-number">${step.step}</div>
            <div class="step-content">
                <p>${step.description}</p>
                ${step.tip ? `<div class="step-tip">💡 Совет: ${step.tip}</div>` : ''}
            </div>
        </div>
    `).join('\n');
}

// Генерация страниц для каждого рецепта
async function generateRecipePages() {
    console.log('🚀 Начинаем генерацию страниц рецептов...');
    
    try {
        let totalRecipes = 0;
        
        for (const categoryFile of categoryFiles) {
            console.log(`📂 Обработка категории: ${categoryFile}`);
            
            if (!fs.existsSync(categoryFile)) {
                console.warn(`⚠️ Файл ${categoryFile} не найден, пропускаем...`);
                continue;
            }

            const categoryData = JSON.parse(fs.readFileSync(categoryFile, 'utf-8'));
            
            if (!categoryData.recipes) {
                console.warn(`⚠️ В файле ${categoryFile} нет рецептов, пропускаем...`);
                continue;
            }

            for (const recipe of categoryData.recipes) {
                console.log(`📝 Генерация страницы для рецепта: ${recipe.title}`);
                
                let recipeHTML = template;
                
                // Заменяем плейсхолдеры на реальные данные
                const replacements = {
                    '{{RECIPE_TITLE}}': recipe.title,
                    '{{RECIPE_DESCRIPTION}}': recipe.description,
                    '{{RECIPE_IMAGE}}': recipe.image,
                    '{{RECIPE_TIME}}': recipe.time,
                    '{{RECIPE_DIFFICULTY}}': recipe.difficulty,
                    '{{RECIPE_SERVINGS}}': recipe.servings,
                    '{{RECIPE_CALORIES}}': recipe.calories,
                    '{{RECIPE_INGREDIENTS}}': generateIngredientsHTML(recipe.ingredients),
                    '{{RECIPE_STEPS}}': generateStepsHTML(recipe.steps)
                };

                for (const [placeholder, value] of Object.entries(replacements)) {
                    recipeHTML = recipeHTML.replace(new RegExp(placeholder, 'g'), value);
                }

                // Сохраняем сгенерированную страницу
                const fileName = `${recipe.id}.html`;
                fs.writeFileSync(path.join(RECIPES_DIR, fileName), recipeHTML);
                console.log(`✅ Сгенерирована страница: ${fileName}`);
                totalRecipes++;
            }
        }
        
        console.log(`\n✨ Готово! Сгенерировано ${totalRecipes} страниц рецептов`);
    } catch (error) {
        console.error('❌ Ошибка при генерации страниц:', error);
        process.exit(1);
    }
}

// Запускаем генерацию
console.log('🔄 Запуск скрипта генерации страниц...\n');
generateRecipePages();

// Добавляем обработчик для graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Завершение работы скрипта...');
    process.exit(0);
}); 