# Products Microservice


## Dev

1. Clonar repositorio
2. Instalar dependencias
3. Crear archivo .env con las siguientes variables

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/products
PORT=3000
```

4.Ejecutar migracion de prisma `npx prisma migrate dev`
5.Ejecutar microservicio `npm run start:dev`