# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions CI/CD pipeline for automated testing and linting on pull requests
- Comprehensive unit test suite using Jest and Supertest
- ESLint configuration for code quality and consistency
- Test coverage reporting with Codecov integration
- Multi-Node.js version testing (14.x, 16.x, 18.x)
- MySQL service integration in CI pipeline for database testing

### Changed
- Updated package.json with new scripts for testing, linting, and development
- Enhanced project structure to support testing and CI/CD workflows

### Technical Details
- Added automated testing on pull requests to master/main branches
- Configured ESLint with recommended rules for Node.js projects
- Set up Jest testing framework with coverage collection
- Integrated Supertest for API endpoint testing
- Added MySQL 5.7 service container for CI testing
- Implemented comprehensive test suite covering all CRUD operations