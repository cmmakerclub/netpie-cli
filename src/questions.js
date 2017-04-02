import inquirer from 'inquirer'

export function getCredentials (callback) {
  var questions = [
    {
      name: 'username',
      type: 'input',
      message: 'Enter your NETPIE username or e-mail address:',
      validate: function (value) {
        if (value.length) {
          return true
        } else {
          return 'Please enter your username or e-mail address'
        }
      }
    },
    {
      name: 'password',
      type: 'password',
      message: 'Enter your password:',
      validate: function (value) {
        if (value.length) {
          return true
        } else {
          return 'Please enter your password'
        }
      }
    }
  ]
  inquirer.prompt(questions).then(callback)
}
