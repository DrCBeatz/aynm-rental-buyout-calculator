# Data resource to retrieve the Route 53 hosted zone for the domain
data "aws_route53_zone" "zone" {
  name = "aynm-rental-buyout-calculator.com"
}

# Define the main S3 bucket for the root domain with website configuration
resource "aws_s3_bucket" "aynm_rental_buyout_calculator" {
  bucket = "aynm-rental-buyout-calculator"

  lifecycle {
    prevent_destroy = true
  }
}

# Website configuration for root domain bucket
resource "aws_s3_bucket_website_configuration" "aynm_rental_buyout_calculator_website" {
  bucket = aws_s3_bucket.aynm_rental_buyout_calculator.id
  
  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

# Define the S3 bucket for www redirect with website configuration
resource "aws_s3_bucket" "www_redirect" {
  bucket = "www.aynm-rental-buyout-calculator.com"

  lifecycle {
    prevent_destroy = true
  }
}

# Website configuration for www bucket to redirect to root domain
resource "aws_s3_bucket_website_configuration" "www_redirect_website" {
  bucket = aws_s3_bucket.www_redirect.id
  
  redirect_all_requests_to {
    host_name = "aynm-rental-buyout-calculator.com"
    protocol  = "https"
  }
}

# ACM SSL Certificate in us-east-1 for CloudFront compatibility
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

resource "aws_acm_certificate" "cert" {
  provider                 = aws.us_east_1
  domain_name              = "aynm-rental-buyout-calculator.com"
  subject_alternative_names = ["www.aynm-rental-buyout-calculator.com"]
  validation_method        = "DNS"

  lifecycle {
    prevent_destroy = true
  }
}

# Define CloudFront distribution for S3 website
resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = "aynm-rental-buyout-calculator.s3-website.us-east-2.amazonaws.com"  # Replace with correct region endpoint
    origin_id   = "S3-AYNM-Buyout-Calculator"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = [
    "aynm-rental-buyout-calculator.com",
    "www.aynm-rental-buyout-calculator.com",
  ]

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate.cert.arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2019"
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-AYNM-Buyout-Calculator"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}


# Route 53 Record for root domain pointing to CloudFront distribution
resource "aws_route53_record" "root" {
  zone_id = data.aws_route53_zone.zone.id
  name    = "aynm-rental-buyout-calculator.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route 53 Record for www pointing to CloudFront distribution
resource "aws_route53_record" "www_redirect" {
  zone_id = data.aws_route53_zone.zone.id
  name    = "www.aynm-rental-buyout-calculator.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

# SSL Validation records
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = data.aws_route53_zone.zone.id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}
