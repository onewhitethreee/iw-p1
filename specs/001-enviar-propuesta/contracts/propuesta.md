# Contrato: router `propuesta` (spec-001)

Concreta las filas `propuesta.*` de [000-core/contracts/trpc-api.md](../../000-core/contracts/trpc-api.md). Acceso: rol `PONENTE`.

## `propuesta.enviar` (mutation)

**Entrada** (`propuestaSchema`):

| Campo | Regla | Mensaje |
|-------|-------|---------|
| `congresoId` | string no vacío | — |
| `areaId` | string no vacío | «Elige un área temática» |
| `titulo` | 5–200 caracteres tras recortar | «El título debe tener entre 5 y 200 caracteres» |
| `resumen` | 100–3000 caracteres tras recortar | «El resumen debe tener entre 100 y 3000 caracteres» |

**Salida**: `{ id, estado: "ENVIADA" }`

**Errores**:

| Código | Cuándo | Mensaje |
|--------|--------|---------|
| `UNAUTHORIZED` | sin sesión | «Tienes que iniciar sesión» |
| `FORBIDDEN` | sin rol PONENTE | «No tienes permiso para realizar esta acción» |
| `NOT_FOUND` | congreso inexistente | «Congreso no encontrado» |
| `CONFLICT` | antes del día de apertura | «El plazo de envío de este congreso se abre el {d de mes de aaaa}» |
| `CONFLICT` | desde las 00:00 del día siguiente al cierre | «El plazo de envío de propuestas de este congreso está cerrado» |
| `CONFLICT` | el autor ya tiene en el congreso una propuesta con el mismo título (sin mayúsculas/minúsculas ni espacios extremos; FR-011) | «Ya has enviado una propuesta con este título a este congreso» |
| `BAD_REQUEST` | área de otro congreso | «El área temática no pertenece a este congreso» |
| `BAD_REQUEST` | longitudes no válidas | «Hay datos no válidos en el formulario» (+ errores por campo) |

## `propuesta.mias` (query)

**Entrada**: `{ congresoId?: string }`

**Salida**: lista ordenada por `enviadaEn` descendente de `{ id, titulo, resumen, estado, enviadaEn, area: { nombre }, congreso: { nombre, slug, zonaHoraria } }`. Exactamente esas claves (FR-010).

## Operaciones que **no** existen (clarify P1)

No hay `propuesta.editar` ni `propuesta.retirar`.
