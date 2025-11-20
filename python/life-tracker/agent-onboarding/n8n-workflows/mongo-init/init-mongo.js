// Inicialização do MongoDB para Life Tracker
db = db.getSiblingDB('life_tracker');

// Criar usuário para a aplicação
db.createUser({
  user: 'life_tracker_user',
  pwd: 'life_tracker_password',
  roles: [
    {
      role: 'readWrite',
      db: 'life_tracker'
    }
  ]
});

// Criar collections com índices
db.createCollection('profile_analyses');
db.createCollection('user_plans');
db.createCollection('user_sessions');
db.createCollection('templates');
db.createCollection('workflow_logs');

// Índices para profile_analyses
db.profile_analyses.createIndex({ "user_id": 1 }, { unique: true });
db.profile_analyses.createIndex({ "created_at": 1 });
db.profile_analyses.createIndex({ "profile.profile_type": 1 });
db.profile_analyses.createIndex({ "analysis_score": 1 });

// Índices para user_plans
db.user_plans.createIndex({ "user_id": 1 }, { unique: true });
db.user_plans.createIndex({ "plan_id": 1 }, { unique: true });
db.user_plans.createIndex({ "created_at": 1 });
db.user_plans.createIndex({ "template_match.template_id": 1 });
db.user_plans.createIndex({ "metadata.generated_at": 1 });

// Índices para user_sessions
db.user_sessions.createIndex({ "user_id": 1 });
db.user_sessions.createIndex({ "session_id": 1 }, { unique: true });
db.user_sessions.createIndex({ "created_at": 1 });
db.user_sessions.createIndex({ "user_id": 1, "created_at": -1 });

// Índices para templates
db.templates.createIndex({ "id": 1 }, { unique: true });
db.templates.createIndex({ "name": 1 });
db.templates.createIndex({ "domains": 1 });

// Índices para workflow_logs
db.workflow_logs.createIndex({ "user_id": 1 });
db.workflow_logs.createIndex({ "endpoint": 1 });
db.workflow_logs.createIndex({ "timestamp": 1 });
db.workflow_logs.createIndex({ "success": 1 });
db.workflow_logs.createIndex({ "processing_time_ms": 1 });

// Inserir templates padrão
db.templates.insertMany([
  {
    id: 'balanced_template',
    name: 'Equilibrado',
    description: 'Template para usuários com interesses equilibrados',
    domains: ['healthness', 'finances', 'productivity', 'learning'],
    template: {
      healthness: {
        goals: [
          { id: 'maintain_health', label: 'Manter saúde equilibrada', priority: 7 }
        ],
        habits: [
          { id: 'regular_exercise', name: 'Exercício regular', target: '3x por semana' }
        ]
      },
      finances: {
        goals: [
          { id: 'financial_stability', label: 'Estabilidade financeira', priority: 7 }
        ],
        habits: [
          { id: 'monthly_budget', name: 'Orçamento mensal', target: 'Mensal' }
        ]
      },
      productivity: {
        goals: [
          { id: 'work_life_balance', label: 'Equilíbrio trabalho-vida', priority: 8 }
        ],
        habits: [
          { id: 'time_management', name: 'Gestão do tempo', target: 'Diário' }
        ]
      },
      learning: {
        goals: [
          { id: 'continuous_learning', label: 'Aprendizado contínuo', priority: 6 }
        ],
        habits: [
          { id: 'daily_learning', name: 'Aprendizado diário', target: '30 minutos' }
        ]
      }
    },
    daily_schedule: [
      { time: '07:00', activity: 'Café da manhã e planejamento do dia', domain: 'productivity' },
      { time: '12:00', activity: 'Almoço e pausa', domain: 'healthness' },
      { time: '18:00', activity: 'Exercício ou aprendizado', domain: 'healthness' },
      { time: '20:00', activity: 'Tempo com família/amigos', domain: 'relationships' },
      { time: '22:00', activity: 'Reflexão e preparação para dormir', domain: 'productivity' }
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'health_focused_template',
    name: 'Foco em Saúde',
    description: 'Template para melhorar saúde e bem-estar',
    domains: ['healthness', 'productivity'],
    template: {
      healthness: {
        goals: [
          { id: 'improve_health', label: 'Melhorar saúde geral', priority: 9 }
        ],
        habits: [
          { id: 'daily_exercise', name: 'Exercício diário', target: 'Diário' }
        ]
      },
      productivity: {
        goals: [
          { id: 'healthy_routine', label: 'Rotina saudável', priority: 8 }
        ],
        habits: [
          { id: 'morning_routine', name: 'Rotina matinal', target: 'Diário' }
        ]
      }
    },
    daily_schedule: [
      { time: '06:00', activity: 'Exercício matinal', domain: 'healthness' },
      { time: '07:00', activity: 'Café da manhã saudável', domain: 'healthness' },
      { time: '12:00', activity: 'Almoço nutritivo', domain: 'healthness' },
      { time: '18:00', activity: 'Atividade física', domain: 'healthness' },
      { time: '21:00', activity: 'Relaxamento e preparação para dormir', domain: 'healthness' }
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'financial_focused_template',
    name: 'Foco em Finanças',
    description: 'Template para organização financeira',
    domains: ['finances', 'productivity'],
    template: {
      finances: {
        goals: [
          { id: 'financial_freedom', label: 'Liberdade financeira', priority: 9 }
        ],
        habits: [
          { id: 'daily_budget_tracking', name: 'Controle diário de gastos', target: 'Diário' }
        ]
      },
      productivity: {
        goals: [
          { id: 'financial_planning', label: 'Planejamento financeiro', priority: 8 }
        ],
        habits: [
          { id: 'weekly_financial_review', name: 'Revisão financeira semanal', target: 'Semanal' }
        ]
      }
    },
    daily_schedule: [
      { time: '07:00', activity: 'Revisão de gastos do dia anterior', domain: 'finances' },
      { time: '12:00', activity: 'Almoço e pausa', domain: 'healthness' },
      { time: '18:00', activity: 'Planejamento financeiro', domain: 'finances' },
      { time: '20:00', activity: 'Educação financeira', domain: 'learning' },
      { time: '22:00', activity: 'Reflexão sobre objetivos financeiros', domain: 'finances' }
    ],
    created_at: new Date(),
    updated_at: new Date()
  }
]);

print('MongoDB inicializado com sucesso para Life Tracker!');
print('Collections criadas: profile_analyses, user_plans, user_sessions, templates, workflow_logs');
print('Templates padrão inseridos: balanced_template, health_focused_template, financial_focused_template');
print('Usuário criado: life_tracker_user');
