/// <reference types="cypress" />

describe('Create account form', () => {
  it('should be able to create an account', () => {
    cy.visit('/create-account-form');

    cy.get('[data-test=email').type('ryanto@gmail.com');
    cy.get('[data-test=password').type('hello');
    cy.get('[data-test=submit]').click();

    cy.get('[data-test=homepage]')
      .contains('Welcome to the home page!')
      .should('exist');
  });

  it('should show an error if the login fails', () => {
    cy.addUser({ email: 'ryanto@gmail.com', password: 'hello' });
    cy.visit('/create-account-form');

    cy.get('[data-test=email').type('ryanto@gmail.com');
    cy.get('[data-test=password').type('blahblah');
    cy.get('[data-test=submit]').click();

    cy.get('[data-test=error]').contains(
      'Error: Could not create test user account for ryanto@gmail.com because an account with that email already exists.'
    );
  });

  it('should show the home page if the user is already logged in', () => {
    cy.loginAs({ email: 'ryanto@gmail.com' });

    cy.visit('/create-account-form');

    cy.get('[data-test=homepage]')
      .contains('Welcome to the home page!')
      .should('exist');
  });
});
