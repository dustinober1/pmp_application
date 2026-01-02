variable "environment" {
  type        = string
  description = "Environment name (e.g., prod, staging)"
}

variable "project_name" {
  type        = string
  description = "Project name for resource naming"
  default     = "pmp-application"
}

variable "scope" {
  type        = string
  description = "Scope for WAF (CLOUDFRONT or REGIONAL)"
  default     = "CLOUDFRONT"
}

variable "rate_limit" {
  type        = number
  description = "Rate limit per IP per 5 minutes"
  default     = 10000
}

variable "enable_logging" {
  type        = bool
  description = "Enable WAF logging to S3"
  default     = true
}

variable "log_destination_bucket" {
  type        = string
  description = "S3 bucket for WAF logs"
  default     = ""
}

variable "log_prefix" {
  type        = string
  description = "Prefix for WAF logs in S3"
  default     = "waf-logs"
}

variable "allowed_ip_sets" {
  type        = list(string)
  description = "List of allowed IP addresses/CIDRs"
  default     = []
}

variable "blocked_ip_sets" {
  type        = list(string)
  description = "List of blocked IP addresses/CIDRs"
  default     = []
}

variable "enable_geo_restriction" {
  type        = bool
  description = "Enable geographic restrictions"
  default     = false
}

variable "allowed_countries" {
  type        = list(string)
  description = "List of allowed country codes (ISO 3166-1 alpha-2)"
  default     = []
}

variable "blocked_countries" {
  type        = list(string)
  description = "List of blocked country codes (ISO 3166-1 alpha-2)"
  default     = []
}

variable "enable_managed_rules" {
  type        = bool
  description = "Enable AWS managed rules"
  default     = true
}

variable "metric_namespace" {
  type        = string
  description = "CloudWatch metric namespace"
  default     = "WAF"
}

variable "tags" {
  type        = map(string)
  description = "Resource tags"
  default     = {}
}
