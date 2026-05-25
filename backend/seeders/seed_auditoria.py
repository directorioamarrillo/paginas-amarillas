async def seed_auditoria(run_sql_statements):
    from sqlalchemy import text

    sql_statements = []

    sql_statements.append(text("""
    INSERT INTO audit_logs (usuario_id, nombre_usuario, rol_usuario, accion, modulo, entidad_afectada, entidad_id, descripcion, metodo_http, endpoint, datos_anteriores, datos_nuevos, fecha, timestamp)
    VALUES
    (1, 'admin@example.com', 'admin', 'inicio_sesion', 'auth', 'usuario', '1', 'Usuario inició sesión', 'POST', '/auth/login', NULL, NULL, now(), now()),
    (2, 'comercio@example.com', 'empresa', 'crear_empresa', 'empresas', 'empresa', '10', 'Empresa creada por comerciante', 'POST', '/empresas/', NULL, NULL, now(), now()),
    (3, 'user@example.com', 'usuario', 'crear_review', 'reviews', 'review', '5', 'Review creada', 'POST', '/reviews/', NULL, NULL, now(), now());
    """))

    await run_sql_statements(sql_statements)
