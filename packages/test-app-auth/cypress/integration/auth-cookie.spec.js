/// <reference types="cypress" />

describe.skip('Auth cookie', () => {
  it('should not be able to fetch data without a session cookie', () => {
    cy.loginAs({ email: 'ryanto@gmail.com', uid: '123' });
    cy.visit('/auth-cookie');

    cy.get('[data-test=message]')
      .contains("You don't have server side access!")
      .should('exist');
  });

  it('should be able to request a session cookie and fetch data', () => {
    cy.loginAs({ email: 'ryanto@gmail.com', uid: '123' });
    cy.visit('/auth-cookie');

    cy.get('[data-test=request-auth-cookie]').click();

    cy.get('[data-test=message]')
      .contains('You have server side access!')
      .should('exist');
  });

  it('requesting a session cookie should set an actual cookie', () => {
    cy.loginAs({ email: 'ryanto@gmail.com', uid: '123' });
    cy.visit('/auth-cookie');

    cy.get('[data-test=request-auth-cookie]').click();

    cy.get('[data-test=cookie-name]')
      .contains('appJointUser-test-app-auth')
      .should('exist');

    cy.get('[data-test=cookie-value]')
      .contains('test-signature')
      .should('exist');
  });
});
