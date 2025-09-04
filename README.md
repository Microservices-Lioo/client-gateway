# 🚪 Client Gateway

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat&logo=node.js)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-Framework-red?style=flat&logo=nestjs)](https://nestjs.com/)
[![NATS](https://img.shields.io/badge/NATS-Messaging-blue?style=flat&logo=nats)](https://nats.io/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue?style=flat&logo=docker)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)

Gateway de entrada único para la arquitectura de microservicios del sistema Bingo. Actúa como punto de comunicación centralizado entre el cliente y todos los microservicios del backend, proporcionando una interfaz HTTP unificada y gestionando la comunicación interna a través de NATS.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos Previos](#requisitos-previos)
- [Ejecución](#ejecución)
- [Configuración](#configuración)
- [Contribución](#contribución)

## ✨ Características

- 🌐 **API Gateway Unificado**: Punto de entrada único para todos los servicios
- 🚀 **Comunicación Asíncrona**: Integración con NATS para mensajería eficiente
- 🔐 **Autenticación Centralizada**: Manejo de autenticación y autorización
- 🔄 **Load Balancing**: Distribución inteligente de carga entre microservicios
- 📊 **Logging y Monitoring**: Trazabilidad completa de requests
- 🛡️ **Rate Limiting**: Protección contra abuso de APIs
- 🔌 **Hot Reload**: Desarrollo ágil con recarga automática
- 🐳 **Docker Ready**: Containerización para despliegue sencillo

## 🏗️ Arquitectura

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   Frontend      │◄────────────────┤ Client Gateway  │
│   (Angular)     │                 │   (NestJS)      │
└─────────────────┘                 └───────┬─────────┘
                                            │ NATS
                                            │
                    ┌───────────────────────┼─────────────────────┐
                    │                       │                     │
            ┌───────▼────────┐    ┌─────────▼────────┐    ┌───────▼────────┐
            │  Auth Service  │    │  Game Service    │    │  User Service  │
            └────────────────┘    └──────────────────┘    └────────────────┘
```

## 🛠️ Tecnologías Utilizadas

- **Framework**: NestJS
- **Runtime**: Node.js 18+
- **Lenguaje**: TypeScript
- **Message Broker**: NATS
- **Containerización**: Docker
- **Validación**: Class Validator
- **Transformación**: Class Transformer

## 📋 Requisitos Previos

Asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [npm](https://www.npmjs.com/) (versión 8 o superior)
- [Docker](https://www.docker.com/) (para NATS y despliegue)
- [Git](https://git-scm.com/)

```bash
# Verificar versiones
node --version
npm --version
docker --version
```

## 🚀 Ejecución

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Microservices-Lioo/client-gateway.git
cd client-gateway
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.template .env

# Editar las variables según tu entorno
nano .env
```

### 4. Levantar NATS Server

```bash
# Ejecutar NATS en Docker
docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats

# Verificar que esté ejecutándose
docker ps
```

### 5. Iniciar los Microservicios

Antes de levantar el gateway, asegúrate de que los microservicios estén ejecutándose:

```bash
# Iniciar cada microservicio por separado
# (Consulta la documentación de cada microservicio)
```

### 6. Ejecutar el Client Gateway

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod
```

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
# Servidor
PORT=3000
NODE_ENV=development

# NATS Configuration
NATS_SERVERS=nats://localhost:4222 # Si toda la aplicación esta dockerizada, se cambia localhost por el nombre del servicio de nats en docker
```

### Verificar Estado

Una vez iniciado, el gateway estará disponible en:

- **API**: `http://localhost:3000`
- **NATS Monitor**: `http://localhost:8222`

### Producción

```bash
# Construir imagen de producción
docker build -f dockerfile.prod -t client-gateway .

# Ejecutar contenedor
docker run -d \
  --name client-gateway \
  -p 3000:3000 \
  --env-file .env.prod \
  client-gateway
```

## 🤝 Contribución

### Flujo de Trabajo

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Add nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📚 Documentación Adicional

- [NestJS Documentation](https://docs.nestjs.com/)
- [NATS Documentation](https://docs.nats.io/)
- [Docker Documentation](https://docs.docker.com/)
- [API Documentation](./docs/api.md)
- [Architecture Guide](./docs/architecture.md)

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

Desarrollado por **Microservices-Lioo Team**.

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los [Issues existentes](https://github.com/Microservices-Lioo/client-gateway/issues)
2. Crea un nuevo issue con detalles específicos

---

⭐ **¡Si este proyecto te es útil, dale una estrella!**