# Lista de Chequeo para Informes de Laboratorio TEC

Una herramienta web interactiva diseñada para ayudar a los estudiantes a verificar que sus informes de laboratorio cumplan con todos los criterios de calidad establecidos.

## 🎯 Características

- **Lista de chequeo interactiva** organizada por secciones del informe
- **Persistencia local** - el progreso se guarda automáticamente
- **Contador de visitas** para seguimiento del uso
- **Progreso visual** con barras de progreso por sección y general
- **Exportación de progreso** en formato JSON
- **Diseño responsivo** y moderno
- **Acceso a guía de elaboración** de informes

## 📋 Secciones Incluidas

1. **Título** (4 elementos)
2. **Autoría** (3 elementos)
3. **Resumen** (6 elementos)
4. **Palabras clave** (6 elementos)
5. **Introducción** (8 elementos)
6. **Materiales y métodos** (8 elementos)
7. **Resultados** (11 elementos)
8. **Discusión** (7 elementos)
9. **Conclusiones** (7 elementos)
10. **Referencias** (5 elementos)
11. **Presentación y estilo general** (3 elementos)

**Total: 68 elementos de verificación**

## 🚀 Cómo usar

### Para estudiantes:
1. Abre el archivo `index.html` en tu navegador
2. Revisa cada sección de tu informe
3. Marca los elementos que ya has completado
4. El progreso se guarda automáticamente
5. Usa el botón "Consultar Guía" para acceder a la guía de elaboración
6. Exporta tu progreso cuando termines

### Para profesores:
1. Sube los archivos a GitHub Pages o cualquier servidor web
2. Comparte el enlace con tus estudiantes
3. Los estudiantes pueden usar la herramienta de forma independiente
4. El contador de visitas te permite monitorear el uso

## 📁 Estructura del proyecto

```
Informes de lab/
├── index.html              # Página principal
├── styles.css              # Estilos CSS
├── script.js               # Funcionalidad JavaScript
├── README.md               # Este archivo
├── Guía_para_elaborar_informes.pdf  # Guía de referencia
└── Lista_de_chequeo_informes_completa_TEC.docx  # Documento original
```

## 🛠️ Tecnologías utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Diseño moderno con gradientes y animaciones
- **JavaScript ES6+** - Funcionalidad interactiva
- **LocalStorage** - Persistencia de datos
- **Font Awesome** - Iconos
- **Google Fonts** - Tipografía (Inter)

## 📱 Características técnicas

### Persistencia de datos
- El progreso se guarda automáticamente en el navegador
- Los datos persisten entre sesiones
- Contador de visitas independiente

### Responsive design
- Optimizado para dispositivos móviles
- Adaptable a diferentes tamaños de pantalla
- Interfaz intuitiva en todos los dispositivos

### Accesibilidad
- Navegación por teclado
- Contraste adecuado
- Textos descriptivos

## 🎨 Personalización

### Modificar elementos de la lista
Edita el archivo `index.html` y busca las secciones con clase `checklist-items` para agregar o modificar elementos.

### Cambiar colores
Modifica las variables CSS en `styles.css`:
```css
/* Colores principales */
--primary-gradient: linear-gradient(135deg, #667eea, #764ba2);
--success-color: #48bb78;
--warning-color: #ed8936;
```

### Agregar nuevas secciones
1. Copia una sección existente en `index.html`
2. Actualiza el `data-section` y contenido
3. Agrega los elementos correspondientes en `script.js`

## 📊 Funcionalidades avanzadas

### Exportación de progreso
- Formato JSON estructurado
- Incluye fecha, visitas, progreso general y por sección
- Descarga automática del archivo

### Animaciones
- Barras de progreso animadas
- Efectos hover en elementos interactivos
- Transiciones suaves
- Contador animado

## 🔧 Instalación y despliegue

### Opción 1: GitHub Pages
1. Crea un repositorio en GitHub
2. Sube todos los archivos
3. Activa GitHub Pages en la configuración del repositorio
4. Accede a `https://tu-usuario.github.io/nombre-repositorio`

### Opción 2: Servidor local
1. Abre una terminal en la carpeta del proyecto
2. Ejecuta un servidor local:
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Node.js (si tienes http-server instalado)
   npx http-server
   ```
3. Abre `http://localhost:8000` en tu navegador

### Opción 3: Cualquier servidor web
Simplemente sube los archivos a tu servidor web preferido.

## 👨‍🏫 Autor

**Prof. Évar Sevilla**  
Escuela de Física, TEC

## 📝 Licencia

Este proyecto está disponible para uso educativo. Los estudiantes pueden usar esta herramienta libremente para mejorar la calidad de sus informes de laboratorio.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si encuentras algún error o tienes sugerencias de mejora:

1. Reporta el problema o sugiere la mejora
2. Si es posible, envía un pull request
3. Asegúrate de que los cambios mantengan la compatibilidad

## 📞 Soporte

Para preguntas o problemas técnicos, contacta al autor o revisa la documentación del código en los archivos fuente.

---

*Herramienta desarrollada para mejorar la calidad de los informes de laboratorio en la Escuela de Física del TEC.*
