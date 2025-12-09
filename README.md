🚀 Envoy Real Prototype

Local Microservices Mesh using Docker Compose

API → Service1 → Envoy Proxy → Service2

⸻

📘 Overview

This project is a local microservice mesh prototype using Envoy Proxy to route traffic between two independent services:
	•	Service1 → Express API calling Envoy
	•	Envoy → Reverse proxy forwarding requests to Service2
	•	Service2 → Simple backend API

This setup simulates a service mesh pattern, commonly used in ECS, Kubernetes, and service-to-service architectures.
