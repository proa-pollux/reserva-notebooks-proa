# Reserva Notebooks PROA

## Convención para nombrar branches

Cada branch debe estar asociada a un issue. El nombre debe seguir el formato:

```
issue-<número de issue>
```

**Ejemplos:**
- `issue-12`
- `issue-47`
- `issue-103`

### Crear una branch

```bash
git checkout -b issue-<número de issue>
```

Por ejemplo, para trabajar en el issue #42:

```bash
git checkout -b issue-42
```

> Siempre crear la branch a partir de `main` (o la rama base del proyecto) y asegurarse de que esté actualizada antes de comenzar.
