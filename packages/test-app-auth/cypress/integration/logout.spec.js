/// <reference types="cypress" />

describe('Logout', () => {
  it('should be able to login', () => {
    cy.loginAs({ email: 'ryanto@gmail.com' });
    cy.visit('/');

    cy.get('[data-test=logout]').click();

    cy.get('[data-test=login-form]').should('exist');
  });
});
