#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs"
import latestVersion from "latest-version";

const appName = "granity";
const packageName = `create-${appName}-app`;
const gitURL = `https://github.com/fgarrec0397/${appName}`;
const gitRepo = `${gitURL}.git`;
const projectName = process.argv[2];
const gitCheckoutCommand = `git clone --depth 1 ${gitRepo} ${projectName}`;
const installDepsCommand = `cd ${projectName} && npm install && cd app && npm install && cd ../server && npm install`;
const gitInitCommand = `cd ${projectName} && git init`;

const itemsToDelete = [
    ".git",
    ".github",
    "CODE_OF_CONDUCT.md",
    "CONTRIBUTING.md",
    "LICENSE",
]

/**
 * <------------------------------- UTILITIES ------------------------------->
 */

/**
 * 
 * @param {string} text 
 */
const displayMessage = (text) => {
    console.log();
    console.log(text);
    console.log();
}

/**
 * 
 * @param {string} command The command to run 
 * @returns {boolean} Returns true if the command has been executed with success
 */
const runCommand = (command, fallbackCommand) => {
    try {
        execSync(`${command}`, { stdio: "inherit" });
    } catch (error) {

        if (fallbackCommand) {
            try {
                execSync(`${fallbackCommand}`, { stdio: "inherit" });
            } catch (error) {
                displayMessage(`Failed to execute ${fallbackCommand}`, error);
                
                return false;
            }

            return true;
        }

        displayMessage(`Failed to execute ${command}`, error);
        
        return false;
    }
    
    return true;
};

/**
 * 
 * @param {string} item Item to delete, can be a file or a folder
 * @param {boolean} logDeletedItem If set to true, it will log the deleted item  
 */
const deleteItem = async (item, logDeletedItem) => {
    await fs.rm(item, { recursive: true }, err => {
        if (err) {
          throw err
        }
      
        if (logDeletedItem) {
            console.log(`${item} is deleted!`)
        }
      })
}

/**
 * 
 * @param {string[]} items Array of items to delete, can be a file, a folder or both
 * @param {boolean} logDeletedItem If set to true, it will log the deleted item  
 */
const deleteItems = async (items, logDeletedItem) => {
    items.forEach(x => {
        deleteItem(`${projectName}/${x}`, logDeletedItem);
    });
}

/**
 * Exit the process
 * @param {boolean} withError If set to true, exit the process with error 
 */
const exit = (withError) => {
    displayMessage("Process has terminated.")
    process.exit(withError ? 1 : 0);    
};

/**
 * A function to create the package.json file
 * @TODO Could extract the write function to keep this function more generic
 */
const createPackageJsonFile = () => {
    const packageJSONfileTemplate = `{\n  \"name\": \"${projectName}\",\n  \"version\": \"1.0.0\",\n  \"description\": \"My cool new game!\",\n  \"scripts\": {\n    \"server\": \"cd server && npm start\",\n    \"client\": \"cd app && npm start\",\n    \"dev\": \"concurrently \\\"npm run server\\\" \\\"npm run client\\\"\"\n  },\n  \"author\": \"\",\n  \"license\": \"MIT\",\n  \"devDependencies\": {\n    \"concurrently\": \"^7.3.0\"\n  }\n}\n`;

    fs.writeFile(`${projectName}/package.json`, packageJSONfileTemplate, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }

        displayMessage("package.json file created.")
    });

}

/**
 * Build a remote action command based on a name and a commandType. ("add" or "remove")
 * 
 * @param {string} remoteName - The given name of the remote
 * @param {"add"|"remove"} commandType - The action type of the command
 */
const gitBuildRemoteCommand = (remoteName, commandType) => {
    const url = commandType === "add" ? gitURL : "";

    return `cd ${projectName} && git remote ${commandType} ${remoteName} ${url}`
};

/**
 * Add a remote to the current git repository
 * 
 * @param {string} remoteName - The given name of the remote
 */
const addRemote = (remoteName) => {
    displayMessage(`Adding the ${remoteName} remote.`);

    const gitAddRemoteCommand = gitBuildRemoteCommand(remoteName, "add");
    
    const addRemoteCommand = runCommand(gitAddRemoteCommand);
    
    if (!addRemoteCommand) {
        exit(true);
    }
}

/**
 * Add a remote to the current git repository
 * 
 * @param {string} remoteName - The given name of the remote
 */
const removeRemote = (remoteName) => {
    displayMessage(`Adding the ${remoteName} remote.`);

    const gitRemoveRemoteCommand = gitBuildRemoteCommand(remoteName, "remove");
    
    const removeRemoteCommand = runCommand(gitRemoveRemoteCommand);
    
    if (!removeRemoteCommand) {
        exit(true);
    }
}


/**
 * <------------------------------- CLI ACTIONS ------------------------------->
 */

const handleStart = async () => {
    const packageLastVersion = await latestVersion(packageName);
    displayMessage(`Welcome to ${packageName}!`);
    displayMessage(`You are currently running the v${packageLastVersion} CLI runner.`);
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

const setupGit = () => {
    // Need to make cleaner. Don't know why fs.rm is asynchrone but can't apply await/async to get rid of these setTimeout
    setTimeout(() => {
        const reInitGit = runCommand(`cd ${projectName} && git init`);
        
        if (!reInitGit) {
            exit(true);
        }
        
        addRemote(appName);
    }, 10)
}

const setupFolder = () => {
    createPackageJsonFile();
    const templateReadMeContent = fs.readFileSync(`${projectName}/TEMPLATE_README.md`, 'utf-8');

    fs.writeFile(`${projectName}/README.md`, templateReadMeContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }

        displayMessage("README file setup.");
    });

    deleteItem(`${projectName}/TEMPLATE_README.md`);
}

const installDependencies = () => {
    // I know this is shit, but it will be fixed in a near future when I will have time
    setTimeout(async () => {
        displayMessage(`Installing dependencies for ${projectName}`);

        const installingCommand = runCommand(installDepsCommand);
        
        if (!installingCommand) {
            exit(true);
        }

        // When the setTimeout issue is fixed, move this down to the init function
        await handleFinish();
    }, 1000)
};

const handleFinish = async () => {
    const granityLastVersion = await latestVersion(appName);

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
    setupFolder();
    setupGit();
    // installDependencies();
};

init();
