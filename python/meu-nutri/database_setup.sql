-- Criação de tabelas para o projeto Meu Nutri

-- Tabela de Perfis de Usuário
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Metas Nutricionais
CREATE TABLE nutritional_goals (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    weight_goal NUMERIC(5,2),
    calorie_target INTEGER,
    diet_type VARCHAR(50),
    health_conditions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Análises Nutricionais
CREATE TABLE nutrition_analysis (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    key_insights JSONB,
    recommendations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Registros de Refeições
CREATE TABLE meal_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    meal_type VARCHAR(50) NOT NULL,
    food_items JSONB NOT NULL,
    total_calories NUMERIC(6,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhorar performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_nutritional_goals_user ON nutritional_goals(user_id);
CREATE INDEX idx_nutrition_analysis_user ON nutrition_analysis(user_id);
CREATE INDEX idx_meal_logs_user ON meal_logs(user_id);

-- Função para atualizar timestamp de atualização
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualização automática do timestamp em nutritional_goals
CREATE TRIGGER update_nutritional_goals_modtime
    BEFORE UPDATE ON nutritional_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
