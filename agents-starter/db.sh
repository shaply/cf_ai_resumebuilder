#!/bin/bash

# Database setup script for Resume Builder
# This script helps manage local development database

echo "🗄️  Resume Builder Database Setup"
echo "================================="

# Check if wrangler is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js first"
    exit 1
fi

# Test if wrangler is available via npx
if ! npx wrangler --version &> /dev/null; then
    echo "❌ Wrangler not found. Please install it first:"
    echo "   npm install -g wrangler"
    echo "   or ensure it's in your project dependencies"
    exit 1
fi

echo ""
echo "📋 Available commands:"
echo "1. setup-local    - Initialize local database with schema and seed data"
echo "2. reset-local    - Reset local database (clear all data and re-setup)"
echo "3. schema-local   - Apply schema to local database only"
echo "4. seed-local     - Add seed data to local database"
echo "5. schema-cloud   - Apply schema to cloud database (PRODUCTION)"
echo "6. info          - Show database information"
echo ""

# Get command from user or use first argument
if [ $# -eq 0 ]; then
    echo -n "Enter command (1-6): "
    read choice
else
    choice=$1
fi

case $choice in
    1|setup-local)
        echo "🚀 Setting up local database with schema and seed data..."
        echo ""
        echo "📝 Applying schema..."
        npx wrangler d1 execute DB --local --file=./schema.sql
        echo ""
        echo "🌱 Adding seed data..."
        npx wrangler d1 execute DB --local --file=./seed.sql
        echo ""
        echo "✅ Local database setup complete!"
        echo "   You can now run 'npm run dev' to test with sample data"
        ;;
    
    2|reset-local)
        echo "🔄 Resetting local database..."
        echo ""
        echo "⚠️  This will delete all local data. Continue? (y/N)"
        read -n 1 confirm
        echo ""
        if [[ $confirm == [yY] ]]; then
            echo "📝 Applying fresh schema..."
            npx wrangler d1 execute DB --local --file=./schema.sql
            echo ""
            echo "🌱 Adding seed data..."
            npx wrangler d1 execute DB --local --file=./seed.sql
            echo ""
            echo "✅ Local database reset complete!"
        else
            echo "❌ Reset cancelled"
        fi
        ;;
    
    3|schema-local)
        echo "📝 Applying schema to local database..."
        npx wrangler d1 execute DB --local --file=./schema.sql
        echo "✅ Schema applied to local database"
        ;;
    
    4|seed-local)
        echo "🌱 Adding seed data to local database..."
        npx wrangler d1 execute DB --local --file=./seed.sql
        echo "✅ Seed data added to local database"
        ;;
    
    5|schema-cloud)
        echo "☁️  Applying schema to CLOUD database (PRODUCTION)..."
        echo ""
        echo "⚠️  This affects your production database. Continue? (y/N)"
        read -n 1 confirm
        echo ""
        if [[ $confirm == [yY] ]]; then
            npx wrangler d1 execute DB --file=./schema.sql
            echo "✅ Schema applied to cloud database"
        else
            echo "❌ Cloud schema update cancelled"
        fi
        ;;
    
    6|info)
        echo "📊 Database Information:"
        echo ""
        echo "🏠 Local Development:"
        echo "   - Database: SQLite file in .wrangler/state/"
        echo "   - Commands: Add --local flag to wrangler commands"
        echo "   - Access: When running 'npm run dev'"
        echo ""
        echo "☁️  Cloud Production:"
        echo "   - Database: Cloudflare D1 (distributed)"
        echo "   - Commands: Standard wrangler commands (no --local)"
        echo "   - Access: When deployed with 'wrangler deploy'"
        echo ""
        echo "📁 Files:"
        echo "   - schema.sql: Database structure"
        echo "   - seed.sql: Sample data for testing"
        echo ""
        echo "🔧 Quick Commands:"
        echo "   - Setup: ./db.sh setup-local"
        echo "   - Reset: ./db.sh reset-local"
        ;;
    
    *)
        echo "❌ Invalid choice. Please select 1-6."
        exit 1
        ;;
esac

echo ""
echo "🎉 Done! Use './db.sh info' for more information."