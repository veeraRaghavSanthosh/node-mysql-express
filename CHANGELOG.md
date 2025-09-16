# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions CI workflow for automated testing and linting on pull requests
- Comprehensive unit tests for customer controller and model
- Integration tests for server endpoints
- ESLint configuration with standard JavaScript style guide
- Jest testing framework with coverage reporting
- Development dependencies for testing and linting

### Changed
- Updated package.json with test and lint scripts
- Enhanced project structure with dedicated tests directory

### Infrastructure
- Added MySQL service to CI pipeline for database testing
- Configured test coverage reporting with Codecov integration
- Set up multi-node testing (Node.js 16.x, 18.x, 20.x)

## [1.0.0] - Initial Release

### Added
- Node.js Express server with MySQL integration
- Customer CRUD API endpoints
- Database connection and configuration
- Basic middleware implementation