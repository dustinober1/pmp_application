variable "environment" {
  type        = string
  description = "Environment name (e.g., prod, staging)"
}

variable "project_name" {
  type        = string
  description = "Project name for resource naming"
  default     = "pmp-application"
}

variable "domain_name" {
  type        = string
  description = "Domain name for the certificate"
}

variable "subject_alternative_names" {
  type        = list(string)
  description = "Subject alternative names for the certificate"
  default     = []
}

variable "validation_method" {
  type        = string
  description = "Certificate validation method (DNS or EMAIL)"
  default     = "DNS"

  validation {
    condition     = contains(["DNS", "EMAIL"], var.validation_method)
    error_message = "Validation method must be either DNS or EMAIL."
  }
}

variable "route53_zone_id" {
  type        = string
  description = "Route53 hosted zone ID for DNS validation"
  default     = ""
}

variable "create_route53_records" {
  type        = bool
  description = "Create Route53 validation records"
  default     = true
}

variable "tags" {
  type        = map(string)
  description = "Resource tags"
  default     = {}
}
