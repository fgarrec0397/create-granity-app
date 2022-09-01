#!/usr/bin/env node

const { execSync } = require("child_process");
// const latestVersion = require("latest-version");
const fs = require('fs');

const displayMessage = (text) => {
    console.log();
    console.log(text);
    console.log();
}

const runCommand = command => {
    try {
        execSync(`${command}`, { stdio: "inherit" });
    } catch (error) {
        displayMessage(`Failed to execute ${command}`, error);
        
        return false;
    }
    
    return true;
};

const deletefile = (file) => {
    fs.unlink(file, (err) => {
        if (err) {
            throw err;
        }

        console.log("File is deleted.");
    });
};

const exit = (withError) => {
    displayMessage("Process has terminated.")
    process.exit(withError ? 1 : 0);    
};

const gitRepo = "https://github.com/fgarrec0397/Granity.git";
const projectName = process.argv[2];
const gitCheckoutCommand = `git clone --depth 1 ${gitRepo} ${projectName}`;
const installDepsCommand = `cd ${projectName} && npm install && cd app && npm install && cd ../server && npm install`

console.log("last version is 1.0.14")

// const spinner = ora().start('Ensuring latest version');
// const latestVer = await latestVersion('gev');
// if (compareSemver(VERSION, latestVer) === -1) {
//   spinner.info(`The current version of gev [${chalk.keyword('brown')(VERSION)}] is lower than the latest available version [${chalk.yellow(latestVer)}]. Recalling gev with @latest...`);
//   const rawProgramArgs = process.argv.slice(2);
//   await execa('npx', ['gev@latest', '--no-check-latest', ...rawProgramArgs], { env: {
//     npm_config_yes: 'true', // https://github.com/npm/cli/issues/2226#issuecomment-732475247
//   } });
//   return;
// } else { // Same version. We are running the latest one!
//   spinner.succeed();
// }

const cloneRepository = () => {
    displayMessage(`Cloning the repositery with name ${projectName}`);
    
    const checkedOut = runCommand(gitCheckoutCommand);
    
    if (!checkedOut) {
        exit(true);
    }
}

const cleanUpRepo = () => {
    displayMessage("Hold on! Just removing our crap for you...");

    // delete a file
    deletefile("CODE_OF_CONDUCT.md");
    
}

const installDependencies = () => {
    console.log(`Installing dependencies for ${projectName}`);
    
    const installingCommand = runCommand(installDepsCommand);
    
    if (!installingCommand) {
        exit(true);
    }
};

const init = () => {
    cloneRepository();
    cleanUpRepo();
    // installDependencies();
};


console.log(`Congratulation! You are now ready to work`);

init();