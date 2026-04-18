#!/bin/bash

# Commit Message Validator
# Ensures all commits follow conventional commit format
# Usage: ./scripts/validate-commit.sh "commit message"

COMMIT_MSG=$1

if [ -z "$COMMIT_MSG" ]; then
  echo "❌ Error: Commit message not provided"
  echo "Usage: ./scripts/validate-commit.sh \"commit message\""
  exit 1
fi

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Valid commit types
VALID_TYPES=("feat" "fix" "docs" "style" "refactor" "perf" "test" "chore" "ci" "revert")

# Extract type from commit message
TYPE=$(echo "$COMMIT_MSG" | cut -d':' -f1 | cut -d'(' -f1)

# Check if type is valid
VALID=0
for valid_type in "${VALID_TYPES[@]}"; do
  if [ "$TYPE" = "$valid_type" ]; then
    VALID=1
    break
  fi
done

if [ $VALID -eq 0 ]; then
  echo -e "${RED}❌ Invalid commit type: '$TYPE'${NC}"
  echo ""
  echo "Valid types:"
  for valid_type in "${VALID_TYPES[@]}"; do
    echo "  - $valid_type"
  done
  echo ""
  echo "Example:"
  echo "  ✅ feat: add new feature"
  echo "  ✅ fix: resolve bug"
  echo "  ✅ feat!: breaking change"
  exit 1
fi

# Check if message has content after type
if ! echo "$COMMIT_MSG" | grep -q ": "; then
  echo -e "${RED}❌ Missing colon and space after type${NC}"
  echo ""
  echo "Format: <type>: <subject>"
  echo "Example: feat: add new feature"
  exit 1
fi

# Extract subject
SUBJECT=$(echo "$COMMIT_MSG" | cut -d':' -f2- | sed 's/^ //')

# Check if subject is empty
if [ -z "$SUBJECT" ]; then
  echo -e "${RED}❌ Subject is empty${NC}"
  echo ""
  echo "Format: <type>: <subject>"
  echo "Example: feat: add new feature"
  exit 1
fi

# Check subject length
SUBJECT_LENGTH=${#SUBJECT}
if [ $SUBJECT_LENGTH -gt 72 ]; then
  echo -e "${YELLOW}⚠️  Subject is too long ($SUBJECT_LENGTH chars, max 72)${NC}"
  echo "Subject: $SUBJECT"
fi

# Check if subject starts with lowercase
FIRST_CHAR=$(echo "$SUBJECT" | cut -c1)
if [[ "$FIRST_CHAR" =~ [A-Z] ]]; then
  echo -e "${RED}❌ Subject must start with lowercase${NC}"
  echo "Subject: $SUBJECT"
  exit 1
fi

# Check if subject ends with period
if [[ "$SUBJECT" == *"." ]]; then
  echo -e "${RED}❌ Subject must not end with period${NC}"
  echo "Subject: $SUBJECT"
  exit 1
fi

# Determine version bump
VERSION_BUMP="patch"
if echo "$COMMIT_MSG" | grep -q "!:"; then
  VERSION_BUMP="major"
elif echo "$COMMIT_MSG" | grep -q "^feat"; then
  VERSION_BUMP="minor"
fi

# Success
echo -e "${GREEN}✅ Commit message is valid${NC}"
echo ""
echo "Type: $TYPE"
echo "Subject: $SUBJECT"
echo "Version bump: $VERSION_BUMP"
echo ""
echo "This commit will:"
case $VERSION_BUMP in
  patch)
    echo "  📦 Release a PATCH version (1.0.0 → 1.0.1)"
    ;;
  minor)
    echo "  📦 Release a MINOR version (1.0.0 → 1.1.0)"
    ;;
  major)
    echo "  📦 Release a MAJOR version (1.0.0 → 2.0.0)"
    ;;
esac

exit 0
