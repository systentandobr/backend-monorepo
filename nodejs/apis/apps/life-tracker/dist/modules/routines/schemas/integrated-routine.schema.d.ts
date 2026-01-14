import { Document } from 'mongoose';
export type IntegratedRoutineDocument = IntegratedRoutine & Document;
export declare class IntegratedRoutine {
  schema_version: string;
  generated_at: string;
  locale: string;
  user_profile: {
    name: string;
    age: number;
    sex: string;
    notes: string[];
  };
  domains: {
    [domain: string]: {
      goals: {
        id: string;
        label: string;
        priority: number;
      }[];
      habits: {
        id: string;
        name: string;
        icon: string;
        color?: string;
        categoryId: number;
        description?: string;
        target?: string;
        streak: number;
        completed: boolean;
        timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'all';
        createdAt: string;
        updatedAt: string;
        domain?: string;
      }[];
      game?: {
        board: {
          rows: number;
          cols: number;
          milestones: {
            tile: number;
            label: string;
          }[];
        };
        scoring_rules: {
          action: string;
          points: number;
          desc: string;
        }[];
        weekly_goal_points: number;
      };
      meal_plan_week?: {
        days: string[];
        meals: string[];
        plan: {
          [day: string]: {
            [meal: string]: string;
          };
        };
      };
      routines?: {
        daily_schedule: {
          time: string;
          activity: string;
          domain?: string;
        }[];
      };
      latest_labs?: {
        creatinina_mg_dl: number;
        ureia_mg_dl: number;
        egfr_ml_min_1_73: number;
        fosforo_mg_dl: number;
        calcio_total_mg_dl: number;
        calcio_ionico_mmol_l: number;
        sodio_mmol_l: number;
        potassio_mmol_l: number;
        hba1c_percent: number;
        glicose_mg_dl: number;
        hb_g_dl: number;
        ferritina_ng_ml: number;
        vitamina_d_25oh_ng_ml: number;
        pth_pg_ml: number;
        sangue_oculto_fezes: string;
      };
      diet_parameters?: {
        protein_g_per_day_target: {
          min: number;
          max: number;
          target: number;
          note: string;
        };
        sodium_mg_per_day_max: number;
        phosphorus_mg_per_day_target: {
          max: number;
          note: string;
        };
        potassium_strategy: {
          restriction: string;
          techniques: string[];
          avoid_examples: string[];
        };
        fiber_g_per_day_target: number;
        fluid_limit_ml_per_day: number | null;
        fluid_note: string;
      };
      shopping_list?: {
        Proteinas: string[];
        Carboidratos: string[];
        Legumes_Verduras: string[];
        Frutas: string[];
        Outros: string[];
      };
      recipes?: {
        id: string;
        title: string;
        servings: number;
        ingredients: {
          item: string;
          qty: string;
        }[];
        steps: string[];
        renal_tip: string;
      }[];
      supplementation?: {
        name: string;
        suggested_dose_ui_per_day?: number;
        suggested_dose_mg_elemental?: number;
        timing?: string;
        requires_medical_supervision: boolean;
      }[];
      notes_for_doctor_review?: string[];
      portfolio?: {
        total_value: number;
        total_return: number;
        assets: {
          id: string;
          name: string;
          value: number;
          return: number;
          allocation: number;
        }[];
      };
      financial_goals?: {
        id: string;
        name: string;
        target: number;
        current: number;
        deadline: string;
      }[];
      opportunities?: {
        id: string;
        title: string;
        description: string;
        investment: number;
        potential_return: number;
        risk: string;
        timeline: string;
      }[];
      business_plan_progress?: {
        [key: string]: number;
      };
      projects?: {
        id: string;
        name: string;
        status: string;
        progress: number;
        deadline: string;
      }[];
    };
  };
  integrated_goals: {
    id: string;
    name: string;
    domains: string[];
    description: string;
    progress: number;
    target_date: string;
    key_metrics: string[];
  }[];
  routines: {
    daily_schedule: {
      time: string;
      activity: string;
      domain?: string;
    }[];
  };
  ui_hints: {
    colors: {
      [domain: string]: string;
    };
    icons: {
      [domain: string]: string;
    };
  };
  createdAt?: Date;
  updatedAt?: Date;
}
export declare const IntegratedRoutineSchema: import('mongoose').Schema<
  IntegratedRoutine,
  import('mongoose').Model<
    IntegratedRoutine,
    any,
    any,
    any,
    Document<unknown, any, IntegratedRoutine, any, {}> &
      IntegratedRoutine & {
        _id: import('mongoose').Types.ObjectId;
      } & {
        __v: number;
      },
    any
  >,
  {},
  {},
  {},
  {},
  import('mongoose').DefaultSchemaOptions,
  IntegratedRoutine,
  Document<
    unknown,
    {},
    import('mongoose').FlatRecord<IntegratedRoutine>,
    {},
    import('mongoose').ResolveSchemaOptions<
      import('mongoose').DefaultSchemaOptions
    >
  > &
    import('mongoose').FlatRecord<IntegratedRoutine> & {
      _id: import('mongoose').Types.ObjectId;
    } & {
      __v: number;
    }
>;
