🚀 Prototipo real de Envoy

Malla local de microservicios usando Docker Compose

API → Service1 → Proxy Envoy → Service2

⸻

📘 Descripción general

Este proyecto es un prototipo local de malla de microservicios que usa Envoy Proxy para enrutar el tráfico entre dos servicios independientes:
	•	Service1 → API Express que llama a Envoy
	•	Envoy → Proxy inverso que reenvía solicitudes a Service2
	•	Service2 → API backend simple

Esta configuración simula un patrón de service mesh, usado comúnmente en ECS, Kubernetes y arquitecturas de servicio a servicio.
