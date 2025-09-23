"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const business_opportunity_schema_1 = require("./schemas/business-opportunity.schema");
const business_project_schema_1 = require("./schemas/business-project.schema");
let BusinessService = class BusinessService {
    opportunityModel;
    projectModel;
    constructor(opportunityModel, projectModel) {
        this.opportunityModel = opportunityModel;
        this.projectModel = projectModel;
    }
    async getOpportunities() {
        try {
            const opportunities = await this.opportunityModel.find().exec();
            return {
                success: true,
                data: opportunities,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar oportunidades',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getOpportunity(id) {
        try {
            const opportunity = await this.opportunityModel.findById(id).exec();
            if (!opportunity) {
                return {
                    success: false,
                    error: 'Oportunidade não encontrada',
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                success: true,
                data: opportunity,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar oportunidade',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async createOpportunity(opportunityData) {
        try {
            const opportunity = new this.opportunityModel({
                ...opportunityData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            const savedOpportunity = await opportunity.save();
            return {
                success: true,
                data: savedOpportunity,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao criar oportunidade',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getProjects() {
        try {
            const projects = await this.projectModel.find().exec();
            return {
                success: true,
                data: projects,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar projetos',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getProject(id) {
        try {
            const project = await this.projectModel.findById(id).exec();
            if (!project) {
                return {
                    success: false,
                    error: 'Projeto não encontrado',
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                success: true,
                data: project,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar projeto',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async createProject(projectData) {
        try {
            const project = new this.projectModel({
                ...projectData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            const savedProject = await project.save();
            return {
                success: true,
                data: savedProject,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao criar projeto',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async updateProjectProgress(id, progress) {
        try {
            const project = await this.projectModel.findByIdAndUpdate(id, {
                progress,
                updatedAt: new Date().toISOString(),
            }, { new: true }).exec();
            if (!project) {
                return {
                    success: false,
                    error: 'Projeto não encontrado',
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                success: true,
                data: project,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao atualizar progresso do projeto',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getBusinessHabits() {
        try {
            const mockHabits = [
                {
                    id: '1',
                    name: 'Curso de gestão',
                    description: 'Dedicar tempo para aprender sobre gestão de negócios',
                    category: 'learning',
                    frequency: 'weekly',
                    target: '3x por semana',
                    progress: 60,
                    completed: false,
                    linkedOpportunityId: '1',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: '2',
                    name: 'Networking',
                    description: 'Construir rede de contatos profissionais',
                    category: 'networking',
                    frequency: 'weekly',
                    target: '1 novo contato por semana',
                    progress: 25,
                    completed: false,
                    linkedOpportunityId: '2',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: '3',
                    name: 'Análise de mercado',
                    description: 'Pesquisar tendências e oportunidades',
                    category: 'planning',
                    frequency: 'daily',
                    target: '30 minutos por dia',
                    progress: 80,
                    completed: true,
                    linkedOpportunityId: '3',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ];
            return {
                success: true,
                data: mockHabits,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar hábitos de negócio',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getBusinessAnalytics() {
        try {
            const opportunities = await this.opportunityModel.find().exec();
            const projects = await this.projectModel.find().exec();
            const totalOpportunities = opportunities.length;
            const activeProjects = projects.filter(p => p.status === 'active').length;
            const avgProjectProgress = projects.reduce((acc, p) => acc + p.progress, 0) / projects.length || 0;
            return {
                success: true,
                data: {
                    total_opportunities: totalOpportunities,
                    active_projects: activeProjects,
                    average_project_progress: avgProjectProgress,
                    total_investment_potential: opportunities.reduce((acc, o) => acc + o.investment, 0),
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar analytics de negócios',
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.BusinessService = BusinessService;
exports.BusinessService = BusinessService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(business_opportunity_schema_1.BusinessOpportunity.name)),
    __param(1, (0, mongoose_1.InjectModel)(business_project_schema_1.BusinessProject.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], BusinessService);
//# sourceMappingURL=business.service.js.map