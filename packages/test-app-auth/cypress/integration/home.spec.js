/// <reference types="cypress" />

describe('Home screen', () => {
  it('should show the home page if the user is logged in', () => {
    cy.loginAs({ email: 'ryanto@gmail.com' });

    cy.visit('/');

    cy.get('[data-test=homepage]')
      .contains('Welcome to the home page!')
      .should('exist');
  });

  it('should get information about the logged in user', () => {
    let _user;
    cy.loginAs({ email: 'me@example.com' }).then(user => {
      _user = user;

      expect(user.email).to.equal('me@example.com');
      expect(user.uid).to.exist;
    });

    cy.visit('/').then(() => {
      cy.get('[data-test=email]')
        .contains(_user.email)
        .should('exist');
      cy.get('[data-test=uid]')
        .contains(_user.uid)
        .should('exist');
    });
  });
});
