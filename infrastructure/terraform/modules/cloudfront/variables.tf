variable "environment" {
  type        = string
  description = "Environment name (e.g., prod, staging)"
}

variable "project_name" {
  type        = string
  description = "Project name for resource naming"
  default     = "pmp-application"
}

variable "origin_domain_name" {
  type        = string
  description = "Origin domain name (ALB, EKS, or ECS endpoint)"
}

variable "origin_id" {
  type        = string
  description = "Unique identifier for the origin"
  default     = "pmp-app-origin"
}

variable "alternate_domain_names" {
  type        = list(string)
  description = "Alternate domain names (CNAMEs) for the distribution"
  default     = []
}

variable "acm_certificate_arn" {
  type        = string
  description = "ACM certificate ARN for SSL/TLS"
  default     = ""
}

variable "price_class" {
  type        = string
  description = "Price class for CloudFront (PriceClass_100, PriceClass_200, PriceClass_All)"
  default     = "PriceClass_100"
}

variable "custom_error_responses" {
  type = list(object({
    error_code            = number
    error_caching_min_ttl = number
    response_code         = number
    response_page_path    = string
  }))
  description = "Custom error responses"
  default = [
    {
      error_code            = 403
      error_caching_min_ttl = 10
      response_code         = 200
      response_page_path    = "/index.html"
    },
    {
      error_code            = 404
      error_caching_min_ttl = 10
      response_code         = 200
      response_page_path    = "/index.html"
    }
  ]
}

variable "default_ttl" {
  type        = number
  description = "Default cache TTL in seconds"
  default     = 86400
}

variable "max_ttl" {
  type        = number
  description = "Maximum cache TTL in seconds"
  default     = 31536000
}

variable "min_ttl" {
  type        = number
  description = "Minimum cache TTL in seconds"
  default     = 0
}

variable "compress" {
  type        = bool
  description = "Enable compression"
  default     = true
}

variable "ipv6_enabled" {
  type        = bool
  description = "Enable IPv6"
  default     = true
}

variable "web_acl_id" {
  type        = string
  description = "WAF Web ACL ID to associate"
  default     = ""
}

variable "logging_config" {
  type = object({
    bucket          = string
    prefix          = string
    include_cookies = bool
  })
  description = "S3 logging configuration"
  default = null
}

variable "tags" {
  type        = map(string)
  description = "Resource tags"
  default     = {}
}
