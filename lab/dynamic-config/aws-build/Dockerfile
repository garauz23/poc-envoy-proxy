FROM envoyproxy/envoy:v1.30-latest

WORKDIR /etc/envoy/dynamic
COPY envoy-s3.yaml /etc/envoy/envoy.yaml

CMD ["/usr/local/bin/envoy", "-c", "/etc/envoy/envoy.yaml", "--log-level", "info"]
