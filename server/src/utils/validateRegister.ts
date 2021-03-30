import { UserInput } from "../resolvers/UserInput"

export const validateRegister = ({ email, username, password }: UserInput) => {
  // TODO: Use regex
  if (!email.includes('@')) {
    return [{
      field: 'email',
      message: 'Not a valid email'
    }];

  }

  if (username.length <= 2) {
    return [{
      field: 'username',
      message: 'Username length must be greater than 2'
    }];

  }

  if (username.includes('@')) {
    return [{
      field: 'username',
      message: 'Username cannot include @'
    }];

  }

  if (password.length <= 3) {
    return [{
      field: 'password',
      message: 'Password length must be greater than 3'
    }];
  }

  return null;
}
