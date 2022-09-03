#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs"
import latestVersion from "latest-version";

const gitRepo = "https://github.com/fgarrec0397/Granity.git";
const projectName = process.argv[2];
const gitCheckoutCommand = `git clone --depth 1 ${gitRepo} ${projectName}`;
const installDepsCommand = `cd ${projectName} && npm install && cd app && npm install && cd ../server && npm install`;

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
const runCommand = command => {
    try {
        execSync(`${command}`, { stdio: "inherit" });
    } catch (error) {
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
const deleteItem = (item, logDeletedItem) => {
    fs.rm(item, { recursive: true }, err => {
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
const deleteItems = (items, logDeletedItem) => {
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
 * <------------------------------- CLI ACTIONS ------------------------------->
 */

const handleStart = async () => {
    const granityCLILastVersion = await latestVersion("create-granity-app");
    displayMessage(`Welcome to create-granity-app!`);
    displayMessage(`You are currently running the v${granityCLILastVersion} CLI runner.`);
};

const cloneRepository = () => {
    displayMessage(`Cloning the repositery with name ${projectName}`);
    
    const checkedOut = runCommand(gitCheckoutCommand);
    
    if (!checkedOut) {
        exit(true);
    }
}

const cleanUpRepo = () => {
    displayMessage("Hold on! Just removing our crap for you...");

    deleteItems(itemsToDelete);
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
    cleanUpRepo();
    setupFolder();
    installDependencies();
};

init();
