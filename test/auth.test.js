const { expect } = require('chai');
const {
    validateCredentials,
    authenticateUser,
    generateToken,
    parseAuthHeader
} = require('../lib/auth');

describe('Auth Module - Null Input Validation', () => {
    
    describe('validateCredentials', () => {
        it('should throw error when credentials is null', () => {
            expect(() => validateCredentials(null))
                .to.throw('Invalid input: credentials cannot be null or undefined');
        });

        it('should throw error when credentials is undefined', () => {
            expect(() => validateCredentials(undefined))
                .to.throw('Invalid input: credentials cannot be null or undefined');
        });

        it('should return false for empty credentials object', () => {
            const result = validateCredentials({});
            expect(result).to.be.false;
        });

        it('should return false when username is missing', () => {
            const result = validateCredentials({ password: 'test123' });
            expect(result).to.be.false;
        });

        it('should return false when password is missing', () => {
            const result = validateCredentials({ username: 'testuser' });
            expect(result).to.be.false;
        });

        it('should return true for valid credentials', () => {
            const result = validateCredentials({ 
                username: 'testuser', 
                password: 'test123' 
            });
            expect(result).to.be.true;
        });

        it('should return false for empty username', () => {
            const result = validateCredentials({ 
                username: '', 
                password: 'test123' 
            });
            expect(result).to.be.false;
        });

        it('should return false for empty password', () => {
            const result = validateCredentials({ 
                username: 'testuser', 
                password: '' 
            });
            expect(result).to.be.false;
        });
    });

    describe('authenticateUser', () => {
        it('should throw error when user is null', () => {
            expect(() => authenticateUser(null))
                .to.throw('Invalid input: user cannot be null or undefined');
        });

        it('should throw error when user is undefined', () => {
            expect(() => authenticateUser(undefined))
                .to.throw('Invalid input: user cannot be null or undefined');
        });

        it('should return unsuccessful auth for user without id', () => {
            const result = authenticateUser({});
            expect(result.success).to.be.false;
            expect(result.token).to.be.null;
        });

        it('should return successful auth for user with id', () => {
            const result = authenticateUser({ id: 'user123' });
            expect(result.success).to.be.true;
            expect(result.token).to.be.a('string');
            expect(result.token).to.include('token_user123_');
        });

        it('should return unsuccessful auth for user with falsy id', () => {
            const result = authenticateUser({ id: '' });
            expect(result.success).to.be.false;
            expect(result.token).to.be.null;
        });
    });

    describe('generateToken', () => {
        it('should throw error when userId is null', () => {
            expect(() => generateToken(null))
                .to.throw('Invalid input: userId cannot be null or undefined');
        });

        it('should throw error when userId is undefined', () => {
            expect(() => generateToken(undefined))
                .to.throw('Invalid input: userId cannot be null or undefined');
        });

        it('should generate token for valid userId', () => {
            const token = generateToken('user123');
            expect(token).to.be.a('string');
            expect(token).to.include('token_user123_');
            expect(token).to.match(/^token_user123_\d+$/);
        });

        it('should generate different tokens for same userId', (done) => {
            const token1 = generateToken('user123');
            setTimeout(() => {
                const token2 = generateToken('user123');
                expect(token1).to.not.equal(token2);
                done();
            }, 1);
        });
    });

    describe('parseAuthHeader', () => {
        it('should throw error when authHeader is null', () => {
            expect(() => parseAuthHeader(null))
                .to.throw('Invalid input: authHeader cannot be null or undefined');
        });

        it('should throw error when authHeader is undefined', () => {
            expect(() => parseAuthHeader(undefined))
                .to.throw('Invalid input: authHeader cannot be null or undefined');
        });

        it('should parse valid authorization header', () => {
            const result = parseAuthHeader('Bearer token123');
            expect(result.type).to.equal('Bearer');
            expect(result.token).to.equal('token123');
        });

        it('should handle single part header', () => {
            const result = parseAuthHeader('token123');
            expect(result.type).to.equal('token123');
            expect(result.token).to.be.undefined;
        });

        it('should handle empty string', () => {
            const result = parseAuthHeader('');
            expect(result.type).to.equal('');
            expect(result.token).to.be.undefined;
        });

        it('should handle multiple spaces', () => {
            const result = parseAuthHeader('Bearer token123 extra');
            expect(result.type).to.equal('Bearer');
            expect(result.token).to.equal('token123');
        });
    });
});

describe('Auth Module - Integration Tests', () => {
    it('should handle complete authentication flow', () => {
        // Validate credentials
        const isValid = validateCredentials({ username: 'testuser', password: 'test123' });
        expect(isValid).to.be.true;

        // Authenticate user
        const authResult = authenticateUser({ id: 'user123' });
        expect(authResult.success).to.be.true;
        expect(authResult.token).to.be.a('string');

        // Parse auth header
        const parsed = parseAuthHeader(`Bearer ${authResult.token}`);
        expect(parsed.type).to.equal('Bearer');
        expect(parsed.token).to.equal(authResult.token);
    });

    it('should handle failed authentication flow', () => {
        // Invalid credentials
        const isValid = validateCredentials({ username: '', password: 'test123' });
        expect(isValid).to.be.false;

        // User without id
        const authResult = authenticateUser({ name: 'testuser' });
        expect(authResult.success).to.be.false;
        expect(authResult.token).to.be.null;
    });
});