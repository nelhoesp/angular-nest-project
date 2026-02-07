# Sistema de Gestión de Pagos

Aplicación full-stack para la gestión de pagos de pólizas con importación de archivos Excel, filtros avanzados y paginación.

## Cómo ejecutar el Backend

1. **Instalar dependencias**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar base de datos**
   - Levantar MySQL con Docker Compose (desde la raíz del proyecto):
   ```bash
   docker-compose up -d
   ```

3. **Ejecutar el servidor**
   ```bash
   npm run start:dev
   ```
   
   El backend estará disponible en `http://localhost:3000`

## Cómo ejecutar el Frontend

1. **Instalar dependencias**
   ```bash
   cd frontend
   npm install
   ```

2. **Ejecutar la aplicación**
   ```bash
   npm start
   ```
   
   El frontend estará disponible en `http://localhost:4200`

## 🛠️ Decisiones Técnicas

### Backend
- **NestJS**: Framework con arquitectura modular, inyección de dependencias y soporte TypeScript nativo
- **TypeORM**: ORM con migraciones automáticas y relaciones entre entidades (Poliza-Pago)
- **MySQL**: Base de datos relacional para mantener integridad en relaciones de datos
- **xlsx**: Librería para procesamiento de archivos Excel con mapeo personalizado de columnas
- **class-validator**: Validación de DTOs con decoradores para endpoints seguros

### Frontend
- **Angular 21 Standalone**: Componentes sin NgModules para arquitectura más moderna y ligera
- **Tailwind CSS**: Diseño utilitario para UI responsive sin CSS personalizado

### Adicionales
- **CRUD completo**: Crear, Leer, Actualizar y Eliminar pagos con validación
- **Filtros combinables**: Por rango de fechas y empresa pagadora
- **Relaciones automáticas**: Creación de pólizas si no existen al importar Excel
- **Modal forms**: UX mejorada con formularios superpuestos
- **Navegación directa**: Saltar a páginas específicas en paginación