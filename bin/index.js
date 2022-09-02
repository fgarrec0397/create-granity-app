#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs"
import latestVersion from "latest-version";

const gitRepo = "https://github.com/fgarrec0397/Granity.git";
const projectName = process.argv[2];
const gitCheckoutCommand = `git clone --depth 1 ${gitRepo} ${projectName}`;
const installDepsCommand = `cd ${projectName} && npm install && cd app && npm install && cd ../server && npm install`

const itemsToDelete = [
    "CODE_OF_CONDUCT.md",
    "CONTRIBUTING.md",
    "LICENSE",
    ".git",
    ".github",
]

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

const deleteItem = async (dir, logDeletedItem) => {
    await fs.rm(dir, { recursive: true }, err => {
        if (err) {
          throw err
        }
      
        if (logDeletedItem) {
            console.log(`${dir} is deleted!`)
        }
      })
}

const deleteItems = async (items, logDeletedItem) => {
    await items.forEach(async x => {
        await deleteItem(`${projectName}/${x}`, logDeletedItem);
    });
}

const exit = (withError) => {
    displayMessage("Process has terminated.")
    process.exit(withError ? 1 : 0);    
};

const handleStart = async () => {
    const granityCLILastVersion = await latestVersion("granity");
    displayMessage(`Welcome to create-granity-app!`);
    displayMessage(`You are currently running the v${granityCLILastVersion} CLI runner.`);
    displayMessage("Enjoy the ride, you're almost there...");
};

const cloneRepository = () => {
    displayMessage(`Cloning the repositery with name ${projectName}`);
    
    const checkedOut = runCommand(gitCheckoutCommand);
    
    if (!checkedOut) {
        exit(true);
    }
}

const cleanUpRepo = async () => {
    displayMessage("Hold on! Just removing our crap for you...");

    await deleteItems(itemsToDelete);
}

const installDependencies = () => {
    displayMessage(`Installing dependencies for ${projectName}`);
    
    const installingCommand = runCommand(installDepsCommand);
    
    if (!installingCommand) {
        exit(true);
    }
};

const handleFinish = async () => {
    const granityLastVersion = await latestVersion("granity");

    console.log();
    console.log(`Congratulation! You are now ready to work with Granity v${granityLastVersion}`);
    console.log();
    console.log("You should start by setting up your MongoDB then run the following command:")
    console.log();
    console.log(`cd ${projectName} && npm run dev`)
    console.log();
    console.log();
};

const init = async () => {
    await handleStart();
    cloneRepository();
    await cleanUpRepo();
    installDependencies();
    await handleFinish();
};

init();
