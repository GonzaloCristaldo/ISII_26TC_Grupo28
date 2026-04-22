# ISII-26TC-Grupo28

Repositorio para Trabajo de Campo de la asignatura Ingeniería del Software II 2026

Como trabajo de campo se realizara un sistema de tele-monitoreo medico donde un paciente registra mediciones vitales y el medico revisa las alertas.
En principio, el sistema busca ser modular, así que se seguirá el modelo de arquitectura por capas.
Desprendiendo de esto, y haciendo uso de la modularidad diseñada, ese modulo de monitoreo, debería ser solo una de las funciones que se le pueden agregar al sistema.

Instalación de dependencias (Node.js y Next.js)
Para ejecutar correctamente el proyecto, es necesario contar con Node.js y npm instalados en el sistema.
El proyecto está desarrollado con Next.js 16, por lo que se recomienda utilizar una versión reciente de Node.js.
________________________________________
Requisitos previos
•	Node.js versión 18 o superior (recomendado: LTS) 
•	npm (incluido con Node.js) 
Podés verificar las versiones instaladas con:
node -v
npm -v
________________________________________
Instalación
1.	Clonar el repositorio: 
git clone <URL_DEL_REPOSITORIO>
2.	Acceder a la carpeta del proyecto: 
cd biovigia
3.	Instalar las dependencias: 
npm install
________________________________________
Ejecución del proyecto
Para iniciar el entorno de desarrollo:
npm run dev
Luego abrir en el navegador:
http://localhost:3000
________________________________________
Notas importantes
•	Asegurarse de tener la base de datos configurada y en ejecución (ver sección anterior) 
•	Verificar que no haya conflictos en el puerto 3000 
•	En caso de errores, eliminar node_modules y ejecutar nuevamente: 
rm -rf node_modules
npm install


Requisitos para la Base de Datos
Para poder ejecutar correctamente la base de datos del sistema, es necesario contar con PostgreSQL (EnterpriseDB) instalado en el equipo.
La instalación de PostgreSQL incluye la herramienta pgAdmin 4, que será utilizada para la administración de la base de datos.
Instalación
1.	Descargar PostgreSQL desde el sitio oficial:
https://www.postgresql.org/download/ 
2.	Durante la instalación: 
o	Asegurarse de incluir pgAdmin 4 
o	Definir una contraseña para el usuario postgres.

Puesta en marcha de la base de datos
1.	Abrir pgAdmin 4 
2.	Conectarse al servidor local utilizando: 
o	Usuario: postgres 
o	Contraseña: (la definida durante la instalación) 
3.	Crear una nueva base de datos (ej: biovigia_db, en el env de ejemplo se usa este) 
4.	Ejecutar el script SQL provisto en el proyecto para generar las tablas y estructuras necesarias 

Notas importantes
•	Es requisito tener PostgreSQL en ejecución para que el sistema funcione correctamente 
•	Verificar que el puerto por defecto (5432) esté disponible 
•	En caso de errores de conexión, revisar la configuración del archivo .env del proyecto 
