variable "environment" {
  type = string
}

variable "cluster_name" {
  type = string
}

# Install Prometheus via Helm
resource "helm_release" "prometheus" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = "monitoring"
  create_namespace = true

  set {
    name  = "grafana.enabled"
    value = "true"
  }

  set {
    name  = "prometheus.prometheusSpec.retention"
    value = "30d"
  }

  values = [
    yamlencode({
      grafana = {
        adminPassword = "admin" # Change this in production via secrets
      }
    })
  ]
}

# Install Fluent Bit for logging
resource "helm_release" "fluent_bit" {
  name       = "fluent-bit"
  repository = "https://fluent.github.io/helm-charts"
  chart      = "fluent-bit"
  namespace  = "logging"
  create_namespace = true

  set {
    name  = "config.service"
    value = "[SERVICE]\n    Flush 1\n    Daemon Off\n    Log_Level info\n    Parsers_File parsers.conf\n    HTTP_Server On\n    HTTP_Listen 0.0.0.0\n    HTTP_Port 2020"
  }
}