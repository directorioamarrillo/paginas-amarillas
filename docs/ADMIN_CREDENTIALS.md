# Credenciales de Administrador - Estado Limpio

## ✅ Estado Actual

La base de datos ha sido limpiada exitosamente. Todos los usuarios, empresas y comerciantes han sido eliminados (borrado lógico con `deleted_at`). Solo queda **un usuario admin** con permisos completos.

---

## 👤 Credenciales del Admin

**Email:** `admin@admin.com`  
**Contraseña:** `12345678`

**Rol:** Admin  
**ID Usuario:** 1  
**ID Rol:** 1  
**Empresa Asociada:** Ninguna

---

## 🔑 Acceso a la API

### Endpoint de Login
```
POST http://127.0.0.1:8000/api/signin
Content-Type: application/x-www-form-urlencoded

username=admin@admin.com&password=12345678
```

### Respuesta de Login (Token JWT)
El servidor devuelve un `access_token` válido por 60 minutos que debe usarse en peticiones autenticadas:

```bash
Authorization: Bearer <access_token>
```

---

## 📋 Permisos del Admin

El admin tiene acceso a **todos los permisos del sistema:**

- ✓ `crear_empresa`
- ✓ `ver_registros_eliminados`
- ✓ `restaurar_registros_eliminados`
- ✓ `crear_paises` / `modificar_paises`
- ✓ `crear_categorias` / `modificar_categorias`
- ✓ `crear_departamentos` / `modificar_departamentos`
- ✓ `crear_municipios` / `modificar_municipios`
- ✓ `crear_usuarios` / `modificar_usuarios`
- ✓ `modificar_empresas`
- ✓ `crear_roles` / `modificar_roles`
- ✓ `crear_permisos` / `modificar_permisos`
- ✓ `crear_marketplace` / `modificar_marketplace`
- ✓ `crear_publicidades` / `modificar_publicidades`
- ✓ `crear_reviews` / `modificar_reviews`
- ✓ `crear_mensajes` / `modificar_mensajes`
- ✓ `ver_favoritos` / `crear_favoritos` / `eliminar_favoritos`
- ✓ `ver_notificaciones` / `crear_notificaciones` / `eliminar_notificaciones`
- ✓ `ver_reportes`

---

## 📌 Acceso a Endpoints Útiles

### Health Check
```bash
curl http://127.0.0.1:8000/health
```

### Swagger UI (Documentación interactiva)
```
http://127.0.0.1:8000/docs
```

### Auditoría (requiere token admin)
```bash
curl -H "Authorization: Bearer <token>" http://127.0.0.1:8000/api/auditoria/?limit=10
```

### Reportes de Auditoría
```bash
# Resumen JSON
curl -H "Authorization: Bearer <token>" http://127.0.0.1:8000/api/auditoria/report/summary

# Descargar PDF
curl -H "Authorization: Bearer <token>" http://127.0.0.1:8000/api/auditoria/report/summary/pdf -o reporte.pdf
```

---

## 🗂️ Backups

Los datos eliminados fueron respaldados en JSON en:
```
backups/20260516_145227/
```

Contiene tablas:
- `usuarios.json`
- `empresas.json`
- `publicidades.json`
- `marketplaces.json`
- `reviews.json`
- `resultados.json`
- `mensajes.json`
- `notificaciones.json`
- `usuarios_favoritos.json`

---

## 🚀 Próximos Pasos

1. **Registrar nuevos usuarios** vía `/api/signup` (rol usuario por defecto)
2. **Crear empresas** vía `/api/empresas/` (requiere rol comerciante o admin)
3. **Crear productos en marketplace** vía `/api/marketplace/`
4. **Monitorear auditoría** vía `/api/auditoria/`

---

## 📝 Notas Importantes

- El sistema usa **soft delete** (`deleted_at IS NULL` para registros activos)
- Los backups están en JSON y pueden restaurarse si es necesario
- El script `scripts/reset_to_clean_state.py` puede ejecutarse de nuevo para repetir el proceso
- El script `scripts/ensure_single_admin.py` garantiza un único admin activo
- Todas las variables de entorno se cargan desde `server/.env`

---

**Fecha de limpieza:** 2026-05-16  
**Estado:** ✅ Funcional, listo para producción
