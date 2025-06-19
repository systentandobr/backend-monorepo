-- Dados iniciais para o banco de dados do Meu Nutri

-- Inserir usuários de exemplo
INSERT INTO profiles (id, username, email, full_name, bio)
VALUES 
    (gen_random_uuid(), 'nutri_user1', 'usuario1@meunutri.com', 'João Silva', 'Buscando um estilo de vida mais saudável'),
    (gen_random_uuid(), 'nutri_user2', 'usuario2@meunutri.com', 'Maria Souza', 'Foco em nutrição e bem-estar');

-- Inserir metas nutricionais de exemplo
INSERT INTO nutritional_goals (user_id, weight_goal, calorie_target, diet_type, health_conditions)
SELECT 
    id, 
    70.5, 
    2000, 
    'balanceada', 
    ARRAY['nenhuma']
FROM profiles
WHERE username = 'nutri_user1';

-- Inserir análises nutricionais de exemplo
INSERT INTO nutrition_analysis (user_id, key_insights, recommendations)
SELECT 
    id,
    '{"metabolismo": "Normal", "gordura_corporal": "22%"}',
    ARRAY[
        'Manter dieta balanceada', 
        'Praticar exercícios 3x por semana', 
        'Aumentar consumo de proteínas'
    ]
FROM profiles
WHERE username = 'nutri_user1';

-- Inserir registros de refeições de exemplo
INSERT INTO meal_logs (user_id, meal_type, food_items, total_calories)
SELECT 
    id,
    'café da manhã',
    '[
        {"name": "Ovo", "quantity": 2, "calories": 140},
        {"name": "Pão integral", "quantity": 1, "calories": 80},
        {"name": "Café", "quantity": 1, "calories": 20}
    ]',
    240
FROM profiles
WHERE username = 'nutri_user1';
