output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = aws_acm_certificate.main.arn
}

output "certificate_domain" {
  description = "Domain name of the certificate"
  value       = aws_acm_certificate.main.domain_name
}

output "validation_options" {
  description = "Validation options for the certificate"
  value       = aws_acm_certificate.main.domain_validation_options
}

output "validation_records_fqdns" {
  description = "FQDNs of validation records"
  value       = aws_acm_certificate_validation.main.validation_record_fqdns
}
