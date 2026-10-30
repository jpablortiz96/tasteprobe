# GATE 2E.1 — operador / Chrome

Estado: AT_RISK. No publicar. Las pruebas HTTP no sustituyen la aceptación del navegador.

## Presupuesto

Máximo autorizado: 7 intentos Qloo, sin reintentos automáticos. El primer Search HTTP consumió 1 y devolvió 200: Arrival (2016), The Arrival (1996). Registro: `evidence/gate2e-live.json`. No se transfirió esa respuesta al navegador ni se afirmó confirmación humana.

El operador ejecutó el intento 2: HTTP local 502, capa qloo-transport, ENOTFOUND, sin HTTP Qloo. Request ID `f29f868c-4e4c-4ce8-8de1-dcb3dfae7dde`. Se detuvo LIVE; quedan cinco intentos sin consumir, pero requieren autorización expresa para reanudar tras el error de transporte. No ejecutar búsquedas en paralelo desde otras ventanas.

El proceso Next dev anterior (PID 23124 / hijo 25880) fue cerrado de forma verificada. Se inició la compilación de producción local fuera del sandbox, con `.env.local`, en el mismo puerto 3000. Su arranque y health no prueban conectividad Qloo. No se realizó otra llamada al proveedor.

## Primera comprobación pendiente

1. Abrir `http://127.0.0.1:3000`. Abrir DevTools → Network, conservar el registro. No compartir encabezados de autenticación, proofs ni la clave.
2. Discover for me → escribir Arrival → Find movie UNA vez.
3. Si devuelve error, detenerse. Compartir únicamente código, capa, HTTP, request ID, Transport y Qloo HTTP del panel de diagnóstico. No pulsar Retry.
4. Si funciona, confirmar Arrival (2016), no The Arrival (1996). Comprobar `1 / 3 CONFIRMED`. Comunicar el resultado antes de continuar.

## Discover, después de confirmar la primera comprobación

Una única acción Discover my movies consume otro intento. Detenerse ante error de transporte, 401, 403, 429 o contrato inesperado. Con éxito: comprobar películas nuevas, ausencia de Arrival y duplicados, títulos/años, Why this movie?, afinidades observadas sin interpretarlas como probabilidades. Descargar Passport y comprobar modo, fecha actual, fuente Qloo, favoritos, resultados y limitaciones; ausencia de proofs/credenciales.

## Audit, pendiente de coordinación del presupuesto

Arrival (2016), candidatos originales Interstellar (2014), Blade Runner 2049 (2017), Her (2013). El flujo actual busca cuatro identidades y ejecuta un Insights: cinco intentos. Cambiar de modo desmonta Discover y no transfiere sus favoritos. No asumir que el navegador reutiliza identidades de la prueba HTTP. Si Discover consume los intentos 2 y 3, quedan cuatro: NO iniciar los cinco intentos de Audit sin resolver esa restricción o ampliar el presupuesto expresamente.

Tras evidencia LIVE suficiente: comparar los tres IDs enviados/recibidos y el orden actual; generar Rescue sobre el resultado verificado, probar Approve y Reject, descargar Passport y comprobar que cada decisión refleja el estado real. No repetir A/B.

## Matriz visual y funcional

| Comprobación | Estado actual |
|---|---|
| Search HTTP auténtico | PASS, un intento, HTTP local/Qloo 200 |
| Search y confirmación en Chrome | FAIL en intento 2: ENOTFOUND; recuperación pendiente de comprobar |
| Discover completo LIVE en Chrome | Pendiente |
| Audit completo LIVE en Chrome | Pendiente; controlar presupuesto |
| Rescue Approve/Reject en Chrome | Pendiente |
| Descargas verificadas desde Chrome | Pendiente |
| Desktop 1440×900 | Pendiente; capturar tras éxito |
| Mobile 390×844 | Pendiente; usar la misma sesión sin relanzar Qloo |
| Consola, Network, foco y overflow | Pendiente |

Para móvil usar la emulación de Chrome sobre los resultados ya recibidos; no repetir las consultas por cambiar el viewport. Guardar capturas sin secretos. El acceso integrado de Codex informó `browser access host is unavailable`; no se declara BROWSER_PASS.
