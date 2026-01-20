# Compilar y publicar Envoy en ECR

Esta carpeta contiene los archivos mínimos necesarios para construir la imagen de Envoy que lee
sus recursos dinámicos desde `/etc/envoy/dynamic` en tiempo de ejecución.

## Compilar y publicar

```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 758208602079.dkr.ecr.us-east-1.amazonaws.com

# Compilar para ECS/Fargate (linux/amd64)
docker buildx build --platform linux/amd64 -t envoy:latest -f Dockerfile . --load
docker tag envoy:latest 758208602079.dkr.ecr.us-east-1.amazonaws.com/envoy:latest
docker push 758208602079.dkr.ecr.us-east-1.amazonaws.com/envoy:latest
```

Si el repositorio aún no existe:

```bash
aws ecr create-repository --repository-name envoy --region us-east-1
```

## Bucket S3 y sincronización

Crea el bucket y sincroniza tus archivos de configuración dinámica:

```bash
aws s3 mb s3://envoy-file-config --region us-east-1
aws s3 sync ../ s3://envoy-file-config/ --exclude "*" --include "lds.yaml" --include "cds.yaml" --include "eds.yaml" --include "rds.yaml"
```

## Resumen de CloudFormation

`cloudformation.yaml` despliega un servicio ECS Fargate con dos contenedores:
- `envoy` (usa la imagen de ECR) y espera a que existan `cds.yaml`/`lds.yaml`.
- `s3-sync` (aws-cli) sincroniza continuamente la config desde S3 al volumen compartido.

También crea:
- log group en CloudWatch (`/ecs/envoy`)
- roles IAM para ejecución y tarea (con permiso de lectura a S3)

El bucket S3 se crea por separado en `bucket.yaml`.

![Envoy dynamic config diagram](diagram.png)
