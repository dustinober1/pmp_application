output "web_acl_id" {
  description = "ID of the WAF Web ACL"
  value       = aws_wafv2_web_acl.main.id
}

output "web_acl_arn" {
  description = "ARN of the WAF Web ACL"
  value       = aws_wafv2_web_acl.main.arn
}

output "allowed_ip_set_arn" {
  description = "ARN of the allowed IP set"
  value       = length(var.allowed_ip_sets) > 0 ? aws_wafv2_ip_set.allowed_ips[0].arn : null
}

output "blocked_ip_set_arn" {
  description = "ARN of the blocked IP set"
  value       = length(var.blocked_ip_sets) > 0 ? aws_wafv2_ip_set.blocked_ips[0].arn : null
}

output "capacity" {
  description = "WAF capacity units used"
  value = (
    1500 # Base capacity
    + (var.enable_managed_rules ? 1500 : 0)
    + (length(var.allowed_ip_sets) > 0 ? 1 : 0)
    + (length(var.blocked_ip_sets) > 0 ? 1 : 0)
    + (var.enable_geo_restriction ? 1 : 0)
  )
}

output "metric_namespace" {
  description = "CloudWatch metric namespace"
  value       = var.metric_namespace
}
