/// <reference types="cypress" />

describe('Login screen that guards app', () => {
  it('should see the login screen when accessing the app', () => {
    cy.visit('/');

    cy.get('[data-test=login-form]').should('exist');
  });

  it('should be able to login', () => {
    cy.addUser({ email: 'ryanto@gmail.com', password: 'hello' });
    cy.visit('/');

    cy.get('[data-test=email').type('ryanto@gmail.com');
    cy.get('[data-test=password').type('hello');
    cy.get('[data-test=submit]').click();

    cy.get('[data-test=homepage]')
      .contains('Welcome to the home page!')
      .should('exist');
  });

  it('should show an error if the login fails', () => {
    cy.addUser({ email: 'ryanto@gmail.com', password: 'hello' });
    cy.visit('/');

    cy.get('[data-test=email').type('ryanto@gmail.com');
    cy.get('[data-test=password').type('badpassword');
    cy.get('[data-test=submit]').click();

    cy.get('[data-test=error]').contains(
      'Error: Could not find test user account for ryanto@gmail.com with password badpassword.'
    );
  });
});
