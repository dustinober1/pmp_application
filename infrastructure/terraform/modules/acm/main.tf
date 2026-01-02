# Determine certificate region based on scope
locals {
  # CloudFront uses us-east-1, regional resources use their local region
  certificate_region = "us-east-1"
}

# Request ACM certificate
resource "aws_acm_certificate" "main" {
  provider          = aws.us_east_1
  domain_name       = var.domain_name
  validation_method = var.validation_method

  subject_alternative_names = var.subject_alternative_names

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(
    {
      Name        = "${var.project_name}-certificate-${var.environment}"
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    },
    var.tags
  )
}

# DNS validation records
resource "aws_acm_certificate_validation" "main" {
  provider = aws.us_east_1
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = var.create_route53_records && var.validation_method == "DNS" ? aws_route53_record.validation[*].fqdn : []

  depends_on = [aws_route53_record.validation]
}

# Route53 validation records
resource "aws_route53_record" "validation" {
  count = var.create_route53_records && var.validation_method == "DNS" ? length(distinct(compact(concat([var.domain_name], var.subject_alternative_names)))) : 0

  provider = aws
  zone_id  = var.route53_zone_id
  name     = element(aws_acm_certificate.main.domain_validation_options, count.index).resource_record_name
  type     = element(aws_acm_certificate.main.domain_validation_options, count.index).resource_record_type
  records  = [element(aws_acm_certificate.main.domain_validation_options, count.index).resource_record_value]
  ttl      = 60

  allow_overwrite = true
}
