# IP Sets for whitelisting/blacklisting
resource "aws_wafv2_ip_set" "allowed_ips" {
  count              = length(var.allowed_ip_sets) > 0 ? 1 : 0
  name               = "${var.project_name}-allowed-ips-${var.environment}"
  description        = "Allowed IP addresses for ${var.project_name}"
  scope              = var.scope
  ip_address_version = "IPV4"
  addresses          = var.allowed_ip_sets

  tags = merge(
    {
      Name        = "${var.project_name}-allowed-ips-${var.environment}"
      Environment = var.environment
    },
    var.tags
  )
}

resource "aws_wafv2_ip_set" "blocked_ips" {
  count              = length(var.blocked_ip_sets) > 0 ? 1 : 0
  name               = "${var.project_name}-blocked-ips-${var.environment}"
  description        = "Blocked IP addresses for ${var.project_name}"
  scope              = var.scope
  ip_address_version = "IPV4"
  addresses          = var.blocked_ip_sets

  tags = merge(
    {
      Name        = "${var.project_name}-blocked-ips-${var.environment}"
      Environment = var.environment
    },
    var.tags
  )
}

# Geographic IP Set
resource "aws_wafv2_ip_set" "geo_block" {
  count              = var.enable_geo_restriction ? 1 : 0
  name               = "${var.project_name}-geo-block-${var.environment}"
  description        = "Geographic IP set for ${var.project_name}"
  scope              = var.scope
  ip_address_version = "IPV4"
  addresses          = [] # Populated by AWS Geo match
}

# Web ACL
resource "aws_wafv2_web_acl" "main" {
  name        = "${var.project_name}-waf-${var.environment}"
  description = "Web ACL for ${var.project_name} ${var.environment}"
  scope       = var.scope

  default_action {
    allow {}
  }

  # Rate limiting rule
  rule {
    name     = "${var.project_name}-rate-limit-${var.environment}"
    priority = 1

    override_action {
      none {}
    }

    statement {
      rate_based_statement {
        limit              = var.rate_limit
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "${var.project_name}-rate-limit-${var.environment}"
      sampled_requests_enabled  = true
    }
  }

  # AWS Managed Rules - Core Rule Set
  dynamic "rule" {
    for_each = var.enable_managed_rules ? [1] : []
    content {
      name     = "AWSManagedRulesCommonRuleSet"
      priority = rule.value + 1

      override_action {
        none {}
      }

      statement {
        managed_rule_group_statement {
          name        = "AWSManagedRulesCommonRuleSet"
          vendor_name = "AWS"

          # Exclude specific rules that might cause false positives
          excluded_rule {
            name = "SizeRestrictions_QUERYSTRING"
          }

          excluded_rule {
            name = "SizeRestrictions_BODY"
          }
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name               = "AWSManagedRulesCommonRuleSet"
        sampled_requests_enabled  = true
      }
    }
  }

  # AWS Managed Rules - Known Bad Inputs
  dynamic "rule" {
    for_each = var.enable_managed_rules ? [1] : []
    content {
      name     = "AWSManagedRulesKnownBadInputsRuleSet"
      priority = rule.value + 2

      override_action {
        none {}
      }

      statement {
        managed_rule_group_statement {
          name        = "AWSManagedRulesKnownBadInputsRuleSet"
          vendor_name = "AWS"
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name               = "AWSManagedRulesKnownBadInputsRuleSet"
        sampled_requests_enabled  = true
      }
    }
  }

  # SQL Injection Protection
  dynamic "rule" {
    for_each = var.enable_managed_rules ? [1] : []
    content {
      name     = "AWSManagedRulesSQLiRuleSet"
      priority = rule.value + 3

      override_action {
        none {}
      }

      statement {
        managed_rule_group_statement {
          name        = "AWSManagedRulesSQLiRuleSet"
          vendor_name = "AWS"
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name               = "AWSManagedRulesSQLiRuleSet"
        sampled_requests_enabled  = true
      }
    }
  }

  # XSS Protection
  dynamic "rule" {
    for_each = var.enable_managed_rules ? [1] : []
    content {
      name     = "AWSManagedRulesLinuxRuleSet"
      priority = rule.value + 4

      override_action {
        none {}
      }

      statement {
        managed_rule_group_statement {
          name        = "AWSManagedRulesLinuxRuleSet"
          vendor_name = "AWS"
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name               = "AWSManagedRulesLinuxRuleSet"
        sampled_requests_enabled  = true
      }
    }
  }

  # IP whitelist rule
  dynamic "rule" {
    for_each = length(var.allowed_ip_sets) > 0 ? [1] : []
    content {
      name     = "${var.project_name}-whitelist-${var.environment}"
      priority = 100

      action {
        allow {}
      }

      statement {
        ip_set_reference_statement {
          arn = aws_wafv2_ip_set.allowed_ips[0].arn
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name               = "${var.project_name}-whitelist-${var.environment}"
        sampled_requests_enabled  = true
      }
    }
  }

  # IP blacklist rule
  dynamic "rule" {
    for_each = length(var.blocked_ip_sets) > 0 ? [1] : []
    content {
      name     = "${var.project_name}-blacklist-${var.environment}"
      priority = 101

      action {
        block {}
      }

      statement {
        ip_set_reference_statement {
          arn = aws_wafv2_ip_set.blocked_ips[0].arn
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name               = "${var.project_name}-blacklist-${var.environment}"
        sampled_requests_enabled  = true
      }
    }
  }

  # Geographic restriction rule
  dynamic "rule" {
    for_each = var.enable_geo_restriction && (length(var.allowed_countries) > 0 || length(var.blocked_countries) > 0) ? [1] : []
    content {
      name     = "${var.project_name}-geo-restriction-${var.environment}"
      priority = 102

      action {
        block {}
      }

      statement {
        geo_match_statement {
          dynamic "country_codes" {
            for_each = var.allowed_countries
            content {
              country_codes = var.allowed_countries
            }
          }
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name               = "${var.project_name}-geo-restriction-${var.environment}"
        sampled_requests_enabled  = true
      }
    }
  }

  # Size restriction rule
  rule {
    name     = "${var.project_name}-size-restriction-${var.environment}"
    priority = 200

    override_action {
      none {}
    }

    statement {
      size_constraint_statement {
        comparison_operator = "GT"
        size                = 10485760 # 10MB
        field_to_match {
          body {}
        }
        text_transformation {
          priority = 0
          type     = "NONE"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "${var.project_name}-size-restriction-${var.environment}"
      sampled_requests_enabled  = true
    }
  }

  # Custom rule for API path protection
  rule {
    name     = "${var.project_name}-api-protection-${var.environment}"
    priority = 300

    override_action {
      none {}
    }

    statement {
      and_statement {
        statements {
          byte_match_statement {
            field_to_match {
              uri_path {}
            }
            positional_constraint = "STARTS_WITH"
            search_string         = "/api/"
            text_transformation {
              priority = 0
              type     = "LOWERCASE"
            }
          }
        }

        statements {
          rate_based_statement {
            limit              = 2000 # Stricter limit for API
            aggregate_key_type = "IP"
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "${var.project_name}-api-protection-${var.environment}"
      sampled_requests_enabled  = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name               = "${var.project_name}-waf-${var.environment}"
    sampled_requests_enabled  = true
  }

  tags = merge(
    {
      Name        = "${var.project_name}-waf-${var.environment}"
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    },
    var.tags
  )
}

# WAF Logging Configuration
resource "aws_wafv2_web_acl_logging_configuration" "main" {
  count = var.enable_logging ? 1 : 0

  log_destination_configs = var.log_destination_bucket != "" ? [var.log_destination_bucket] : []
  resource_arn            = aws_wafv2_web_acl.main.arn

  redacted_fields {
    field_to_match {
      single_header {
        name = "authorization"
      }
    }
  }

  redacted_fields {
    field_to_match {
      single_header {
        name = "cookie"
      }
    }
  }

  logging_filter {
    default_behavior = "KEEP"

    filter {
      behavior = "DROP"
      requirement = "MEETS_ALL"

      condition {
        action_condition {
          action = "COUNT"
        }
      }

      condition {
        metric_name_condition {
          metric_name = "${var.project_name}-rate-limit-${var.environment}"
        }
      }
    }
  }
}
