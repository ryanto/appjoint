/// <reference types="cypress" />

describe('Create account page', () => {
  it('should be able to create an account', () => {
    cy.visit('/create-account');

    cy.get('[data-test=email').type('ryanto@gmail.com');
    cy.get('[data-test=password').type('hello');
    cy.get('[data-test=submit]').click();

    cy.get('[data-test=homepage]')
      .contains('Welcome to the home page!')
      .should('exist');
  });

  it('should throw an error if the create account fails', () => {
    cy.addUser({ email: 'ryanto@gmail.com', password: 'hello' });

    cy.visit('/create-account');

    cy.get('[data-test=email').type('ryanto@gmail.com');
    cy.get('[data-test=password').type('badpassword');
    cy.get('[data-test=submit]').click();

    cy.on('uncaught:exception', err => {
      expect(err.message).to.include(
        'Could not create test user account for ryanto@gmail.com because an account with that email already exists.'
      );
      return false;
    });
  });
});
