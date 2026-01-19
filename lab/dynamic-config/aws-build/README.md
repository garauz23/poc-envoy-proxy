# Envoy ECR build/push

This folder contains the minimal files needed to build the Envoy image that reads
its dynamic resources from `/etc/envoy/dynamic` at runtime.

## Build and push

```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 758208602079.dkr.ecr.us-east-1.amazonaws.com

# Build for ECS/Fargate (linux/amd64)
docker buildx build --platform linux/amd64 -t envoy:latest -f Dockerfile . --load
docker tag envoy:latest 758208602079.dkr.ecr.us-east-1.amazonaws.com/envoy:latest
docker push 758208602079.dkr.ecr.us-east-1.amazonaws.com/envoy:latest
```

If the repo does not exist yet:

```bash
aws ecr create-repository --repository-name envoy --region us-east-1
```

## S3 bucket and sync

Create the bucket and sync your dynamic config files:

```bash
aws s3 mb s3://envoy-file-config --region us-east-1
aws s3 sync ../ s3://envoy-file-config/ --exclude "*" --include "lds.yaml" --include "cds.yaml" --include "eds.yaml" --include "rds.yaml"
```

## CloudFormation overview

`cloudformation.yaml` despliega un servicio ECS Fargate con dos contenedores:
- `envoy` (usa la imagen de ECR) y espera a que existan `cds.yaml`/`lds.yaml`.
- `s3-sync` (aws-cli) sincroniza continuamente la config desde S3 al volumen compartido.

Tambien crea:
- log group en CloudWatch (`/ecs/envoy`)
- roles IAM para ejecucion y tarea (con permiso de lectura a S3)

El bucket S3 se crea por separado en `bucket.yaml`.

![Envoy dynamic config diagram](diagram.png)
