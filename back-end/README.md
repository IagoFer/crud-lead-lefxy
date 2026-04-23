# Backend: Mini CRM LEFXY API (NestJS) ⚙️

O backend foi estruturado seguindo boas práticas do Clean Architecture Adaptada, projetado especificamente para resiliência de alto desempenho em um cenário simulado com um total extenso de dados reais corporativos e comunicação direta com Modelos de Inteligência Artificial L7 (Gemini).

## 🚀 Principais Features Architectonicas
- **Rate Limiting & Anti-Spam**: Injetado nativamente através do `@nestjs/throttler`. Restringe agressivamente acessos ao Endpoint da API do Google Gemini AI (IA limit a 1 requisição por minuto para testes controlados ou mitigação bruta de ataques DDoS visando custo de tráfego de Tokens).
- **Mapeamento Swagger Open-API Completo**: Endpoints robustos auto-documentados e interativos operantes em rota primária de observabilidade.
- **Pipeline Segurado com Pipes de Validação**: Prevenções de NoSQL Instabilities e Injection garantidas pelo isolamento do MongoDB pelo uso em larga escala de Dto/Types e o `ParseObjectIdPipe` Custom.
- **Caches de Busca O(1)**: Serviço BullMQ orquestrando Tarefas com Cache Redis atuando dinamicamente na consulta do `FindById`.
- **Organização Modular com JWT**: Foco impecável de persistência baseada em JWT Guard protegendo todo o Core Business da API contra roteamentos expostos.

> 📚 **Para rodar o Servidor e Orquestrar Banco + Fila:** Por favor, utilize o arquivo `docker-compose.yml` e veja as instruções definitivas localizadas no `README.md` da raiz do repositório Principal!
