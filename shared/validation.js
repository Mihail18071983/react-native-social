export function emailValidation(state) {
  const rjx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValidEmail = rjx.test(state.email);
  if (!isValidEmail) {
    alert("Email must contain at least 1 numeric, 1 alphabatic and simbol @");
    return false;
  } else return true;
}

export function loginValidation(state) {
  const rjx = /^[a-zA-Zа-яА-Я]+(([' -][a-zA-Zа-яА-Я ])?[a-zA-Zа-яА-Я]*)*$/;
  const isValidLogin = rjx.test(state.login);
  if (!isValidLogin) {
    alert("Login may contain only letters, apostrophe, dash and spaces.");
    return false;
  } else {
    return true;
  }
}

export function passwordValidation(state) {
  const rjx = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  const isValidPassword = rjx.test(state.password);
  if (!isValidPassword) {
    alert(
      "Password may contain only numeric and afphabetic characters. And must be at least 6 characters long."
    );
    return false;
  } else {
    return true;
  }
}
