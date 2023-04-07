/// <reference types="cypress" />

describe('Create account form', () => {
  it('should be able to create an account and see a pending message', () => {
    cy.visit('/pending-create-account');

    cy.get('[data-test=create-account').should('exist');

    cy.get('[data-test=pending]').should('not.exist');

    cy.get('[data-test=email').type('ryanto@gmail.com');
    cy.get('[data-test=password').type('hello');
    cy.get('[data-test=submit]').click();

    cy.get('[data-test=pending]')
      .contains('Account creation is pending.')
      .should('exist');

    cy.get('[data-test=homepage]')
      .contains('Welcome to the home page!')
      .should('exist');
  });
});
