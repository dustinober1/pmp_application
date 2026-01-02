output "distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.id
}

output "distribution_arn" {
  description = "ARN of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.arn
}

output "domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "hosted_zone_id" {
  description = "Hosted zone ID for route53 alias records"
  value       = aws_cloudfront_distribution.main.hosted_zone_id
}

output "origin_access_control_id" {
  description = "Origin Access Control ID"
  value       = aws_cloudfront_origin_access_control.default.id
}

output "cache_policy_static_assets_id" {
  description = "Cache policy ID for static assets"
  value       = aws_cloudfront_cache_policy.static_assets.id
}

output "cache_policy_api_cache_id" {
  description = "Cache policy ID for API responses"
  value       = aws_cloudfront_cache_policy.api_cache.id
}
