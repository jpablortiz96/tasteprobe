# GATE 2E.1 — AT_RISK / 2026-10-30

## Causa observada

El operador reprodujo POST `http://127.0.0.1:3000/api/entities/search` desde Chrome. La aplicación devolvió HTTP 502, NETWORK_ERROR, capa qloo-transport, Reason NETWORK. Con los nuevos diagnósticos el segundo intento mostró `ENOTFOUND`, upstreamAttempted=true, upstreamStatus=null y request ID `f29f868c-4e4c-4ce8-8de1-dcb3dfae7dde`. Es un fallo de resolución DNS en el transporte backend → Qloo, antes de recibir HTTP del proveedor. No es rechazo de contrato del frontend ni FORBIDDEN_ORIGIN. Origin/Host exactos de Chrome no se capturaron en la reproducción del operador; no se infieren a partir de la prueba HTTP.

Dentro del sandbox, dns.lookup del host oficial falló ENOTFOUND; fuera resolvió tres IPv4. Esto respalda una restricción del entorno, pero no demuestra de forma concluyente el origen del fallo histórico/intermitente del proceso. Una solicitud HTTP local previa había devuelto Search 200/200. No se atribuye esa divergencia a hot reload, caché o caída de Qloo sin evidencia adicional.

## Cambios y recuperación

Se conservan exclusivamente códigos de transporte conocidos, HTTP upstream, intento upstream y request ID. Se descartan mensajes, URLs, encabezados y stacks arbitrarios. El frontend presenta esos datos en su panel avanzado, conservando mensajes sencillos. No se cambiaron los parámetros REST, timeout, CSRF, firma ni validadores de resultados. Ninguna nueva dependencia ni retry.

La instancia dev identificada por el listener 3000 (PID 25880, padre Next dev 23124) se cerró tras verificar ambos PID. Arrancó la compilación local de producción fuera del sandbox, con `.env.local`, en 127.0.0.1:3000. Después: health 200/configured, origen malicioso 403 sin upstream, /review 404 en producción. NO se consultó Qloo después del reinicio. Recuperación DNS del nuevo servidor todavía no aceptada LIVE.

## Presupuesto y aceptación

Dos intentos consumidos: Search HTTP local 200/Qloo 200, y Search de Chrome 502/ENOTFOUND. Se detuvieron las llamadas al segundo error. No se probaron Discover/Insights ni Audit LIVE en este gate. Tampoco Rescue ni descargas desde Chrome. Quedan cinco intentos sin consumir, sujetos a reanudación controlada tras el error. Ver `gate2e-live.json`.

El navegador integrado informa `browser access host is unavailable`. No hay BROWSER_PASS, capturas nuevas ni aceptación desktop/mobile. Los fixtures de integración se identifican como MOCK y no sustituyen LIVE.

## Validación offline

La regresión inicial falló 2/2 antes de añadir diagnósticos (`gate2e-regression-before.txt`); los mismos dos casos pasaron después (`gate2e-regression-after.txt`). Se agregó además distinción de transporte navegador/backend y redacción de campos arbitrarios. Suite final: 82/82; typecheck y build aprobados; E2E HTTP MOCK 5/5. Se conservan los 79 tests anteriores; la aserción de auth del E2E original se amplió para comprobar los nuevos campos sin eliminar las comprobaciones previas. npm audit: cero vulnerabilidades, ejecutado fuera del sandbox después del fallo de acceso al registro. Escaneo exacto de la clave y marcadores servidor/test: 27 archivos cliente sin hallazgos. `.env.local` y el archivo privado de Search permanecen ignorados por Git.

No push, deploy, repositorio remoto ni commit. Los cambios previos de otros gates permanecen pendientes.

## Continuación

Ver `docs/GATE2E_OPERATOR_ACCEPTANCE.md`. Primero autorizar/reanudar una sola búsqueda desde Chrome en el servidor limpio. Detenerse ante nuevo fallo. Si funciona, confirmar Arrival (2016) y priorizar Discover. El flujo actual no comparte favoritos entre modos; no asumir que cinco intentos restantes alcanzan para repetir ambas experiencias completas tras los dos intentos consumidos. Coordinar el presupuesto antes de Audit.
