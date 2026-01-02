locals {
  cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
  origin_policy_id = "b689b0a8-53bd-418b-bb78-76906fd448e0" # CORS-S3Origin

  static_path_pattern = "_next/static/*"
  images_path_pattern = "images/*"
  api_path_pattern    = "api/*"
}

resource "aws_cloudfront_cache_policy" "static_assets" {
  name        = "${var.project_name}-static-assets-${var.environment}"
  comment     = "Cache policy for static assets with long TTL"
  default_ttl = var.max_ttl
  max_ttl     = var.max_ttl
  min_ttl     = 86400

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }

    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

resource "aws_cloudfront_cache_policy" "api_cache" {
  name        = "${var.project_name}-api-cache-${var.environment}"
  comment     = "Cache policy for API responses with short TTL"
  default_ttl = 60
  max_ttl     = 300
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["Authorization", "Content-Type"]
      }
    }

    query_strings_config {
      query_string_behavior = "all"
    }

    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

resource "aws_cloudfront_origin_access_control" "default" {
  name                              = "${var.project_name}-oac-${var.environment}"
  description                       = "Origin Access Control for ${var.project_name}"
  origin_access_control_origin_type = "application-load-balancer" # or "s3" for S3 origins
  signing_behavior                  = "never"
  signing_protocol                  = "https"
}

resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = var.ipv6_enabled
  price_class         = var.price_class
  http_version        = "http2and3"
  comment             = "${var.project_name} ${var.environment} distribution"
  retain_on_delete    = false
  wait_for_deployment = false

  logging_config {
    include_cookies = var.logging_config != null ? var.logging_config.include_cookies : false
    bucket          = var.logging_config != null ? var.logging_config.bucket : ""
    prefix          = var.logging_config != null ? var.logging_config.prefix : "${var.project_name}-${var.environment}/"
  }

  origin {
    domain_name              = var.origin_domain_name
    origin_id                = var.origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.default.id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2", "TLSv1.3"]
    }

    origin_shield {
      enabled              = false
      origin_shield_region = "us-east-1"
    }
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = var.origin_id

    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
      headers = ["Authorization", "CloudFront-Forwarded-Proto", "Host"]
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = var.min_ttl
    default_ttl            = var.default_ttl
    max_ttl                = var.max_ttl
    compress               = var.compress

    cache_policy_id = aws_cloudfront_cache_policy.api_cache.id
  }

  # Cache behavior for Next.js static assets
  ordered_cache_behavior {
    path_pattern           = local.static_path_pattern
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = var.origin_id
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl                = 86400
    default_ttl            = var.max_ttl
    max_ttl                = var.max_ttl
    cache_policy_id        = aws_cloudfront_cache_policy.static_assets.id
  }

  # Cache behavior for images
  ordered_cache_behavior {
    path_pattern           = local.images_path_pattern
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = var.origin_id
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl                = 86400
    default_ttl            = var.max_ttl
    max_ttl                = var.max_ttl
    cache_policy_id        = aws_cloudfront_cache_policy.static_assets.id
  }

  dynamic "custom_error_response" {
    for_each = var.custom_error_responses
    content {
      error_code            = custom_error_response.value.error_code
      error_caching_min_ttl = custom_error_response.value.error_caching_min_ttl
      response_code         = custom_error_response.value.response_code
      response_page_path    = custom_error_response.value.response_page_path
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn != "" ? var.acm_certificate_arn : null
    ssl_support_method       = var.acm_certificate_arn != "" ? "sni-only" : null
    minimum_protocol_version = "TLSv1.2_2021"
    cloudfront_default_certificate = var.acm_certificate_arn == "" ? true : false
  }

  restrictions {
    geo_restriction {
      type        = "none"
      restriction_type = "none"
    }
  }

  web_acl_id = var.web_acl_id

  tags = merge(
    {
      Name        = "${var.project_name}-${var.environment}"
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    },
    var.tags
  )
}

# Lambda@Edge function for cache invalidation (optional)
resource "aws_cloudfront_function" "security_headers" {
  name    = "${var.project_name}-security-headers-${var.environment}"
  runtime = "cloudfront-js-1.0"
  comment = "Add security headers to responses"
  publish = true
  code    = file("${path.module}/lambda/security-headers.js")
}

resource "aws_cloudfront_function" "cors_headers" {
  name    = "${var.project_name}-cors-headers-${var.environment}"
  runtime = "cloudfront-js-1.0"
  comment = "Add CORS headers for API responses"
  publish = true
  code    = file("${path.module}/lambda/cors-headers.js")
}
