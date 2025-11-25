"""
Agente de Webscraping para Produtos Afiliados
Usa estrutura Agno para processar links de produtos e extrair informações
"""

import asyncio
import logging
import re
from typing import Dict, Any, Optional, List
from datetime import datetime
from urllib.parse import urlparse, parse_qs
import json

import aiohttp
from bs4 import BeautifulSoup
from agno.agent import Agent
from agno.models.groq import Groq
from agno.tools.reasoning import ReasoningTools

logger = logging.getLogger(__name__)


class ProductScraperAgent:
    """
    Agente especializado em webscraping de produtos de marketplaces
    Suporta: Shopee, Amazon, Magalu, Mercado Livre, Americanas, Casas Bahia
    """
    
    def __init__(self):
        self.agent = None
        self.initialized = False
        self.session = None
        
    async def initialize(self):
        """Inicializar o agente e sessão HTTP"""
        if self.initialized:
            return
            
        logger.info("Inicializando ProductScraperAgent...")
        
        # Criar sessão HTTP assíncrona
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        )
        
        # Criar agente Agno para análise de dados extraídos
        model_id = "groq/llama-3.1-8b-instant"  # Modelo mais rápido para análise
        
        self.agent = Agent(
            model=Groq(id=model_id),
            name="ProductScraper",
            description="Agente especializado em análise e estruturação de dados de produtos",
            instructions=[
                "Você é um especialista em análise de dados de produtos",
                "Estruture informações de produtos de forma consistente",
                "Extraia características, especificações e informações relevantes",
                "Normalize preços, avaliações e outras métricas",
            ],
            tools=[ReasoningTools()],
            markdown=False,
        )
        
        self.initialized = True
        logger.info("✓ ProductScraperAgent inicializado")
    
    async def close(self):
        """Fechar sessão HTTP"""
        if self.session:
            await self.session.close()
    
    def detect_platform(self, url: str) -> str:
        """Detecta a plataforma baseado na URL"""
        domain = urlparse(url).netloc.lower()
        
        if 'shopee' in domain:
            return 'shopee'
        elif 'amazon' in domain:
            return 'amazon'
        elif 'magalu' in domain or 'magazine' in domain:
            return 'magalu'
        elif 'mercadolivre' in domain or 'mercadolibre' in domain:
            return 'mercadolivre'
        elif 'americanas' in domain:
            return 'americanas'
        elif 'casasbahia' in domain:
            return 'casasbahia'
        else:
            return 'other'
    
    async def scrape_product(self, url: str, platform: Optional[str] = None) -> Dict[str, Any]:
        """
        Faz webscraping de um produto e retorna dados estruturados
        
        Args:
            url: URL do produto
            platform: Plataforma (opcional, será detectada automaticamente)
            
        Returns:
            Dict com dados do produto estruturados
        """
        if not self.initialized:
            await self.initialize()
        
        if not platform:
            platform = self.detect_platform(url)
        
        logger.info(f"Scraping produto: {url} (plataforma: {platform})")
        
        try:
            # Obter HTML da página
            html = await self._fetch_html(url)
            
            # Extrair dados baseado na plataforma
            if platform == 'shopee':
                data = self._scrape_shopee(html, url)
            elif platform == 'amazon':
                data = self._scrape_amazon(html, url)
            elif platform == 'magalu':
                data = self._scrape_magalu(html, url)
            elif platform == 'mercadolivre':
                data = self._scrape_mercadolivre(html, url)
            elif platform == 'americanas':
                data = self._scrape_americanas(html, url)
            elif platform == 'casasbahia':
                data = self._scrape_casasbahia(html, url)
            else:
                data = self._scrape_generic(html, url)
            
            # Enriquecer dados com agente Agno
            enriched_data = await self._enrich_with_agent(data)
            
            return {
                'success': True,
                'platform': platform,
                'url': url,
                'scraped_at': datetime.now().isoformat(),
                'data': enriched_data,
            }
            
        except Exception as e:
            logger.error(f"Erro ao fazer scraping: {str(e)}")
            return {
                'success': False,
                'platform': platform,
                'url': url,
                'error': str(e),
                'scraped_at': datetime.now().isoformat(),
            }
    
    async def _fetch_html(self, url: str) -> str:
        """Busca HTML da URL"""
        async with self.session.get(url) as response:
            if response.status != 200:
                raise Exception(f"HTTP {response.status}: {response.reason}")
            return await response.text()
    
    def _scrape_shopee(self, html: str, url: str) -> Dict[str, Any]:
        """Scraping específico para Shopee"""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Tentar extrair dados JSON embutidos
        script_tags = soup.find_all('script', type='application/json')
        product_data = {}
        
        for script in script_tags:
            try:
                data = json.loads(script.string)
                if 'item' in str(data).lower() or 'product' in str(data).lower():
                    product_data.update(data)
            except:
                pass
        
        # Extrair informações básicas
        name = soup.find('h1') or soup.find('meta', property='og:title')
        name = name.get('content') if name and hasattr(name, 'get') else (name.text if name else '')
        
        price_elem = soup.find('div', class_=re.compile('price', re.I))
        price = self._extract_price(price_elem.text if price_elem else '')
        
        images = []
        img_tags = soup.find_all('img', src=re.compile('shopee', re.I))
        for img in img_tags[:10]:  # Limitar a 10 imagens
            src = img.get('src') or img.get('data-src')
            if src and src not in images:
                images.append(src)
        
        description = soup.find('div', class_=re.compile('description', re.I))
        description = description.text if description else ''
        
        rating_elem = soup.find('div', class_=re.compile('rating', re.I))
        rating = self._extract_rating(rating_elem.text if rating_elem else '')
        
        return {
            'name': name.strip(),
            'price': price,
            'images': images,
            'description': description.strip(),
            'rating': rating,
            'platform': 'shopee',
        }
    
    def _scrape_amazon(self, html: str, url: str) -> Dict[str, Any]:
        """Scraping específico para Amazon"""
        soup = BeautifulSoup(html, 'html.parser')
        
        name = soup.find('span', id='productTitle')
        name = name.text.strip() if name else ''
        
        price_elem = soup.find('span', class_=re.compile('price', re.I))
        price = self._extract_price(price_elem.text if price_elem else '')
        
        images = []
        img_container = soup.find('div', id='imageBlock_feature_div')
        if img_container:
            imgs = img_container.find_all('img')
            for img in imgs[:10]:
                src = img.get('src') or img.get('data-src')
                if src and 'http' in src and src not in images:
                    images.append(src)
        
        description = soup.find('div', id='productDescription')
        description = description.text.strip() if description else ''
        
        rating_elem = soup.find('span', class_=re.compile('rating', re.I))
        rating = self._extract_rating(rating_elem.text if rating_elem else '')
        
        return {
            'name': name,
            'price': price,
            'images': images,
            'description': description,
            'rating': rating,
            'platform': 'amazon',
        }
    
    def _scrape_magalu(self, html: str, url: str) -> Dict[str, Any]:
        """Scraping específico para Magalu"""
        soup = BeautifulSoup(html, 'html.parser')
        
        name = soup.find('h1', class_=re.compile('product', re.I))
        name = name.text.strip() if name else ''
        
        price_elem = soup.find('span', class_=re.compile('price', re.I))
        price = self._extract_price(price_elem.text if price_elem else '')
        
        images = []
        img_tags = soup.find_all('img', class_=re.compile('product', re.I))
        for img in img_tags[:10]:
            src = img.get('src') or img.get('data-src')
            if src and 'http' in src:
                images.append(src)
        
        description = soup.find('div', class_=re.compile('description', re.I))
        description = description.text.strip() if description else ''
        
        return {
            'name': name,
            'price': price,
            'images': images,
            'description': description,
            'platform': 'magalu',
        }
    
    def _scrape_mercadolivre(self, html: str, url: str) -> Dict[str, Any]:
        """Scraping específico para Mercado Livre"""
        soup = BeautifulSoup(html, 'html.parser')
        
        name = soup.find('h1', class_=re.compile('title', re.I))
        name = name.text.strip() if name else ''
        
        price_elem = soup.find('span', class_=re.compile('price', re.I))
        price = self._extract_price(price_elem.text if price_elem else '')
        
        images = []
        img_tags = soup.find_all('img', class_=re.compile('gallery', re.I))
        for img in img_tags[:10]:
            src = img.get('src') or img.get('data-src')
            if src and 'http' in src:
                images.append(src)
        
        description = soup.find('div', class_=re.compile('description', re.I))
        description = description.text.strip() if description else ''
        
        return {
            'name': name,
            'price': price,
            'images': images,
            'description': description,
            'platform': 'mercadolivre',
        }
    
    def _scrape_americanas(self, html: str, url: str) -> Dict[str, Any]:
        """Scraping específico para Americanas"""
        return await self._scrape_generic(html, url, 'americanas')
    
    def _scrape_casasbahia(self, html: str, url: str) -> Dict[str, Any]:
        """Scraping específico para Casas Bahia"""
        return await self._scrape_generic(html, url, 'casasbahia')
    
    def _scrape_generic(self, html: str, url: str, platform: str = 'other') -> Dict[str, Any]:
        """Scraping genérico para outras plataformas"""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Tentar extrair informações básicas
        name = soup.find('h1') or soup.find('title')
        name = name.text.strip() if name else ''
        
        # Tentar encontrar preço
        price_pattern = re.compile(r'R\$\s*(\d+[.,]\d+)', re.I)
        price_match = price_pattern.search(html)
        price = float(price_match.group(1).replace(',', '.')) if price_match else 0.0
        
        # Tentar encontrar imagens
        images = []
        img_tags = soup.find_all('img')
        for img in img_tags[:10]:
            src = img.get('src') or img.get('data-src')
            if src and 'http' in src and src not in images:
                images.append(src)
        
        description = soup.find('meta', property='og:description')
        description = description.get('content', '') if description else ''
        
        return {
            'name': name,
            'price': price,
            'images': images,
            'description': description,
            'platform': platform,
        }
    
    def _extract_price(self, text: str) -> float:
        """Extrai preço de texto"""
        price_pattern = re.compile(r'(\d+[.,]\d+)')
        match = price_pattern.search(text.replace('R$', '').replace('$', ''))
        if match:
            return float(match.group(1).replace(',', '.'))
        return 0.0
    
    def _extract_rating(self, text: str) -> float:
        """Extrai avaliação de texto"""
        rating_pattern = re.compile(r'(\d+[.,]\d+)')
        match = rating_pattern.search(text)
        if match:
            rating = float(match.group(1).replace(',', '.'))
            return min(5.0, max(0.0, rating))  # Limitar entre 0 e 5
        return 0.0
    
    async def _enrich_with_agent(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Usa agente Agno para enriquecer e estruturar dados"""
        if not self.agent:
            return data
        
        try:
            prompt = f"""
            Analise os seguintes dados de produto extraídos e estruture em formato JSON:
            
            Nome: {data.get('name', '')}
            Preço: {data.get('price', 0)}
            Descrição: {data.get('description', '')[:500]}
            Avaliação: {data.get('rating', 0)}
            Plataforma: {data.get('platform', '')}
            
            Retorne um JSON com:
            - name: nome do produto (normalizado)
            - description: descrição limpa e estruturada
            - price: preço numérico
            - originalPrice: se houver desconto
            - images: array de URLs de imagens
            - rating: avaliação (0-5)
            - specifications: objeto com características extraídas
            - tags: array de tags relevantes
            - features: array de características principais
            """
            
            response = await self.agent.run(prompt, stream=False)
            
            # Tentar extrair JSON da resposta
            json_match = re.search(r'\{.*\}', response.content, re.DOTALL)
            if json_match:
                enriched = json.loads(json_match.group())
                data.update(enriched)
            
        except Exception as e:
            logger.warning(f"Erro ao enriquecer com agente: {str(e)}")
        
        return data

