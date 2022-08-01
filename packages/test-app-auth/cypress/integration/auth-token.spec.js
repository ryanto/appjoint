/// <reference types="cypress" />

describe('Auth token', () => {
  it('the fetcher should use the users auth token', () => {
    cy.loginAs({ email: 'ryanto@gmail.com', id: '123' });
    cy.visit('/auth-token');

    cy.get('[data-test=logged-in]')
      .contains('you are user: 123')
      .should('exist');
  });

  it('the fetcher should not fetch a user if there is not one logged in', () => {
    cy.visit('/auth-token');

    cy.get('[data-test=not-logged-in]').should('exist');
  });
});
