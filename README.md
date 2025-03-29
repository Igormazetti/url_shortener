# URL Shortener API

Uma API RESTful para encurtamento de URLs construída com NestJS.

## Descrição do Projeto

URL Shortener é uma API que permite encurtar URLs longas em links curtos e fáceis de compartilhar. O sistema oferece funcionalidades de autenticação, gerenciamento de URLs encurtadas e rastreamento de cliques.

## Funcionalidades Principais

- **Encurtamento de URLs**: Transforme URLs longas em códigos curtos
- **Redirecionamento**: Redirecionamento automático para a URL original
- **Autenticação**: Sistema completo de registro e login de usuários
- **Gerenciamento de URLs**: Usuários autenticados podem gerenciar suas URLs encurtadas
- **Rastreamento de Cliques**: Contagem de cliques para cada URL encurtada
- **Documentação API**: Interface Swagger para testar e explorar a API

## Tecnologias Utilizadas

- **Backend**: NestJS (Framework Node.js)
- **Banco de Dados**: PostgreSQL
- **ORM**: TypeORM
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: class-validator
- **Documentação**: Swagger (OpenAPI)

## Pré-requisitos

- Node.js (v20 ou superior)
- npm (v10 ou superior)
- PostgreSQL (v14 ou superior)
- Docker e Docker Compose (opcional)

## Instalação

### Usando npm

1. Clone o repositório:

   ```bash
   git clone https://github.com/yourusername/url-shortener.git
   cd url-shortener
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

   ```
   # Banco de Dados
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=url_shortener

   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRATION=1d

   # Aplicação
   PORT=3000
   BASE_URL=http://localhost:3000
   ```

4. Inicie a aplicação:
   ```bash
   npm run start:dev
   ```

### Usando Docker

1. Clone o repositório:

   ```bash
   git clone https://github.com/yourusername/url-shortener.git
   cd url-shortener
   ```

2. Crie um arquivo `.env` (veja acima)

3. Inicie a aplicação com Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Estrutura do Projeto

```
src/
├── auth/                  # Módulo de autenticação
│   ├── guards/            # Guards de autenticação
│   ├── strategies/        # Estratégias de autenticação
│   ├── auth.controller.ts # Controlador de autenticação
│   ├── auth.module.ts     # Módulo de autenticação
│   └── auth.service.ts    # Serviço de autenticação
├── common/                # Código compartilhado
│   └── entities/          # Entidades base
├── config/                # Configurações da aplicação
├── migrations/            # Migrações do banco de dados
├── urls/                  # Módulo de URLs
│   ├── dto/               # Objetos de transferência de dados
│   ├── entities/          # Entidades de URL
│   ├── urls.controller.ts # Controlador de URLs
│   ├── urls.module.ts     # Módulo de URLs
│   └── urls.service.ts    # Serviço de URLs
├── users/                 # Módulo de usuários
│   ├── dto/               # Objetos de transferência de dados
│   ├── entities/          # Entidades de usuário
│   ├── users.controller.ts # Controlador de usuários
│   ├── users.module.ts    # Módulo de usuários
│   └── users.service.ts   # Serviço de usuários
├── app.controller.ts      # Controlador principal
├── app.module.ts          # Módulo principal
├── app.service.ts         # Serviço principal
└── main.ts                # Ponto de entrada da aplicação
```

## API Endpoints

### Autenticação

- **POST /auth/register** - Registrar um novo usuário
- **POST /auth/login** - Fazer login e obter token JWT

### URLs

- **POST /urls** - Criar uma URL encurtada (funciona com ou sem autenticação)
- **GET /urls** - Listar todas as URLs criadas pelo usuário autenticado
- **PATCH /urls/:id** - Atualizar o destino de uma URL
- **DELETE /urls/:id** - Excluir uma URL

### Redirecionamento

- **GET /:shortCode** - Redirecionar para a URL original

## Documentação da API

A documentação completa da API está disponível através do Swagger UI. Após iniciar a aplicação, acesse:

```
http://localhost:3000/api
```

## Exemplos de Uso

### Criar uma URL encurtada (sem autenticação)

```bash
curl -X POST http://localhost:3000/urls \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://exemplo.com/pagina-com-url-muito-longa"}'
```

Resposta:

```json
{
  "originalUrl": "https://exemplo.com/pagina-com-url-muito-longa",
  "shortUrl": "http://localhost:3000/abc123",
  "shortCode": "abc123"
}
```

### Registrar um usuário

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "João Silva", "email": "joao@exemplo.com", "password": "senha123"}'
```

### Fazer login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "joao@exemplo.com", "password": "senha123"}'
```

Resposta:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "joao@exemplo.com",
    "name": "João Silva"
  }
}
```

### Listar URLs do usuário (autenticado)

```bash
curl -X GET http://localhost:3000/urls \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Melhorias Potenciais para Escalabilidade Horizontal

1. **Escalabilidade do Banco de Dados**:

   - Implementar sharding para armazenamento de URLs
   - Usar réplicas de leitura para cenários de alto tráfego
   - Considerar soluções NoSQL para certos tipos de dados

2. **Camada de Cache**:

   - Implementar Redis para cache de URLs frequentemente acessadas
   - Usar cache distribuído para múltiplas instâncias

3. **Balanceamento de Carga**:

   - Implantar atrás de um balanceador de carga para distribuir tráfego
   - Implementar sessões persistentes se necessário

4. **Statelessness**:

   - Garantir que a aplicação permaneça stateless para fácil escalabilidade
   - Armazenar dados de sessão no Redis ou armazenamento externo similar

5. **Monitoramento e Observabilidade**:

   - Implementar logging abrangente
   - Configurar coleta de métricas com Prometheus
   - Usar rastreamento distribuído com Jaeger ou ferramentas similares

6. **Desafios**:
   - Manter consistência de dados entre instâncias
   - Gerenciar pools de conexão de banco de dados eficientemente
   - Gerenciar invalidação de cache
   - Garantir códigos curtos únicos em sistemas distribuídos

## Testes

```bash
# Executar testes unitários
npm run test

# Executar testes e2e
npm run test:e2e

# Verificar cobertura de testes
npm run test:cov
```

## Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

[MIT](LICENSE)

---

Desenvolvido com ❤️ usando NestJS.
