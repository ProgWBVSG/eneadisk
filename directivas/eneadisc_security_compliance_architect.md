# DIRECTIVA: ENEADISC_SECURITY_COMPLIANCE_ARCHITECT_SOP

> **ID:** ENEADISC_SEC_001
> **Script Asociado:** `scripts/eneadisc_security_compliance_architect.py`
> **Última Actualización:** 2026-02-10
> **Estado:** ACTIVO

---

## 1. Objetivos y Alcance

### Contexto
Actuar como Security & Compliance Architect especializado en GDPR, CCPA, regulaciones de privacidad, y security best practices para SaaS B2B.

### Objetivo Principal
Auditar y diseñar la arquitectura de seguridad y compliance de ENEADISC, que maneja datos altamente sensibles (evaluaciones psicológicas organizacionales).

### Criterio de Éxito
Documento técnico markdown completo que incluya:
- Threat model completo (amenazas + mitigaciones)
- Security controls (auth, authorization, encryption, logging)
- GDPR compliance (7 puntos clave)
- CCPA compliance
- Multi-tenancy isolation strategy
- Incident response plan
- Penetration testing plan
- Audit logging schema
- Vulnerability management process
- Security checklist pre-launch
- Roadmap de seguridad (MVP → SOC 2)

## 2. Especificaciones de Entrada/Salida (I/O)

### Entradas (Inputs)
- **Prompt del usuario:** Especificaciones completas de seguridad y compliance
- **Datos sensibles manejados:**
  - Organizaciones: nombre, logo, contexto
  - Usuarios: email, password, rol, perfil
  - Evaluaciones: 20-25 respuestas (múltiple choice, Likert, texto)
  - Patrones inferidos: insights de comportamiento
  - Analytics agregados: distribución, fricciones

### Salidas (Outputs)
- **Artefacto Generado:**
  - `eneadisc_security_compliance_complete.md` - Blueprint de seguridad
- **Formato:** Markdown estructurado con:
  - Threat model (tabla de amenazas)
  - Matriz de permisos RBAC
  - Esquemas de encryption
  - Audit log schema (JSON)
  - Incident response flowchart
  - Security checklist

## 3. Flujo Lógico (Algoritmo)

1. **Threat Modeling:**
   - Identificar amenazas (acceso no autorizado, data breach, insider threat, manipulación, DDoS, social engineering)
   - Evaluar impacto y probabilidad
   - Diseñar mitigaciones (controles de seguridad)

2. **Security Controls - Authentication:**
   - Passwords (bcrypt, políticas, rate limiting)
   - MFA (TOTP, SMS, backup codes)
   - Session management (JWT: access + refresh tokens)
   - Código de empleado (passwordless, expiración 90 días)

3. **Security Controls - Authorization (RBAC):**
   - Matriz de permisos por rol (Owner, Admin, RRHH, Empleado)
   - Row-level security (RLS)
   - Middleware de autorización

4. **Security Controls - Encryption:**
   - At rest (AES-256 para respuestas, backups encriptados)
   - In transit (HTTPS, TLS 1.3, HSTS)
   - Key management (AWS KMS, rotación cada 6 meses)

5. **Multi-Tenancy Isolation:**
   - Evaluar estrategias (DB per tenant, schema per tenant, row-level)
   - Recomendar row-level isolation con RLS
   - Testing exhaustivo de aislamiento

6. **Input Validation:**
   - Prevenir SQL injection, XSS, CSRF, Command injection
   - Usar prepared statements, sanitización, anti-CSRF tokens

7. **Rate Limiting:**
   - Por endpoint (login: 5 req/15 min, API: 100 req/min)
   - Implementación con Redis

8. **Logging & Monitoring:**
   - Audit logs (login, accesos, exportaciones, cambios de permisos)
   - Security monitoring (intentos fallidos, IPs sospechosas)
   - Retention (audit logs: 1 año, security logs: 90 días)

9. **GDPR Compliance:**
   - Right to access (export de datos)
   - Right to deletion (soft delete, anonymización)
   - Data portability (JSON/CSV)
   - Consent management
   - Data retention policy
   - DPA (Data Processing Agreement)
   - Privacy by design

10. **CCPA Compliance:**
    - Right to know, delete, opt-out
    - "Do Not Sell" enlace en footer

11. **Incident Response Plan:**
    - Detección → Contención → Erradicación → Recuperación → Notificación → Post-mortem
    - Equipo y responsabilidades

12. **Penetration Testing:**
    - Pre-production: internal pen test
    - Post-launch: external pen test cada 6 meses
    - Bug bounty (opcional, futuro)

13. **Vulnerability Management:**
    - Dependency scanning (Dependabot, Snyk)
    - Code scanning (SonarQube, CodeQL)
    - Infrastructure scanning (AWS Inspector)
    - Disclosure policy

14. **Documentación:**
    - Security checklist pre-launch
    - Roadmap MVP → SOC 2 Type II

## 4. Herramientas y Librerías

### Security Stack
- **Authentication:**
  - bcrypt o argon2id (password hashing)
  - jsonwebtoken (JWT)
  - speakeasy (TOTP para MFA)
- **Input Validation:**
  - joi, zod, class-validator
  - DOMPurify (sanitización)
- **Rate Limiting:**
  - express-rate-limit
  - Redis (almacenar contadores)
- **Encryption:**
  - crypto (Node.js native)
  - AWS KMS, GCP KMS (key management)
- **Monitoring:**
  - Sentry (errores)
  - DataDog, Prometheus + Grafana (métricas)
  - CloudWatch Alarms
- **Vulnerability Scanning:**
  - Dependabot, Snyk, npm audit
  - SonarQube, CodeQL, Semgrep
  - Burp Suite, OWASP ZAP (pen testing)

### Compliance
- **GDPR:** Herramientas de export/delete de datos
- **Audit Logging:** Winston, Pino (Node.js logging)

## 5. Restricciones y Casos Borde (Edge Cases)

### Restricciones de Compliance
- **GDPR:** Notificar breach en 72 horas a autoridad
- **Data retention:** Evaluaciones: 2 años, Audit logs: 1 año, Backups: 30 días
- **Multi-tenancy:** Empresas NO deben ver datos de otras (critical)
- **Privacidad interna:** Líderes NO ven respuestas individuales crudas

### Casos Borde
- **Password forgotten:** Reset flow seguro (token temporal, expiración)
- **Account lockout:** Temporal (no permanente), después de 5 intentos fallidos
- **MFA device lost:** Backup codes o contacto con soporte
- **Data breach:** Proceso completo de incident response
- **Multi-tenancy leak:** Bug que expone datos de otra org → alerta crítica
- **GDPR deletion request:** Soft delete + anonymización (no borrado total si afecta analytics)
- **SOC 2 audit:** Preparación completa (documentación, logs, políticas)

### Riesgos Críticos
- **Datos altamente sensibles:** Evaluaciones = casi datos de salud mental
- **Uso indebido:** Discriminación laboral, despidos basados en perfil
- **Insider threat:** Admin/dev con acceso a DB puede ver datos sensibles

## 6. Protocolo de Errores y Aprendizajes (Memoria Viva)

| Fecha | Error Detectado | Causa Raíz | Solución/Parche Aplicado |
|-------|-----------------|------------|--------------------------|
| 10/02 | N/A - Directiva inicial | Setup | Establecer estructura base |

> **Nota de Implementación:** Tras incidentes de seguridad, documentar aquí para evitar regresiones.

## 7. Ejemplos de Uso

### Ejecución del script de documentación
```bash
# Generar documento de seguridad completo
python scripts/eneadisc_security_compliance_architect.py --output-dir ./docs --format markdown

# Generar security checklist
python scripts/eneadisc_security_compliance_architect.py --checklist-only

# Validar compliance (GDPR, CCPA)
python scripts/eneadisc_security_compliance_architect.py --validate-compliance
```

### Output esperado
```
✅ Documento generado: docs/eneadisc_security_compliance_complete.md
🔒 Threat model: 6 amenazas identificadas + mitigaciones
🛡️ Security controls: Auth, Authorization, Encryption
📋 Compliance: GDPR (7 puntos), CCPA
✔️ Security checklist: 25 items
```

## 8. Checklist de Pre-Ejecución
- [ ] Prompt completo del usuario disponible
- [ ] Contexto de ENEADISC comprendido (datos sensibles, multi-tenancy)
- [ ] Referencias de compliance (GDPR, CCPA)
- [ ] Acceso a ejemplos de audit logs, threat models

## 9. Checklist Post-Ejecución
- [ ] Documento markdown generado con 10 secciones
- [ ] Threat model completo (amenazas + impacto + mitigación)
- [ ] Security controls documentados (auth, encryption, logging)
- [ ] GDPR compliance (7 puntos clave)
- [ ] Multi-tenancy isolation strategy elegida
- [ ] Incident response plan detallado
- [ ] Penetration testing plan definido
- [ ] Audit logging schema (JSON)
- [ ] Security checklist pre-launch (25+ items)
- [ ] Roadmap de seguridad (MVP → SOC 2)

## 10. Notas Adicionales

### Filosofía de Seguridad
- **Security by design:** No es un "feature", es foundational
- **Defense in depth:** Múltiples capas de seguridad
- **Least privilege:** Usuarios solo ven lo mínimo necesario
- **Zero trust:** Siempre validar, nunca asumir
- **Transparency:** Documentar todo, incident response público

### Referencias Técnicas
- **GDPR:** https://gdpr.eu/
- **CCPA:** https://oag.ca.gov/privacy/ccpa
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **SOC 2:** https://www.aicpa.org/soc
- **NIST Cybersecurity Framework:** https://www.nist.gov/cyberframework

### Consideraciones Éticas
- **Transparencia:** Usuario debe saber qué datos se recopilan y por qué
- **Uso ético:** Clarificar que evaluaciones NO son para despidos
- **Opt-out:** Permitir a empleados rechazar evaluación (implicaciones laborales fuera del sistema)
- **Anonimización:** Analytics agregados no deben permitir re-identificación

### Riesgos de Negocio
- **Data breach:** Daño reputacional catastrófico (startup B2B vive de confianza)
- **GDPR fine:** Hasta €20M o 4% de revenue global
- **Lawsuits:** Empleado despedido alegando discriminación basada en perfil

### Priorización
- **Pre-launch (MVP):** Auth, RBAC, encryption básica, GDPR compliance
- **6 meses:** External pen test, audit logs completos
- **12 meses:** SOC 2 Type II (si hay tracción enterprise)
