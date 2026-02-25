# bm-build variable management

This folder uses `.env` variables for Envoy listener/cluster addresses and ports.

## Generate runtime config

```bash
cd bm-build
./render-envoy-config.sh
```

Generated files:

- `.rendered/lds.yaml`
- `.rendered/cds.yaml`

`envoy.yaml` is configured to read those generated files.

If you need environment-specific values, create `.env.local` and pass it:

```bash
./render-envoy-config.sh ./.env.local
```
