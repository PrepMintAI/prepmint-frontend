#!/bin/bash

# ============================================================================
# PrepMint Firestore Security Rules Deployment Script
# ============================================================================
# This script deploys Firestore security rules to Firebase
# Usage: ./deploy-firestore-rules.sh [--test|--production]
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

print_success "Firebase CLI found"

# Parse command line arguments
ENVIRONMENT=${1:-test}

print_header "PrepMint Firestore Rules Deployment"
echo "Environment: $ENVIRONMENT"
echo ""

# Validate files exist
if [ ! -f "src/firebase/firestore.rules" ]; then
    print_error "src/firebase/firestore.rules file not found!"
    exit 1
fi
print_success "src/firebase/firestore.rules file found"

if [ ! -f "src/firebase/firestore.indexes.json" ]; then
    print_warning "src/firebase/firestore.indexes.json file not found (optional)"
fi

if [ ! -f "firebase.json" ]; then
    print_error "firebase.json file not found!"
    exit 1
fi
print_success "firebase.json file found"

# Show rules summary
print_header "Security Rules Summary"
echo "Collections secured:"
grep -E "match /(users|institutions|evaluations|tests|subjects|badges|activity|leaderboards|jobQueues|notifications)/" src/firebase/firestore.rules | sed 's/^/  - /'
echo ""

# Ask for confirmation if production
if [ "$ENVIRONMENT" = "production" ]; then
    print_warning "You are about to deploy to PRODUCTION!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_error "Deployment cancelled"
        exit 0
    fi
fi

# Test rules in emulator first
if [ "$ENVIRONMENT" = "test" ]; then
    print_header "Testing Rules in Emulator"

    print_warning "Starting Firebase emulators..."
    echo "This will start the emulator UI at http://localhost:4000"
    echo "Press Ctrl+C to stop the emulators when done testing"
    echo ""

    firebase emulators:start --only firestore
    exit 0
fi

# Deploy to Firebase
print_header "Deploying to Firebase"

# Deploy rules
echo "Deploying Firestore security rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    print_success "Security rules deployed successfully!"
else
    print_error "Failed to deploy security rules"
    exit 1
fi

# Deploy indexes if file exists
if [ -f "src/firebase/firestore.indexes.json" ]; then
    echo ""
    echo "Deploying Firestore indexes..."
    firebase deploy --only firestore:indexes

    if [ $? -eq 0 ]; then
        print_success "Indexes deployed successfully!"
    else
        print_warning "Failed to deploy indexes (may not be critical)"
    fi
fi

# Final summary
print_header "Deployment Complete"
print_success "Firestore security rules are now active!"
echo ""
echo "Next steps:"
echo "1. Test your application to ensure rules work correctly"
echo "2. Monitor Firebase Console → Firestore → Usage for denied requests"
echo "3. Check Firebase Console → Firestore → Rules for rule status"
echo ""
print_warning "IMPORTANT: Ensure custom token claims are set for all users!"
echo "Required claims: role, institutionId (optional), email"
echo ""
echo "Example backend code to set claims:"
echo "  await admin.auth().setCustomUserClaims(uid, {"
echo "    role: 'student',"
echo "    institutionId: 'inst123',"
echo "    email: 'user@example.com'"
echo "  });"
echo ""
