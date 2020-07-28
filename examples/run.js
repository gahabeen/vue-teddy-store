const { exec } = require('child_process')

const args = process.argv.slice(2)
const path = require('path')
const fs = require('fs')
const [exampleApp] = args

function run() {
  const _path = path.resolve(__dirname, `./${exampleApp}/main.js`)
  if (fs.existsSync(_path)) {
    try {
      exec(`vue-cli-service serve ${_path} --port=7872`)
      console.log(`Running ${exampleApp} on port=7872`)
    } catch (error) {
      // console.error();
    }
  } else {
    console.error(`Can't run an unknown example at ${_path}`)
  }
}

run()
