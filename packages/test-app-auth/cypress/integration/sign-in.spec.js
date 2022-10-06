/// <reference types="cypress" />

describe('Sign in page', () => {
  it('should be able to login', () => {
    cy.addUser({ email: 'ryanto@gmail.com', password: 'hello' });
    cy.visit('/sign-in');

    cy.get('[data-test=email').type('ryanto@gmail.com');
    cy.get('[data-test=password').type('hello');
    cy.get('[data-test=submit]').click();

    cy.get('[data-test=homepage]')
      .contains('Welcome to the home page!')
      .should('exist');

    cy.get('[data-test=email]')
      .contains('ryanto@gmail.com')
      .should('exist');
    cy.get('[data-test=uid]').should('not.be.empty');
  });

  it('should throw an error if the login fails', () => {
    cy.addUser({ email: 'ryanto@gmail.com', password: 'hello' });
    cy.visit('/sign-in');

    cy.get('[data-test=email').type('ryanto@gmail.com');
    cy.get('[data-test=password').type('badpassword');
    cy.get('[data-test=submit]').click();

    cy.on('uncaught:exception', err => {
      expect(err.message).to.include(
        'Could not find test user account for ryanto@gmail.com with password badpassword.'
      );
      return false;
    });
  });

  it('should fire the before:setUser event when a user signs in', () => {
    cy.addUser({ email: 'ryanto@gmail.com', password: 'hello' });
    cy.visit('/sign-in');

    cy.get('[data-test=email').type('ryanto@gmail.com');
    cy.get('[data-test=password').type('hello');
    cy.get('[data-test=submit]').click();

    // _app is setup to mutate window.beforeSetUser right before it sets the app's user
    cy.window()
      .its('beforeSetUser')
      .should('exist');

    cy.window()
      .its('beforeSetUser.user.email')
      .should('equal', 'ryanto@gmail.com');
  });
});
