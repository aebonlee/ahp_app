#!/bin/bash

# Render.com Team Plan Deployment Script
# Usage: ./deploy-render.sh [environment] [service]
# Example: ./deploy-render.sh production backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
SERVICE=${2:-all}
RENDER_API_KEY=${RENDER_API_KEY:-""}

# Validate inputs
if [ -z "$RENDER_API_KEY" ]; then
    echo -e "${RED}Error: RENDER_API_KEY environment variable is not set${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 Starting deployment to Render.com${NC}"
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "Service: ${YELLOW}$SERVICE${NC}"

# Function to deploy a service
deploy_service() {
    local service_name=$1
    echo -e "\n${GREEN}Deploying $service_name...${NC}"
    
    # Trigger deployment via Render API
    curl -X POST "https://api.render.com/v1/services/$service_name/deploys" \
        -H "Authorization: Bearer $RENDER_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"clearCache": false}'
    
    echo -e "${GREEN}✓ Deployment triggered for $service_name${NC}"
}

# Function to check deployment status
check_status() {
    local service_name=$1
    echo -e "\n${YELLOW}Checking deployment status for $service_name...${NC}"
    
    curl -X GET "https://api.render.com/v1/services/$service_name/deploys?limit=1" \
        -H "Authorization: Bearer $RENDER_API_KEY"
}

# Main deployment logic
case "$ENVIRONMENT" in
    production|prod)
        if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "backend" ]; then
            deploy_service "ahp-backend-prod"
        fi
        if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "frontend" ]; then
            deploy_service "ahp-frontend-prod"
        fi
        ;;
        
    staging|stage)
        if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "backend" ]; then
            deploy_service "ahp-backend-staging"
        fi
        if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "frontend" ]; then
            deploy_service "ahp-frontend-staging"
        fi
        ;;
        
    *)
        echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
        echo "Valid environments: production, staging"
        exit 1
        ;;
esac

echo -e "\n${GREEN}🎉 Deployment initiated successfully!${NC}"
echo -e "${YELLOW}Check Render dashboard for deployment progress${NC}"

# Optional: Wait and check status
if [ "$3" = "--wait" ]; then
    echo -e "\n${YELLOW}Waiting for deployment to complete...${NC}"
    sleep 10
    
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "backend" ]; then
        check_status "ahp-backend-$ENVIRONMENT"
    fi
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "frontend" ]; then
        check_status "ahp-frontend-$ENVIRONMENT"
    fi
fi