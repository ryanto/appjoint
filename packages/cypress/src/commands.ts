/// <reference types="cypress" />

import { TestUserAccount, TestCurrentUserAccount } from '@appjoint/react';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login as a user
       * @example cy.loginAs({ email: 'ryanto@gmail.com', role: 'admin' })
       */
      loginAs(value: TestCurrentUserAccount | null): Chainable<Element>;

      /**
       * Add a user so you can test your login form
       * @example cy.addUser({ email: 'ryanto@gmail.com', password: 'hello' })
       */
      addUser(value: TestUserAccount): Chainable<Element>;

      /**
       * Reset test users created during test
       * @example cy.resetAppjointUsers()
       */
      resetAppJointUsers(): Chainable<Element>;
    }
  }
}

export const setupAppJoint = () => {
  let loginAsUser: TestCurrentUserAccount | null;
  let users: TestUserAccount[] = [];

  beforeEach(() => {
    cy.resetAppJointUsers();
  });

  Cypress.Commands.add('loginAs', (user: TestCurrentUserAccount | null) => {
    loginAsUser = user;
  });

  Cypress.on('window:before:load', (win: any) => {
    win.APPJOINT_USER_ACCOUNTS = [...users];
    win.APPJOINT_GET_CURRENT_USER = () => {
      return loginAsUser;
    };
  });

  Cypress.Commands.add('addUser', user => {
    users = [...users, user];
  });

  Cypress.Commands.add('resetAppJointUsers', () => {
    cy.loginAs(null);
    users = [];
  });
};
