"""
Analisador de imagens corporais usando visão computacional.
"""

import cv2
import mediapipe as mp
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
import uuid
import os
from datetime import datetime
import math
import logging

# Configurar logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class BodyAnalyzer:
    """Analisador de composição corporal e postura usando MediaPipe."""
    
    def __init__(self):
        """Inicializa o analisador de corpo."""
        # Inicializa MediaPipe Pose
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.pose = self.mp_pose.Pose(
            static_image_mode=True,
            model_complexity=2,
            enable_segmentation=True,
            min_detection_confidence=0.5
        )
        
        # Definir diretório para armazenar visualizações
        self.visualizations_dir = os.environ.get(
            "VISUALIZATIONS_DIR", 
            "/tmp/meu-nutri/visualizations"
        )
        
        # Criar diretório se não existir
        os.makedirs(self.visualizations_dir, exist_ok=True)
    
    def analyze_image(self, image_path: str, user_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Analisa uma imagem para avaliar aspectos físicos e posturais.
        
        Args:
            image_path: Caminho para a imagem
            user_data: Dados adicionais do usuário (opcional)
            
        Returns:
            Resultado da análise com métricas corporais
        """
        try:
            # Carrega a imagem
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Não foi possível carregar a imagem: {image_path}")
            
            # Converte para RGB (MediaPipe usa RGB)
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Processa a imagem
            results = self.pose.process(image_rgb)
            
            if not results.pose_landmarks:
                return {
                    "error": "Não foi possível detectar pontos-chave corporais na imagem.",
                    "suggestions": [
                        "Tente uma imagem com melhor iluminação",
                        "Certifique-se que a pessoa está visível de corpo inteiro",
                        "Use roupas que permitam visualizar o contorno do corpo"
                    ]
                }
            
            # Extrai landmarks
            landmarks = results.pose_landmarks.landmark
            
            # Calcula métricas corporais
            body_metrics = self._calculate_body_metrics(
                landmarks, 
                image.shape, 
                results.segmentation_mask
            )
            
            # Inclui dados do usuário na análise se disponíveis
            if user_data:
                body_metrics = self._enhance_with_user_data(body_metrics, user_data)
            
            # Gera id único para a análise
            analysis_id = str(uuid.uuid4())
            
            # Cria uma visualização da análise
            visualization_path = self._create_visualization(
                image_rgb, 
                results, 
                analysis_id
            )
            
            # Prepara o resultado final
            analysis_result = {
                "analysis_id": analysis_id,
                "timestamp": datetime.now().isoformat(),
                "body_metrics": body_metrics,
                "image_dimensions": {
                    "width": image.shape[1],
                    "height": image.shape[0]
                }
            }
            
            if visualization_path:
                analysis_result["visualization_path"] = visualization_path
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Erro na análise da imagem: {str(e)}", exc_info=True)
            return {
                "error": f"Falha ao analisar imagem: {str(e)}",
                "suggestions": [
                    "Verifique se a imagem é válida",
                    "Tente uma imagem com melhor qualidade"
                ]
            }
    
    def _calculate_body_metrics(
        self, 
        landmarks, 
        image_shape: Tuple[int, int, int], 
        segmentation_mask: Optional[np.ndarray] = None
    ) -> Dict[str, Any]:
        """
        Calcula métricas corporais a partir dos landmarks do MediaPipe.
        
        Args:
            landmarks: Pontos-chave detectados pelo MediaPipe
            image_shape: Dimensões da imagem (altura, largura, canais)
            segmentation_mask: Máscara de segmentação (opcional)
            
        Returns:
            Dicionário com métricas corporais
        """
        height, width, _ = image_shape
        
        # Extrai coordenadas de pontos-chave relevantes
        # Converte landmarks normalizados para coordenadas de pixel
        keypoints = {}
        for idx, landmark in enumerate(landmarks):
            keypoints[idx] = (
                int(landmark.x * width),
                int(landmark.y * height)
            )
        
        # Calcula proporções corporais
        try:
            # Pontos-chave para ombros
            left_shoulder = keypoints[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value]
            right_shoulder = keypoints[self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
            
            # Pontos-chave para quadril
            left_hip = keypoints[self.mp_pose.PoseLandmark.LEFT_HIP.value]
            right_hip = keypoints[self.mp_pose.PoseLandmark.RIGHT_HIP.value]
            
            # Pontos-chave para joelhos
            left_knee = keypoints[self.mp_pose.PoseLandmark.LEFT_KNEE.value]
            right_knee = keypoints[self.mp_pose.PoseLandmark.RIGHT_KNEE.value]
            
            # Pontos-chave para tornozelos
            left_ankle = keypoints[self.mp_pose.PoseLandmark.LEFT_ANKLE.value]
            right_ankle = keypoints[self.mp_pose.PoseLandmark.RIGHT_ANKLE.value]
            
            # Calcula largura dos ombros
            shoulder_width = self._calculate_distance(left_shoulder, right_shoulder)
            
            # Calcula largura do quadril
            hip_width = self._calculate_distance(left_hip, right_hip)
            
            # Calcula comprimento da perna (quadril ao tornozelo)
            left_leg_length = (
                self._calculate_distance(left_hip, left_knee) +
                self._calculate_distance(left_knee, left_ankle)
            )
            right_leg_length = (
                self._calculate_distance(right_hip, right_knee) +
                self._calculate_distance(right_knee, right_ankle)
            )
            avg_leg_length = (left_leg_length + right_leg_length) / 2
            
            # Calcula tronco (ombro a quadril)
            left_torso_length = self._calculate_distance(left_shoulder, left_hip)
            right_torso_length = self._calculate_distance(right_shoulder, right_hip)
            avg_torso_length = (left_torso_length + right_torso_length) / 2
            
            # Calcula razão ombro-quadril (indicador de tipo corporal)
            shoulder_hip_ratio = shoulder_width / hip_width if hip_width > 0 else 0
            
            # Calcula razão perna-tronco
            leg_torso_ratio = avg_leg_length / avg_torso_length if avg_torso_length > 0 else 0
            
            # Análise de postura
            posture_analysis = self._analyze_posture(landmarks, self.mp_pose)
            
            # Armazena os resultados
            metrics = {
                "proportions": {
                    "shoulder_width": round(shoulder_width, 2),
                    "hip_width": round(hip_width, 2),
                    "leg_length": round(avg_leg_length, 2),
                    "torso_length": round(avg_torso_length, 2),
                    "shoulder_hip_ratio": round(shoulder_hip_ratio, 2),
                    "leg_torso_ratio": round(leg_torso_ratio, 2)
                },
                "posture": posture_analysis
            }
            
            # Adiciona estimativa de composição se houver máscara de segmentação
            if segmentation_mask is not None:
                composition_estimate = self._estimate_body_composition(
                    segmentation_mask, 
                    keypoints, 
                    metrics["proportions"]
                )
                metrics["estimated_composition"] = composition_estimate
                
            return metrics
            
        except Exception as e:
            logger.error(f"Erro ao calcular métricas corporais: {str(e)}", exc_info=True)
            return {
                "error": "Não foi possível calcular métricas corporais devido a pontos-chave incompletos",
                "detected_keypoints": len(keypoints)
            }
    
    def _calculate_distance(self, point1: Tuple[int, int], point2: Tuple[int, int]) -> float:
        """
        Calcula a distância euclidiana entre dois pontos.
        
        Args:
            point1: Primeiro ponto (x, y)
            point2: Segundo ponto (x, y)
            
        Returns:
            Distância entre os pontos
        """
        return math.sqrt(
            (point1[0] - point2[0])**2 + 
            (point1[1] - point2[1])**2
        )
    
    def _analyze_posture(self, landmarks, mp_pose) -> Dict[str, Any]:
        """
        Analisa a postura com base nos landmarks.
        
        Args:
            landmarks: Pontos-chave detectados
            mp_pose: Referência ao MediaPipe Pose
            
        Returns:
            Análise de postura
        """
        # Obtém landmarks específicos
        left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
        right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
        left_ear = landmarks[mp_pose.PoseLandmark.LEFT_EAR.value]
        right_ear = landmarks[mp_pose.PoseLandmark.RIGHT_EAR.value]
        left_ankle = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value]
        right_ankle = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value]
        
        # Avalia alinhamento dos ombros
        shoulder_alignment = abs(left_shoulder.y - right_shoulder.y)
        is_shoulder_aligned = shoulder_alignment < 0.05  # Threshold normalizado
        
        # Avalia alinhamento da cabeça
        head_tilt = abs(left_ear.y - right_ear.y)
        is_head_aligned = head_tilt < 0.03  # Threshold normalizado
        
        # Avalia alinhamento vertical (orelha-ombro-quadril)
        ear_shoulder_vertical_alignment = abs(
            (left_ear.x + right_ear.x) / 2 - 
            (left_shoulder.x + right_shoulder.x) / 2
        )
        
        shoulder_hip_vertical_alignment = abs(
            (left_shoulder.x + right_shoulder.x) / 2 - 
            (left_hip.x + right_hip.x) / 2
        )
        
        is_vertical_aligned = (
            ear_shoulder_vertical_alignment < 0.05 and 
            shoulder_hip_vertical_alignment < 0.05
        )
        
        # Avalia equilíbrio de peso (distância entre tornozelos)
        ankle_distance = abs(
            (left_ankle.x + left_ankle.y) - 
            (right_ankle.x + right_ankle.y)
        )
        is_weight_balanced = ankle_distance < 0.1
        
        # Pontuação geral de postura (0-100)
        posture_score = 100
        if not is_shoulder_aligned:
            posture_score -= 20 * shoulder_alignment
        if not is_head_aligned:
            posture_score -= 15 * head_tilt
        if not is_vertical_aligned:
            posture_score -= 25 * (ear_shoulder_vertical_alignment + shoulder_hip_vertical_alignment)
        if not is_weight_balanced:
            posture_score -= 15 * ankle_distance
        
        # Limita o score entre 0 e 100
        posture_score = max(0, min(100, posture_score))
        
        # Determina categoria de postura
        posture_category = "excelente"
        if posture_score < 60:
            posture_category = "ruim"
        elif posture_score < 75:
            posture_category = "razoável"
        elif posture_score < 90:
            posture_category = "boa"
        
        # Recomendações baseadas na análise
        recommendations = []
        
        if not is_shoulder_aligned:
            recommendations.append("Trabalhe em exercícios para alinhar os ombros")
        if not is_head_aligned or ear_shoulder_vertical_alignment > 0.05:
            recommendations.append("Atenção à posição da cabeça e pescoço")
        if shoulder_hip_vertical_alignment > 0.05:
            recommendations.append("Foque no alinhamento vertical de ombros e quadril")
        if not is_weight_balanced:
            recommendations.append("Pratique exercícios de equilíbrio e distribuição de peso")
        
        return {
            "score": round(posture_score, 1),
            "category": posture_category,
            "alignments": {
                "shoulders": "alinhados" if is_shoulder_aligned else "desalinhados",
                "head": "alinhada" if is_head_aligned else "desalinhada",
                "vertical": "bom" if is_vertical_aligned else "necessita atenção",
                "weight_distribution": "equilibrada" if is_weight_balanced else "desequilibrada"
            },
            "recommendations": recommendations
        }
    
    def _estimate_body_composition(
        self, 
        segmentation_mask: np.ndarray, 
        keypoints: Dict[int, Tuple[int, int]], 
        proportions: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Estima composição corporal baseada na segmentação e proporções.
        
        Args:
            segmentation_mask: Máscara de segmentação
            keypoints: Pontos-chave detectados
            proportions: Proporções corporais calculadas
            
        Returns:
            Estimativa de composição corporal
        """
        # NOTA: Esta é uma estimativa simplificada para demonstração
        # Em um sistema real, usaríamos modelos mais sofisticados
        
        # Analisa o contorno do corpo
        if segmentation_mask is not None:
            mask = segmentation_mask > 0.5
            
            # Calcula a área total do corpo na máscara
            body_area = np.sum(mask)
            
            # Calcula proporções de diferentes regiões
            # Esta é uma simplificação - um sistema real usaria segmentação mais precisa
            height, width = mask.shape
            
            # Divide a imagem em três partes (superior, meio, inferior)
            upper_third = mask[:height//3, :]
            middle_third = mask[height//3:2*height//3, :]
            lower_third = mask[2*height//3:, :]
            
            upper_area = np.sum(upper_third)
            middle_area = np.sum(middle_third)
            lower_area = np.sum(lower_third)
            
            # Calcula proporções
            upper_ratio = upper_area / body_area if body_area > 0 else 0
            middle_ratio = middle_area / body_area if body_area > 0 else 0
            lower_ratio = lower_area / body_area if body_area > 0 else 0
            
            # Usa proporções para estimar tipo corporal
            # Isso é muito simplificado e apenas para demonstração
            shoulder_hip_ratio = proportions.get("shoulder_hip_ratio", 1.0)
            
            # Estimativa simplificada de tipo corporal
            if shoulder_hip_ratio > 1.2:
                body_type = "triangular invertido"  # Mais largo em cima
            elif shoulder_hip_ratio < 0.8:
                body_type = "triangular"  # Mais largo embaixo
            else:
                body_type = "retangular"  # Relativamente proporcional
                
            # Estimativa muito simplficada de % de gordura
            # Um sistema real usaria modelos mais sofisticados
            fat_percentage = {
                "estimate": "indeterminado",
                "confidence": "baixa",
                "note": "Estimativa visual aproximada, não substitui avaliação profissional"
            }
            
            return {
                "body_type": body_type,
                "proportions": {
                    "upper_body": round(upper_ratio * 100, 1),
                    "mid_section": round(middle_ratio * 100, 1),
                    "lower_body": round(lower_ratio * 100, 1)
                },
                "fat_percentage": fat_percentage
            }
        else:
            return {
                "note": "Estimativa indisponível sem máscara de segmentação",
                "body_type": "indeterminado"
            }
    
    def _enhance_with_user_data(
        self, 
        metrics: Dict[str, Any], 
        user_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Melhora a análise combinando com dados do usuário.
        
        Args:
            metrics: Métricas calculadas a partir da imagem
            user_data: Dados adicionais do usuário
            
        Returns:
            Métricas enriquecidas
        """
        # Adiciona informações extras se disponíveis
        enhanced_metrics = metrics.copy()
        
        # Adiciona contexto se houver altura e peso
        if "height_cm" in user_data and "weight_kg" in user_data:
            try:
                height_cm = float(user_data["height_cm"])
                weight_kg = float(user_data["weight_kg"])
                
                # Calcula IMC
                bmi = weight_kg / ((height_cm / 100) ** 2)
                
                # Determina categoria de IMC
                bmi_category = "Normal"
                if bmi < 18.5:
                    bmi_category = "Abaixo do peso"
                elif bmi < 25:
                    bmi_category = "Normal"
                elif bmi < 30:
                    bmi_category = "Sobrepeso"
                else:
                    bmi_category = "Obesidade"
                
                enhanced_metrics["bmi"] = {
                    "value": round(bmi, 2),
                    "category": bmi_category,
                    "note": "IMC é um indicador estatístico simples e tem limitações"
                }
            except:
                # Se houver erro no cálculo, ignora
                pass
        
        # Adiciona histórico se disponível
        if "history" in user_data:
            history = user_data["history"]
            if isinstance(history, list) and len(history) > 0:
                # Compara com medições anteriores
                # Implementação simplificada para exemplo
                enhanced_metrics["comparison"] = {
                    "note": "Dados de histórico disponíveis para comparação",
                    "measurements": len(history)
                }
        
        return enhanced_metrics
    
    def _create_visualization(
        self, 
        image: np.ndarray, 
        results, 
        analysis_id: str
    ) -> Optional[str]:
        """
        Cria uma visualização da análise.
        
        Args:
            image: Imagem RGB original
            results: Resultados do MediaPipe Pose
            analysis_id: ID da análise
            
        Returns:
            Caminho para a visualização ou None se falhar
        """
        try:
            # Cria cópia da imagem para desenhar
            annotated_image = image.copy()
            
            # Desenha landmarks
            self.mp_drawing.draw_landmarks(
                annotated_image,
                results.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=self.mp_drawing.DrawingSpec(
                    color=(0, 255, 0), 
                    thickness=2, 
                    circle_radius=2
                ),
                connection_drawing_spec=self.mp_drawing.DrawingSpec(
                    color=(0, 0, 255), 
                    thickness=2
                )
            )
            
            # Converte de volta para BGR para salvar com OpenCV
            annotated_image_bgr = cv2.cvtColor(annotated_image, cv2.COLOR_RGB2BGR)
            
            # Determina caminho para salvar
            visualization_path = os.path.join(
                self.visualizations_dir, 
                f"{analysis_id}.jpg"
            )
            
            # Salva a imagem
            cv2.imwrite(visualization_path, annotated_image_bgr)
            
            return visualization_path
        except Exception as e:
            logger.error(f"Erro ao criar visualização: {str(e)}", exc_info=True)
            return None
