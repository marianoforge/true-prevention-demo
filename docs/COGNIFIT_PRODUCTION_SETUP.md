# 🎮 CogniFit Juegos Reales - Guía de Producción

## ⚡ Para obtener JUEGOS REALES (no simulaciones)

### 🎯 **Problema Actual:**
- ✅ **208 juegos auténticos** cargados desde API ✅
- ❌ **SDK bloqueado** - solo simulaciones en localhost ❌

### 🔓 **Solución: Autorización de Dominio**

## 📞 **Paso 1: Contactar CogniFit**

### **Opciones de contacto:**
```bash
🌐 Portal Desarrolladores: https://www.cognifit.com/developers
📧 Email Directo: developers@cognifit.com  
☎️ Soporte General: https://www.cognifit.com/contact
💼 Ventas Empresariales: sales@cognifit.com
```
### **Información a enviar:**
```text
Asunto: Solicitud de Autorización de Dominio - SDK JavaScript

Hola equipo CogniFit,

Solicito autorización para usar el SDK de JavaScript en mi aplicación:

🆔 Client ID: a034c738291e88b51239d6f4f08db3cd
🌐 Dominio de Producción: https://[TU-DOMINIO].com
📧 Email de desarrollador: [TU-EMAIL]
🎯 Uso: Aplicación web de entrenamiento cognitivo

Necesito que autoricen el dominio para que los juegos carguen 
completamente interactivos (actualmente solo funciona en simulación).

Gracias,
[Tu nombre]
```

## 🚀 **Paso 2: Deploy en Dominio Real**

### **Opciones de hosting gratuitas:**
```bash
# Vercel (recomendado)
npm i -g vercel
vercel --prod

# Netlify  
npm run build
# Subir carpeta 'out' a netlify.com

# Railway
# Conectar repo en railway.app
```

### **Configurar variables de entorno en producción:**
```bash
NEXT_PUBLIC_COGNIFIT_API_URL=https://api.cognifit.com
NEXT_PUBLIC_COGNIFIT_CLIENT_ID=a034c738291e88b51239d6f4f08db3cd
COGNIFIT_CLIENT_SECRET=7e9e4279ed23a9ed50e227f7883def07
COGNIFIT_CALLBACK_URL=https://TU-DOMINIO.com/callback
```

## 🛠️ **Paso 3: Verificar Configuración**

### **En la consola del navegador deberías ver:**
```bash
🔄 INTENTANDO cargar SDK REAL de CogniFit...
📥 Descargando SDK desde: https://js.cognifit.com/v2.0/html5Loader.js
🎉 ¡SDK REAL de CogniFit cargado exitosamente!
🎮 Los juegos serán completamente interactivos
```

### **En lugar de:**
```bash
❌ No se pudo cargar SDK real
🔒 Dominio no autorizado por CogniFit
🔄 Usando simulación como alternativa
```

## ⚡ **Alternativas Mientras Esperas Autorización:**

### **1. Usar localhost con proxy:**
```bash
# Instalar localtunnel
npm i -g localtunnel

# En otra terminal
lt --port 3000 --subdomain tu-app-cognifit

# Te dará: https://tu-app-cognifit.loca.lt
# Solicita autorización para ese dominio
```

### **2. Usar ngrok:**
```bash
# Instalar ngrok
npm i -g ngrok

# Crear túnel
ngrok http 3000

# Te dará URL como: https://abc123.ngrok.io
# Solicita autorización para ese dominio
```

## 📋 **Checklist de Autorización:**

- [ ] 📧 Email enviado a CogniFit developers
- [ ] 🌐 Dominio de producción listo
- [ ] 🔧 Variables de entorno configuradas  
- [ ] ⚙️ App deployada en dominio real
- [ ] 🎮 SDK real funcionando (no simulación)

## 🎯 **Resultado Final:**

Una vez autorizado tu dominio:
- ✅ **Juegos completamente interactivos**
- ✅ **Sin simulaciones** - juegos reales de CogniFit
- ✅ **208 juegos auténticos** funcionando al 100%
- ✅ **Experiencia de usuario completa**

---

**💡 Tip:** CogniFit suele responder en 1-3 días laborales para autorizaciones de dominio. 